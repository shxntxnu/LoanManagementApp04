using LoanManagement.API.Models;

namespace LoanManagement.API.Data.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(Guid id);
        Task<User?> GetByEmailAsync(string email);
        Task<IEnumerable<User>> GetAllAsync();
        Task<User> CreateAsync(User user);
        Task<bool> EmailExistsAsync(string email);
    }
}