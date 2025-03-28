using MongoDB.Driver;
using LoanManagement.API.Models;

namespace LoanManagement.API.Services
{
    public class MongoDBService
    {
        private readonly IMongoCollection<User> _userCollection;

        public MongoDBService(IConfiguration configuration)
        {
            var mongoClient = new MongoClient(configuration["MongoDbSettings:ConnectionString"]);
            var mongoDatabase = mongoClient.GetDatabase(configuration["MongoDbSettings:DatabaseName"]);
            _userCollection = mongoDatabase.GetCollection<User>("Users");
        }

        public async Task<List<User>> GetUsersAsync() =>
            await _userCollection.Find(_ => true).ToListAsync();

        public async Task<User> GetUserByIdAsync(string id) =>
            await _userCollection.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task CreateUserAsync(User user) =>
            await _userCollection.InsertOneAsync(user);

        public async Task UpdateUserAsync(string id, User user) =>
            await _userCollection.ReplaceOneAsync(x => x.Id == id, user);

        public async Task DeleteUserAsync(string id) =>
            await _userCollection.DeleteOneAsync(x => x.Id == id);
    }
}