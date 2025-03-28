using System.ComponentModel.DataAnnotations;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace LoanManagement.API.Models
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = string.Empty;

        [BsonRequired]
        public string Name { get; set; } = string.Empty;

        [BsonRequired]
        public string Email { get; set; } = string.Empty;

        [BsonRequired]
        public string Password { get; set; } = string.Empty;

        [BsonRequired]
        public string Role { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime? LastLoginAt { get; set; }
    }
}