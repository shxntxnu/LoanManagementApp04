### Changes on 23/03/2025

1. **ASP.NET Core API (User Management)**
- Created User model with proper validation and constraints
- Implemented JWT authentication with secure token generation
- Added role-based authorization
- Set up database context with proper entity configuration
- Added seed data for initial admin user
- Implemented secure password hashing using BCrypt

2. **Node.js Loan Service**
- Created Loan model with comprehensive fields (amount, interest rate, term, etc.)
- Implemented loan application process with interest rate calculation
- Added role-based access control for different operations
- Set up proper error handling and validation
- Implemented loan approval/rejection workflow
- Added monthly payment calculation

3. **Database Integration**
- Both services now use the same SQL Server database
- ASP.NET Core uses Entity Framework Core
- Node.js service uses Sequelize ORM
- Added proper foreign key relationships
- Implemented proper indexing for performance

4. **Security Improvements**
- JWT token-based authentication
- Role-based authorization
- Secure password hashing
- Input validation
- Proper error handling
- CORS configuration

5. **API Endpoints**
- User Management:
  - Register
  - Login
  - Role-based access control

- Loan Management:
  - Apply for loan
  - Get loan details
  - Get all loans (admin/loan officer)
  - Get user's loans
  - Approve/reject loans

The implementation now follows the guide's requirements and best practices, with proper separation of concerns between the two services while maintaining a unified database. The system supports all the required user roles (Admin, Borrower, Loan Officer) and implements the complete loan management workflow.


## Project Structure Overview

The frontend is built using React with TypeScript and Material-UI (MUI). Here's how the different components and files are connected:

1. **Core Application Structure** (`App.tsx`)
- Acts as the main entry point
- Implements routing using `react-router-dom`
- Uses lazy loading for better performance
- Defines protected routes based on user roles
- Wraps the application with `ThemeProvider` and `AuthProvider`

2. **Authentication System**
- `context/AuthContext.tsx`: Manages global authentication state
  - Provides user state, login, register, and logout functions
  - Used by `ProtectedRoute` component for route protection
  - Accessed throughout the app using the `useAuth` hook

3. **Layout and Navigation** (`components/Layout.tsx`)
- Implements a responsive drawer layout
- Provides navigation menu based on user roles
- Includes app bar with mobile responsiveness
- Used as a wrapper for all protected routes

4. **Core Components**
- `components/ProtectedRoute.tsx`: Handles route protection and role-based access
- `components/LoadingSpinner.tsx`: Reusable loading indicator
- `components/Layout.tsx`: Main application layout wrapper

5. **Pages**
Each page is a separate component with specific functionality:

a. **Authentication Pages**
- `pages/Login.tsx`: User login form
- `pages/Register.tsx`: User registration form

b. **Main Application Pages**
- `pages/Dashboard.tsx`: Home page with loan statistics
- `pages/MyLoans.tsx`: Borrower's loan management
- `pages/LoanApplications.tsx`: Loan officer's application review
- `pages/Payments.tsx`: Loan payment management
- `pages/Users.tsx`: Admin's user management
- `pages/Settings.tsx`: User profile settings

6. **Services Layer**
- `services/api.ts`: Base API configuration and auth service
- `services/loanService.ts`: Loan-related API calls
- `services/userService.ts`: User management API calls

7. **Type Definitions** (`types/index.ts`)
- Defines TypeScript interfaces for:
  - User
  - Loan
  - Payment
  - LoanApplication
  - LoanOfficer
  - Various request/response types

8. **Theme Configuration** (`theme/index.ts`)
- Customizes Material-UI theme
- Defines color palette
- Sets typography styles
- Configures component defaults

## Key Features and Connections

1. **Authentication Flow**
```
Login/Register → AuthContext → ProtectedRoute → Layout → Protected Pages
```

2. **Data Flow**
```
API Services → Pages → Context (when needed) → UI Components
```

3. **Role-Based Access**
- Admin: Access to all pages
- Loan Officer: Dashboard, Loan Applications, Settings
- Borrower: Dashboard, My Loans, Payments, Settings

4. **State Management**
- Local state: Managed by React hooks in individual components
- Global state: Managed by AuthContext for user information
- API state: Managed by service layer

5. **UI/UX Features**
- Responsive design
- Loading states
- Error handling
- Form validation
- Role-based navigation
- Consistent theming

This structure follows React best practices with:
- Component-based architecture
- Separation of concerns
- Type safety with TypeScript
- Reusable components and hooks
- Protected routing
- Lazy loading for performance
- Consistent styling with Material-UI

The application is designed to be scalable, maintainable, and user-friendly while providing different experiences based on user roles.


NPM START WASN'T WORKING SO I DID THIS:
Created all the necessary pages:
Login.tsx: For user authentication
Register.tsx: For user registration
Dashboard.tsx: The main landing page
MyLoans.tsx: For borrowers to view and manage their loans
LoanApplications.tsx: For loan officers to review loan applications
Payments.tsx: For borrowers to make loan payments
Users.tsx: For administrators to manage users
Settings.tsx: For users to manage their profile
Set up the necessary types in types/index.ts:
User: For user data
Loan: For loan data
Payment: For payment data
LoanApplication: For loan application data
LoanOfficer: For loan officer data
Various request and response interfaces
Updated App.tsx with all the necessary routes:
Public routes: /login and /register
Protected routes with role-based access:
/: Dashboard (all roles)
/loans: My Loans (Borrower)
/loan-applications: Loan Applications (Loan Officer)
/payments: Payments (Borrower)
/users: User Management (Admin)
/settings: Settings (all roles)
Updated package.json with the correct dependency versions:
Material-UI components and icons
React Router for navigation
Axios for API calls
TypeScript and testing libraries
Installed all dependencies and started the development server.
The application should now be running at http://localhost:3000. You can access it through your web browser and test the various features. Remember that some features will require authentication and specific user roles to access.