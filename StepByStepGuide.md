# Loan Management System Implementation Guide

Based on the provided document, I'll create a detailed step-by-step guide for implementing the Loan Management System with SQL database. This guide is structured for beginners across the three main integration areas.

## Backend Integration

### Phase 1: Environment Setup

1. **Set up your development environment**
   - Install Visual Studio (for ASP.NET Core development)
   - Install Node.js and npm (for Express.js development)
   - Install Git for version control
   - Install SQL Server (Express edition is free for development)
   - Install SQL Server Management Studio (SSMS) for database management

2. **Create project structure**
   ```
   LoanManagementSystem/
   ├── Backend/
   │   ├── UserManagement/ (ASP.NET Core project)
   │   └── LoanManagement/ (Node.js project)
   ├── Database/
   │   └── Scripts/ (SQL scripts)
   └── Frontend/
       └── Web/ (UI project)
   ```

3. **Initialize Git repository**
   ```bash
   git init
   git add .
   git commit -m "Initial project structure"
   ```

### Phase 2: ASP.NET Core API (User Management)

1. **Create ASP.NET Core Web API project**
   - Open Visual Studio
   - Create new ASP.NET Core Web API project in the `UserManagement` folder
   - Select .NET 6.0 or later

2. **Install NuGet packages**
   ```
   Microsoft.EntityFrameworkCore.SqlServer
   Microsoft.EntityFrameworkCore.Tools
   Microsoft.AspNetCore.Authentication.JwtBearer
   ```

3. **Create models**
   ```csharp
   // Models/User.cs
   public class User
   {
       public Guid Id { get; set; }
       public string Name { get; set; }
       public string Email { get; set; }
       public string Password { get; set; } // Will store hashed password
       public string Role { get; set; } // Admin, Borrower, Loan Officer
   }
   ```

4. **Create database context**
   ```csharp
   // Data/ApplicationDbContext.cs
   public class ApplicationDbContext : DbContext
   {
       public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
           : base(options) { }
           
       public DbSet<User> Users { get; set; }
       
       protected override void OnModelCreating(ModelBuilder modelBuilder)
       {
           // Configure User entity
           modelBuilder.Entity<User>()
               .HasIndex(u => u.Email)
               .IsUnique();
               
           // Set constraints
           modelBuilder.Entity<User>()
               .Property(u => u.Name)
               .IsRequired()
               .HasMaxLength(100);
               
           modelBuilder.Entity<User>()
               .Property(u => u.Email)
               .IsRequired()
               .HasMaxLength(255);
               
           modelBuilder.Entity<User>()
               .Property(u => u.Password)
               .IsRequired()
               .HasMaxLength(255);
       }
   }
   ```

5. **Set up JWT authentication**
   ```csharp
   // Add to Program.cs or Startup.cs
   services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
       .AddJwtBearer(options =>
       {
           options.TokenValidationParameters = new TokenValidationParameters
           {
               ValidateIssuer = true,
               ValidateAudience = true,
               ValidateLifetime = true,
               ValidateIssuerSigningKey = true,
               ValidIssuer = Configuration["Jwt:Issuer"],
               ValidAudience = Configuration["Jwt:Audience"],
               IssuerSigningKey = new SymmetricSecurityKey(
                   Encoding.UTF8.GetBytes(Configuration["Jwt:Key"]))
           };
       });
   ```

6. **Implement controllers**
   ```csharp
   // Controllers/AuthController.cs
   [Route("api/auth")]
   [ApiController]
   public class AuthController : ControllerBase
   {
       private readonly ApplicationDbContext _context;
       private readonly IConfiguration _configuration;
       
       public AuthController(ApplicationDbContext context, IConfiguration configuration)
       {
           _context = context;
           _configuration = configuration;
       }
       
       [HttpPost("register")]
       public async Task<IActionResult> Register([FromBody] RegisterModel model)
       {
           // Check if user exists
           if (_context.Users.Any(u => u.Email == model.Email))
               return BadRequest("User with this email already exists");
               
           // Create new user
           var user = new User
           {
               Id = Guid.NewGuid(),
               Name = model.Name,
               Email = model.Email,
               Password = HashPassword(model.Password), // Implement password hashing
               Role = "Borrower" // Default role
           };
           
           _context.Users.Add(user);
           await _context.SaveChangesAsync();
           
           return Ok(new { message = "User registered successfully" });
       }
       
       [HttpPost("login")]
       public async Task<IActionResult> Login([FromBody] LoginModel model)
       {
           // Find user and validate password
           var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == model.Email);
           if (user == null || !VerifyPassword(model.Password, user.Password))
               return Unauthorized("Invalid credentials");
               
           // Generate JWT token
           var token = GenerateJwtToken(user);
           
           return Ok(new { token });
       }
       
       // Implement password hashing, verification, and token generation methods
   }
   
   // Controllers/UsersController.cs
   [Route("api/users")]
   [ApiController]
   [Authorize(Roles = "Admin")]
   public class UsersController : ControllerBase
   {
       private readonly ApplicationDbContext _context;
       
       public UsersController(ApplicationDbContext context)
       {
           _context = context;
       }
       
       [HttpGet]
       public async Task<ActionResult<IEnumerable<User>>> GetUsers()
       {
           var users = await _context.Users.ToListAsync();
           return Ok(users);
       }
   }
   ```

