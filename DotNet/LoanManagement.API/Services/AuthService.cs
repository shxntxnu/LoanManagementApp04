using LoanManagement.API.Models;
using LoanManagement.API.Data.Repositories;
using MongoDB.Bson;

namespace LoanManagement.API.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IJwtService _jwtService;

        public AuthService(IUserRepository userRepository, IJwtService jwtService)
        {
            _userRepository = userRepository;
            _jwtService = jwtService;
        }

        public async Task<AuthResponse?> RegisterAsync(RegisterRequest request)
        {
            try
            {
                // Validate if user already exists
                var existingUser = await _userRepository.GetByEmailAsync(request.Email);
                if (existingUser != null)
                {
                    return null;
                }

                // Create new user
                var user = new User
                {
                    Id = ObjectId.GenerateNewId().ToString(),
                    Name = request.Name ?? throw new ArgumentNullException(nameof(request.Name)),
                    Email = request.Email ?? throw new ArgumentNullException(nameof(request.Email)),
                    Password = BCrypt.Net.BCrypt.HashPassword(request.Password),
                    Role = request.Role ?? "Borrower"
                };

                await _userRepository.AddAsync(user);

                // Generate JWT token
                var token = _jwtService.GenerateToken(user);

                return new AuthResponse
                {
                    Token = token,
                    User = new UserDto
                    {
                        Id = user.Id,
                        Name = user.Name,
                        Email = user.Email,
                        Role = user.Role
                    }
                };
            }
            catch
            {
                return null;
            }
        }

        public async Task<AuthResponse?> LoginAsync(LoginRequest request)
        {
            try
            {
                var user = await _userRepository.GetByEmailAsync(request.Email);
                if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.Password))
                {
                    return null;
                }

                var token = _jwtService.GenerateToken(user);

                return new AuthResponse
                {
                    Token = token,
                    User = new UserDto
                    {
                        Id = user.Id,
                        Name = user.Name,
                        Email = user.Email,
                        Role = user.Role
                    }
                };
            }
            catch
            {
                return null;
            }
        }
    }
}