using System.ComponentModel.DataAnnotations;

namespace LoanManagement.API.Models
{
    public class User
    {
        [Key]
        public Guid Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public required string Name { get; set; }
        
        [Required]
        [EmailAddress]
        public required string Email { get; set; }
        
        [Required]
        public required string Password { get; set; } // Will store hashed password
        
        [Required]
        public required string Role { get; set; } // Admin, Borrower, Loan Officer
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLoginAt { get; set; }
    }
}