### Phase 3: Express.js API (Loan Management)

1. **Initialize Node.js project**
   ```bash
   cd LoanManagement
   npm init -y
   ```

2. **Install dependencies**
   ```bash
   npm install express cors dotenv sequelize tedious jsonwebtoken
   npm install nodemon --save-dev
   ```

3. **Set up project structure**
   ```
   LoanManagement/
   ├── config/
   │   └── database.js
   ├── models/
   │   └── loan.js
   ├── routes/
   │   └── loans.js
   ├── middleware/
   │   └── auth.js
   ├── controllers/
   │   └── loanController.js
   ├── .env
   └── server.js
   ```

4. **Create database configuration**
   ```javascript
   // config/database.js
   const { Sequelize } = require('sequelize');
   require('dotenv').config();

   const sequelize = new Sequelize(
     process.env.DB_NAME,
     process.env.DB_USER,
     process.env.DB_PASSWORD,
     {
       host: process.env.DB_HOST,
       dialect: 'mssql',
       dialectOptions: {
         options: {
           encrypt: true,
           trustServerCertificate: true,
         },
       },
     }
   );

   module.exports = sequelize;
   ```

5. **Define loan model**
   ```javascript
   // models/loan.js
   const { DataTypes } = require('sequelize');
   const sequelize = require('../config/database');

   const Loan = sequelize.define('Loan', {
     id: {
       type: DataTypes.UUID,
       defaultValue: DataTypes.UUIDV4,
       primaryKey: true
     },
     user_id: {
       type: DataTypes.UUID,
       allowNull: false
     },
     amount: {
       type: DataTypes.DECIMAL(10, 2),
       allowNull: false
     },
     status: {
       type: DataTypes.ENUM,
       values: ['Pending', 'Approved', 'Rejected', 'Disbursed'],
       defaultValue: 'Pending'
     },
     created_at: {
       type: DataTypes.DATE,
       defaultValue: DataTypes.NOW
     }
   });

   module.exports = Loan;
   ```

6. **Create authentication middleware**
   ```javascript
   // middleware/auth.js
   const jwt = require('jsonwebtoken');
   require('dotenv').config();

   module.exports = (req, res, next) => {
     try {
       const token = req.headers.authorization.split(' ')[1];
       const decoded = jwt.verify(token, process.env.JWT_SECRET);
       req.userData = decoded;
       next();
     } catch (error) {
       return res.status(401).json({
         message: 'Authentication failed'
       });
     }
   };
   ```

7. **Implement loan controller**
   ```javascript
   // controllers/loanController.js
   const Loan = require('../models/loan');

   exports.applyLoan = async (req, res) => {
     try {
       const { amount } = req.body;
       const userId = req.userData.userId;
       
       const loan = await Loan.create({
         user_id: userId,
         amount,
         status: 'Pending'
       });
       
       res.status(201).json({
         message: 'Loan application submitted successfully',
         loan
       });
     } catch (error) {
       res.status(500).json({
         message: 'Failed to submit loan application',
         error: error.message
       });
     }
   };

   exports.getLoan = async (req, res) => {
     try {
       const loan = await Loan.findByPk(req.params.id);
       
       if (!loan) {
         return res.status(404).json({
           message: 'Loan not found'
         });
       }
       
       res.status(200).json(loan);
     } catch (error) {
       res.status(500).json({
         message: 'Failed to get loan details',
         error: error.message
       });
     }
   };

   exports.approveLoan = async (req, res) => {
     try {
       const loan = await Loan.findByPk(req.params.id);
       
       if (!loan) {
         return res.status(404).json({
           message: 'Loan not found'
         });
       }
       
       if (req.userData.role !== 'Loan Officer') {
         return res.status(403).json({
           message: 'Only Loan Officers can approve loans'
         });
       }
       
       loan.status = 'Approved';
       await loan.save();
       
       res.status(200).json({
         message: 'Loan approved successfully',
         loan
       });
     } catch (error) {
       res.status(500).json({
         message: 'Failed to approve loan',
         error: error.message
       });
     }
   };

   exports.rejectLoan = async (req, res) => {
     try {
       const loan = await Loan.findByPk(req.params.id);
       
       if (!loan) {
         return res.status(404).json({
           message: 'Loan not found'
         });
       }
       
       if (req.userData.role !== 'Loan Officer') {
         return res.status(403).json({
           message: 'Only Loan Officers can reject loans'
         });
       }
       
       loan.status = 'Rejected';
       await loan.save();
       
       res.status(200).json({
         message: 'Loan rejected successfully',
         loan
       });
     } catch (error) {
       res.status(500).json({
         message: 'Failed to reject loan',
         error: error.message
       });
     }
   };
   ```

