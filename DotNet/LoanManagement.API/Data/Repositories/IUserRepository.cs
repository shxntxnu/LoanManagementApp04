using LoanManagement.API.Models;
using System.Threading.Tasks;

namespace LoanManagement.API.Data.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(string id); // Change Guid to string
        Task<IEnumerable<User>> GetAllAsync();
        Task AddAsync(User user);
        Task UpdateAsync(string id, User user); // Change Guid to string
        Task DeleteAsync(string id); // Change Guid to string
    }
}