using LoanManagement.API.Models;
using System.Threading.Tasks;

namespace LoanManagement.API.Data.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(string id);
        Task<User?> GetByEmailAsync(string email);
        Task<IEnumerable<User>> GetAllAsync();
        Task AddAsync(User user);
        Task UpdateAsync(string id, User user);
        Task DeleteAsync(string id);
    }
}