8. **Set up routes**
   ```javascript
   // routes/loans.js
   const express = require('express');
   const router = express.Router();
   const loanController = require('../controllers/loanController');
   const auth = require('../middleware/auth');

   router.post('/apply', auth, loanController.applyLoan);
   router.get('/:id', auth, loanController.getLoan);
   router.put('/:id/approve', auth, loanController.approveLoan);
   router.put('/:id/reject', auth, loanController.rejectLoan);

   module.exports = router;
   ```

9. **Create server entry point**
   ```javascript
   // server.js
   const express = require('express');
   const cors = require('cors');
   const sequelize = require('./config/database');
   const loanRoutes = require('./routes/loans');
   require('dotenv').config();

   const app = express();
   const PORT = process.env.PORT || 3000;

   app.use(cors());
   app.use(express.json());

   // Routes
   app.use('/api/loans', loanRoutes);

   // Sync database
   sequelize.sync()
     .then(() => {
       console.log('Database synced successfully');
       app.listen(PORT, () => {
         console.log(`Server running on port ${PORT}`);
       });
     })
     .catch(err => {
       console.error('Failed to sync database:', err);
     });
   ```

10. **Create .env file**
    ```
    DB_HOST=localhost
    DB_NAME=LoanManagementSystem
    DB_USER=sa
    DB_PASSWORD=YourPassword
    JWT_SECRET=YourJWTSecretKey
    PORT=3000
    ```

## Database Integration

### Phase 1: SQL Server Database Setup

1. **Create database**
   - Open SQL Server Management Studio
   - Connect to your SQL Server instance
   - Right-click on "Databases" folder and select "New Database"
   - Name it "LoanManagementSystem" and click OK

2. **Create database tables manually (alternative to ORM setup)**
   ```sql
   -- Create Users table
   CREATE TABLE Users (
       id UNIQUEIDENTIFIER PRIMARY KEY,
       name VARCHAR(100) NOT NULL,
       email VARCHAR(255) NOT NULL,
       password VARCHAR(255) NOT NULL,
       role VARCHAR(20) NOT NULL,
       CONSTRAINT UC_Email UNIQUE (email)
   );

   -- Create Loans table
   CREATE TABLE Loans (
       id UNIQUEIDENTIFIER PRIMARY KEY,
       user_id UNIQUEIDENTIFIER NOT NULL,
       amount DECIMAL(10,2) NOT NULL,
       status VARCHAR(20) NOT NULL,
       created_at DATETIME DEFAULT GETDATE(),
       CONSTRAINT FK_Loans_Users FOREIGN KEY (user_id) REFERENCES Users(id)
   );
   ```

3. **Add indices for performance**
   ```sql
   -- Add index on email for faster lookups
   CREATE INDEX IX_Users_Email ON Users(email);
   
   -- Add index on user_id for faster joins
   CREATE INDEX IX_Loans_UserId ON Loans(user_id);
   
   -- Add index on status for filtering
   CREATE INDEX IX_Loans_Status ON Loans(status);
   ```

### Phase 2: Database Connection Setup

1. **Configure ASP.NET Core database connection**
   ```json
   // appsettings.json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Database=LoanManagementSystem;User Id=sa;Password=YourPassword;TrustServerCertificate=True;"
     },
     "Jwt": {
       "Key": "YourSecretKeyForJwtAuth",
       "Issuer": "LoanManagementSystem",
       "Audience": "LoanManagementSystem"
     }
   }
   ```

2. **Configure Express.js database connection**
   ```
   // .env file (already created)
   DB_HOST=localhost
   DB_NAME=LoanManagementSystem
   DB_USER=sa
   DB_PASSWORD=YourPassword
   ```

### Phase 3: Database Management

1. **Create database migration for ASP.NET Core**
   ```bash
   # In Package Manager Console
   Add-Migration InitialCreate
   Update-Database
   ```

2. **Synchronize Sequelize models with database**
   ```javascript
   // Add to server.js
   sequelize.sync({ force: false })
     .then(() => console.log('Database synchronized'))
     .catch(err => console.error('Error synchronizing database:', err));
   ```

