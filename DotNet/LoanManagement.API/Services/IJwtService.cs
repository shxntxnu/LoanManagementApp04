using LoanManagement.API.Models;

namespace LoanManagement.API.Services
{
    public interface IJwtService
    {
        string GenerateToken(User user);
    }
}