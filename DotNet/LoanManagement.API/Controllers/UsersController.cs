using LoanManagement.API.Data.Repositories;
using LoanManagement.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LoanManagement.API.Controllers
{
    [Route("api/users")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class UsersController : ControllerBase
    {
        private readonly IUserRepository _userRepository;

        public UsersController(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<IEnumerable<User>>>> GetAllUsers()
        {
            var users = await _userRepository.GetAllAsync();

            // Don't return passwords
            var sanitizedUsers = users.Select(u => new
            {
                u.Id,
                u.Name,
                u.Email,
                u.Role
            });

            return Ok(ApiResponse<object>.SuccessResponse(sanitizedUsers, "Users retrieved successfully"));
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<User>>> GetUser(Guid id)
        {
            var user = await _userRepository.GetByIdAsync(id);

            if (user == null)
            {
                return NotFound(ApiResponse<User>.ErrorResponse("User not found"));
            }

            // Don't return password
            var sanitizedUser = new
            {
                user.Id,
                user.Name,
                user.Email,
                user.Role
            };

            return Ok(ApiResponse<object>.SuccessResponse(sanitizedUser, "User retrieved successfully"));
        }
    }
}