3. **Create seed data for testing**
   ```sql
   -- Create admin user (password: Admin123)
   INSERT INTO Users (id, name, email, password, role)
   VALUES (
       NEWID(),
       'Admin User',
       'admin@lms.com',
       'hashed_password_here', -- Store properly hashed password in production
       'Admin'
   );

   -- Create loan officer (password: Officer123)
   INSERT INTO Users (id, name, email, password, role)
   VALUES (
       NEWID(),
       'Loan Officer',
       'officer@lms.com',
       'hashed_password_here', -- Store properly hashed password in production
       'Loan Officer'
   );
   ```

## Frontend Integration

### Phase 1: Project Setup

1. **Set up a basic frontend project with HTML, CSS, and JavaScript**
   - Create folder structure in `Frontend/Web`
   - Create basic HTML files for each page

2. **Structure the frontend**
   ```
   Frontend/Web/
   ├── css/
   │   └── styles.css
   ├── js/
   │   ├── auth.js
   │   └── loans.js
   ├── pages/
   │   ├── login.html
   │   ├── register.html
   │   ├── dashboard.html
   │   └── loan-application.html
   └── index.html
   ```

### Phase 2: Implement Authentication Pages

1. **Create registration page**
   ```html
   <!-- register.html -->
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Register - Loan Management System</title>
       <link rel="stylesheet" href="../css/styles.css">
   </head>
   <body>
       <div class="container">
           <h1>Register</h1>
           <form id="registerForm">
               <div class="form-group">
                   <label for="name">Full Name</label>
                   <input type="text" id="name" name="name" required>
               </div>
               <div class="form-group">
                   <label for="email">Email</label>
                   <input type="email" id="email" name="email" required>
               </div>
               <div class="form-group">
                   <label for="password">Password</label>
                   <input type="password" id="password" name="password" required>
               </div>
               <div class="form-group">
                   <button type="submit">Register</button>
               </div>
           </form>
           <p>Already have an account? <a href="login.html">Login</a></p>
       </div>
       <script src="../js/auth.js"></script>
   </body>
   </html>
   ```

2. **Create login page**
   ```html
   <!-- login.html -->
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Login - Loan Management System</title>
       <link rel="stylesheet" href="../css/styles.css">
   </head>
   <body>
       <div class="container">
           <h1>Login</h1>
           <form id="loginForm">
               <div class="form-group">
                   <label for="email">Email</label>
                   <input type="email" id="email" name="email" required>
               </div>
               <div class="form-group">
                   <label for="password">Password</label>
                   <input type="password" id="password" name="password" required>
               </div>
               <div class="form-group">
                   <button type="submit">Login</button>
               </div>
           </form>
           <p>Don't have an account? <a href="register.html">Register</a></p>
       </div>
       <script src="../js/auth.js"></script>
   </body>
   </html>
   ```

3. **Implement authentication JavaScript**
   ```javascript
   // js/auth.js
   document.addEventListener('DOMContentLoaded', function() {
       // Registration form handler
       const registerForm = document.getElementById('registerForm');
       if (registerForm) {
           registerForm.addEventListener('submit', async function(e) {
               e.preventDefault();
               
               const name = document.getElementById('name').value;
               const email = document.getElementById('email').value;
               const password = document.getElementById('password').value;
               
               try {
                   const response = await fetch('http://localhost:5000/api/auth/register', {
                       method: 'POST',
                       headers: {
                           'Content-Type': 'application/json'
                       },
                       body: JSON.stringify({ name, email, password })
                   });
                   
                   const data = await response.json();
                   
                   if (response.ok) {
                       alert('Registration successful! Please login.');
                       window.location.href = 'login.html';
                   } else {
                       alert('Registration failed: ' + data.message);
                   }
               } catch (error) {
                   console.error('Error:', error);
                   alert('An error occurred during registration.');
               }
           });
       }
       
       // Login form handler
       const loginForm = document.getElementById('loginForm');
       if (loginForm) {
           loginForm.addEventListener('submit', async function(e) {
               e.preventDefault();
               
               const email = document.getElementById('email').value;
               const password = document.getElementById('password').value;
               
               try {
                   const response = await fetch('http://localhost:5000/api/auth/login', {
                       method: 'POST',
                       headers: {
                           'Content-Type': 'application/json'
                       },
                       body: JSON.stringify({ email, password })
                   });
                   
                   const data = await response.json();
                   
                   if (response.ok) {
                       // Store token in localStorage
                       localStorage.setItem('token', data.token);
                       
                       // Redirect based on user role (extracted from JWT)
                       const tokenData = parseJwt(data.token);
                       if (tokenData.role === 'Admin') {
                           window.location.href = 'admin-dashboard.html';
                       } else if (tokenData.role === 'Loan Officer') {
                           window.location.href = 'officer-dashboard.html';
                       } else {
                           window.location.href = 'dashboard.html';
                       }
                   } else {
                       alert('Login failed: ' + data.message);
                   }
               } catch (error) {
                   console.error('Error:', error);
                   alert('An error occurred during login.');
               }
           });
       }
       
       // Helper function to parse JWT
       function parseJwt(token) {
           const base64Url = token.split('.')[1];
           const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
           const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
               return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
           }).join(''));
           
           return JSON.parse(jsonPayload);
       }
   });
   ```

### Phase 3: Implement Loan Management Pages

1. **Create borrower dashboard**
   ```html
   <!-- dashboard.html -->
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Dashboard - Loan Management System</title>
       <link rel="stylesheet" href="../css/styles.css">
   </head>
   <body>
       <div class="container">
           <header>
               <h1>Borrower Dashboard</h1>
               <button id="logoutBtn">Logout</button>
           </header>
           
           <section class="dashboard-section">
               <h2>Your Loans</h2>
               <div id="loansList">
                   <!-- Loans will be listed here -->
                   <p class="loading">Loading your loans...</p>
               </div>
               
               <div class="action-buttons">
                   <a href="loan-application.html" class="button">Apply for New Loan</a>
               </div>
           </section>
       </div>
       <script src="../js/loans.js"></script>
   </body>
   </html>
   ```

2. **Create loan application page**
   ```html
   <!-- loan-application.html -->
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Apply for Loan - Loan Management System</title>
       <link rel="stylesheet" href="../css/styles.css">
   </head>
   <body>
       <div class="container">
           <header>
               <h1>Apply for Loan</h1>
               <a href="dashboard.html" class="back-link">Back to Dashboard</a>
           </header>
           
           <form id="loanApplicationForm">
               <div class="form-group">
                   <label for="amount">Loan Amount ($)</label>
                   <input type="number" id="amount" name="amount" min="1000" step="100" required>
               </div>
               
               <div class="form-group">
                   <button type="submit">Submit Application</button>
               </div>
           </form>
       </div>
       <script src="../js/loans.js"></script>
   </body>
   </html>
   ```

3. **Create loan officer dashboard**
   ```html
   <!-- officer-dashboard.html -->
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Loan Officer Dashboard - Loan Management System</title>
       <link rel="stylesheet" href="../css/styles.css">
   </head>
   <body>
       <div class="container">
           <header>
               <h1>Loan Officer Dashboard</h1>
               <button id="logoutBtn">Logout</button>
           </header>
           
           <section class="dashboard-section">
               <h2>Pending Loan Applications</h2>
               <div id="pendingLoansList">
                   <!-- Pending loans will be listed here -->
                   <p class="loading">Loading pending applications...</p>
               </div>
           </section>
       </div>
       <script src="../js/loans.js"></script>
   </body>
   </html>
   ```

4. **Implement loan management JavaScript**
   ```javascript
   // js/loans.js
   document.addEventListener('DOMContentLoaded', function() {
       // Check if user is logged in
       const token = localStorage.getItem('token');
       if (!token) {
           window.location.href = 'login.html';
           return;
       }
       
       // Handle logout
       const logoutBtn = document.getElementById('logoutBtn');
       if (logoutBtn) {
           logoutBtn.addEventListener('click', function() {
               localStorage.removeItem('token');
               window.location.href = 'login.html';
           });
       }
       
       // Load user's loans on dashboard
       const loansList = document.getElementById('loansList');
       if (loansList) {
           loadUserLoans();
       }
       
       // Load pending loans for loan officer
       const pendingLoansList = document.getElementById('pendingLoansList');
       if (pendingLoansList) {
           loadPendingLoans();
       }
       
       // Handle loan application form
       const loanApplicationForm = document.getElementById('loanApplicationForm');
       if (loanApplicationForm) {
           loanApplicationForm.addEventListener('submit', applyForLoan);
       }
       
       // Function to load user's loans
       async function loadUserLoans() {
           try {
               const response = await fetch('http://localhost:3000/api/loans/user', {
                   method: 'GET',
                   headers: {
                       'Authorization': `Bearer ${token}`
                   }
               });
               
               if (response.ok) {
                   const loans = await response.json();
                   
                   if (loans.length === 0) {
                       loansList.innerHTML = '<p>You have no loans. Apply for a new loan to get started.</p>';
                   } else {
                       let html = '<table class="loans-table">';
                       html += '<thead><tr><th>Loan ID</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>';
                       html += '<tbody>';
                       
                       loans.forEach(loan => {
                           html += `<tr>
                               <td>${loan.id.substring(0, 8)}...</td>
                               <td>$${loan.amount.toFixed(2)}</td>
                               <td><span class="status-${loan.status.toLowerCase()}">${loan.status}</span></td>
                               <td>${new Date(loan.created_at).toLocaleDateString()}</td>
                           </tr>`;
                       });
                       
                       html += '</tbody></table>';
                       loansList.innerHTML = html;
                   }
               } else {
                   const error = await response.json();
                   loansList.innerHTML = `<p class="error">Error loading loans: ${error.message}</p>`;
               }
           } catch (error) {
               console.error('Error:', error);
               loansList.innerHTML = '<p class="error">Failed to load loans. Please try again later.</p>';
           }
       }
       
       // Function to load pending loans for loan officer
       async function loadPendingLoans() {
           try {
               const response = await fetch('http://localhost:3000/api/loans/pending', {
                   method: 'GET',
                   headers: {
                       'Authorization': `Bearer ${token}`
                   }
               });
               
               if (response.ok) {
                   const loans = await response.json();
                   
                   if (loans.length === 0) {
                       pendingLoansList.innerHTML = '<p>No pending loan applications.</p>';
                   } else {
                       let html = '<table class="loans-table">';
                       html += '<thead><tr><th>Loan ID</th><th>Borrower</th><th>Amount</th><th>Date</th><th>Actions</th></tr></thead>';
                       html += '<tbody>';
                       
                       loans.forEach(loan => {
                           html += `<tr>
                               <td>${loan.id.substring(0, 8)}...</td>
                               <td>${loan.borrower_name}</td>
                               <td>$${loan.amount.toFixed(2)}</td>
                               <td>${new Date(loan.created_at).toLocaleDateString()}</td>
                               <td>
                                   <button class="approve-btn" data-id="${loan.id}">Approve</button>
                                   <button class="reject-btn" data-id="${loan.id}">Reject</button>
                               </td>
                           </tr>`;
                       });
                       
                       html += '</tbody></table>';
                       pendingLoansList.innerHTML = html;
                       
                       // Add event listeners to approve/reject buttons
                       document.querySelectorAll('.approve-btn').forEach(btn => {
                           btn.addEventListener('click', (e) => approveLoan(e.target.dataset.id));
                       });
                       
                       document.querySelectorAll('.reject-btn').forEach(btn => {
                           btn.addEventListener('click', (e) => rejectLoan(e.target.dataset.id));
                       });
                   }
               } else {
                   const error = await response.json();
                   pendingLoansList.innerHTML = `<p class="error">Error loading applications: ${error.message}</p>`;
               }
           } catch (error) {
               console.error('Error:', error);
               pendingLoansList.innerHTML = '<p class="error">Failed to load applications. Please try again later.</p>';
           }
       }
       
       // Function to apply for a new loan
       async function applyForLoan(e) {
           e.preventDefault();
           
           const amount = document.getElementById('amount').value;
           
           try {
               const response = await fetch('http://localhost:3000/api/loans/apply', {
                   method: 'POST',
                   headers: {
                       'Content-Type': 'application/json',
                       'Authorization': `Bearer ${token}`
                   },
                   body: JSON.stringify({ amount })
               });
               
               const data = await response.json();
               
               if (response.ok) {
                   alert('Loan application submitted successfully!');
                   window.location.href = 'dashboard.html';
               } else {
                   alert('Failed to submit loan application: ' + data.message);
               }
           } catch (error) {
               console.error('Error:', error);
               alert('An error occurred while submitting your loan application.');
           }
       }
       
       // Function to approve a loan
       async function approveLoan(loanId) {
           try {
               const response = await fetch(`http://localhost:3000/api/loans/${loanId}/approve`, {
                   method: 'PUT',
                   headers: {
                       'Authorization': `Bearer ${token}`
                   }
               });
               
               const data = await response.json();
               
               if (response.ok) {
                   alert('Loan approved successfully!');
                   loadPendingLoans(); // Refresh the list
               } else {
                   alert('Failed to approve loan: ' + data.message);
               }
           } catch (error) {
               console.error('Error:', error);
               alert('An error occurred while approving the loan.');
           }
       }
       
       // Function to reject a loan
       async function rejectLoan(loanId) {
           try {
               const response = await fetch(`http://localhost:3000/api/loans/${loanId}/reject`, {
                   method: 'PUT',
                   headers: {
                       'Authorization': `Bearer ${token}`
                   }
               });
               
               const data = await response.json();
               
               if (response.ok) {
                   alert('Loan rejected successfully!');
                   loadPendingLoans(); // Refresh the list
               } else {
                   alert('Failed to reject loan: ' + data.message);
               }
           } catch (error) {
               console.error('Error:', error);
               alert('An error occurred while rejecting the loan.');
           }
       }
   });
   ```

5. **Create CSS styles**
   ```css
   /* css/styles.css */
   * {
       box-sizing: border-box;
       margin: 0;
       padding: 0;
   }

   body {
       font-family: Arial, sans-serif;
       line-height: 1.6;
       color: #333;
       background-color: #f4f4f4;
   }

   .container {
       max-width: 1200px;
       margin: 0 auto;
       padding: 20px;
   }

   header {
       display: flex;
       justify-content: space-between;
       align-items: center;
       margin-bottom: 20px;
       padding-bottom: 10px;
       border-bottom: 1px solid #ddd;
   }

   h1 {
       color: #333;
   }

   h2 {
       margin-bottom: 15px;
   }

   .form-group {
       margin-bottom: 15px;
   }

   label {
       display: block;
       margin-bottom: 5px;
       font-weight: bold;
   }

   input[type="text"],
   input[type="email"],
   input[type="password"],
   input[type="number"] {
       width: 100%;
       padding: 10px;
       border: 1px solid #ddd;
       border-radius: 4px;
   }

   button, .button {
       display: inline-block;
       padding: 10px 15px;
       background: #4CAF50;
       color: white;
       border: none;
       border-radius: 4px;
       cursor: pointer;
       text-decoration: none;
       font-size: 16px;
   }

   button:hover, .button:hover {
       background: #45a049;
   }

   #logoutBtn {
       background: #f44336;
   }

   #logoutBtn:hover {
       background: #d32f2f;
   }

   .back-link {
       color: #666;
       text-decoration: none;
   }

   .back-link:hover {
       text-decoration: underline;
   }

   .dashboard-section {
       background: white;
       padding: 20px;
       border-radius: 4px;
       box-shadow: 0 2px 5px rgba(0,0,0,0.1);
   }

   .loans-table {
       width: 100%;
       border-collapse: collapse;
       margin-top: 10px;
   }

   .loans-table th, .loans-table td {
       padding: 12px;
       text-align: left;
       border-bottom: 1px solid #ddd;
   }

   .loans-table th {
       background-color: #f2f2f2;
   }

   .status-pending {
       color: #FFA000;
       font-weight: bold;
   }

   .status-approved {
       color: #4CAF50;
       font-weight: bold;
   }

   .status-rejected {
       color: #F44336;
       font-weight: bold;
   }

   .status-disbursed {
       color: #2196F3;
       font-weight: bold;
   }

   .approve-btn {
       background: #4CAF50;
       margin-right: 5px;
   }

   .reject-btn {
       background: #F44336;
   }

   .error {
       color: #F44336;
   }

   .loading {
       color: #666;
       font-style: italic;
   }

   a {
       color: #2196F3;
   }

   a:hover {
       text-decoration: underline;
   }
   ```

### Phase 4: Integration Testing

1. **Create a test plan**
   - Test user registration and login
   - Test loan application submission
   - Test loan approval and rejection processes
   - Test role-based access control

2. **Test user flows**
   - Register a new borrower
   - Login as a borrower and apply for a loan
   - Login as a loan officer and approve/reject loans
   - Login as an admin and view all users

3. **Troubleshoot common issues**
   - CORS errors: Make sure both backend servers have CORS enabled
   - Authentication errors: Check token handling and JWT configuration
   - Database connection issues: Verify connection strings and credentials

### Phase 5: Deployment

1. **Prepare for deployment**
   - Update all API URLs to production URLs
   - Ensure all security headers are in place
   - Configure proper error logging

2. **Deploy backend services**
   - Deploy ASP.NET Core API to Azure App Service
   - Deploy Express.js API to Azure App Service
   - Configure environment variables for production

3. **Deploy frontend**
   - Deploy static files to Azure Blob Storage or Azure Static Web Apps
   - Configure CDN for better performance

## Final Steps and Best Practices

1. **Security measures**
   - Implement HTTPS
   - Properly hash and salt passwords
   - Set secure cookie options
   - Implement rate limiting
   - Add input validation
   - Configure proper CORS settings

2. **Performance optimizations**
   - Add caching where appropriate
   - Minimize and bundle frontend assets
   - Optimize database queries with proper indices

3. **Monitoring and maintenance**
   - Set up logging with Application Insights
   - Create health check endpoints
   - Configure alerts for unusual activity

4. **Documentation**
   - Create API documentation
   - Document database schema
   - Create user manuals for different roles


   Key Implementation Points
Backend Integration

ASP.NET Core for User Management: Handles user registration, authentication with JWT, and role-based access control
Express.js for Loan Management: Manages loan applications, approvals, and rejections
Separation of Concerns: Each technology handles distinct features while working with the same database

Database Integration

SQL Server Database: Tables for Users and Loans with proper relationships
Entity Framework Core: For ASP.NET Core database access
Sequelize ORM: For Express.js database access
Performance Optimization: Includes indices for frequently queried columns

Frontend Integration

Simple HTML/CSS/JavaScript Frontend: User interfaces for all functionality
Role-Based UI: Different dashboards for borrowers, loan officers, and admins
JWT Authentication: Frontend authentication handling with token storage
Responsive Design: Styled for various device sizes

The guide provides step-by-step instructions with code examples for each component, making it accessible for beginners. I've included details on project structure, implementation sequence, and best practices for security and performance.








### 27/03/2025

I'll help you analyze each part of the system and provide a comprehensive guide. Let me start by examining each directory to understand the components.

Ran tool

Ran tool

Ran tool
Let me check the database configuration and connection settings in each project to ensure they align with SQL Server Express.

Read file: DotNet/LoanManagement.API/appsettings.json

Read file: NodeJS/loan-service/.env
Based on my analysis, I'll provide a comprehensive guide on setting up and integrating all three components. Let's break this down into steps:

1. **Database Setup**
First, we need to modify the database configurations to use SQL Server Express consistently:

For the .NET API, the configuration is already correct, matching the SQL Server Express instance shown in your image.

For the Node.js service, we need to change from SQLite to SQL Server. I'll help modify this:

```properties:NodeJS/loan-service/.env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_HOST=SHANTANU\SQLEXPRESS
DB_NAME=LoanManagement01
DB_USER=SHANTANU\shant
DB_DIALECT=mssql
DB_TRUSTED_CONNECTION=true
DB_ENCRYPT=false

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h
```
Now, let me provide a step-by-step guide for setting up and running each component:

### 1. Setting up the .NET API (Backend)

1. Navigate to the `DotNet/LoanManagement.API/` directory
2. Run the following commands:
```bash
dotnet restore
dotnet ef database update
dotnet run
```

The API should start on `https://localhost:7214` or `http://localhost:5214`

### 2. Setting up the Node.js Service (Middleware)

1. Navigate to the `NodeJS/loan-service/` directory
2. Install dependencies:
```bash
npm install
npm install tedious sequelize-cli sequelize mssql
```
3. Start the service:
```bash
npm start
```

The service should run on `http://localhost:3001`

### 3. Setting up the React Client (Frontend)

1. Navigate to the `ReactJs/loan-management-client-new/` directory
2. Install dependencies:
```bash
npm install
```
3. Update the `.env` file for API endpoints:

```properties:ReactJs/loan-management-client-new/.env
REACT_APP_API_URL=http://localhost:7214/api
REACT_APP_NODE_API_URL=http://localhost:3001/api
REACT_APP_NAME="Loan Management System"
```
4. Start the React application:
```bash
npm start
```

The client should run on `http://localhost:3000`

### Suggested Improvements for a Complete System:

1. **Database Integration**:
   - Ensure both .NET and Node.js services are using the same database schema
   - Implement proper database migrations in both services
   - Add proper error handling for database connection failures

2. **Authentication & Authorization**:
   - Implement a unified authentication system using JWT tokens
   - Ensure token sharing between services is secure
   - Add role-based access control

3. **API Gateway**:
   - Consider adding an API Gateway (like YARP or Ocelot) to route requests between services
   - Implement proper CORS policies
   - Add rate limiting and request validation

4. **Monitoring & Logging**:
   - Add centralized logging (e.g., using Serilog or Winston)
   - Implement health checks for all services
   - Add performance monitoring

5. **Security Enhancements**:
   - Implement proper SSL/TLS
   - Add input validation and sanitization
   - Implement proper secrets management

6. **Frontend Improvements**:
   - Add proper error handling and loading states
   - Implement a state management solution (Redux/Context API)
   - Add proper form validation
   - Implement responsive design

### System Architecture Overview:

```
[React Frontend (3000)] 
         ↓
         ↓ HTTP/REST
         ↓
[.NET API (7214)] ←→ [Node.js Service (3001)]
         ↓                    ↓
         ↓                    ↓
         ↓                    ↓
[SQL Server Express Database]
```

To test if everything is working:

1. First start the SQL Server Express instance
2. Start the .NET API
3. Start the Node.js service
4. Start the React frontend
5. Navigate to `http://localhost:3000` in your browser

Would you like me to provide more specific details about any part of this setup or dive deeper into any particular component?
