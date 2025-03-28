# Loan Management System

A full-stack loan management application built with .NET Core and Node.js.

## System Architecture

The LMS follows a three-tier architecture:
- **Presentation Layer**: Web-based UI
- **Business Logic Layer**: RESTful APIs implemented using both ASP.NET Core and Express.js
- **Data Layer**: SQL Server database

## Technology Stack

- **Back-end**: 
  - ASP.NET Core Web API (User Management)
  - Express.js (Loan Management)
- **Database**: SQL Server
- **Authentication**: JWT-based authentication

## Project Structure

- **DotNet/**: Contains the ASP.NET Core Web API for User Management
- **NodeJS/**: Contains the Express.js application for Loan Management

## Getting Started

### Prerequisites

- .NET 6.0 SDK
- Node.js (v14 or higher)
- SQL Server

### Setting Up the .NET API

1. Navigate to the DotNet/LoanManagement.API directory
2. Update the connection string in appsettings.json
3. Run the following commands:

```
dotnet restore
dotnet run
```

The .NET API will be available at https://localhost:7001

### Setting Up the Node.js API

1. Navigate to the NodeJS/loan-service directory
2. Create a .env file with the necessary configurations (see .env.example)
3. Run the following commands:

```
npm install
npm run dev
```

The Node.js API will be available at http://localhost:3001

## API Documentation

### ASP.NET Core Endpoints (User Management)

- POST /api/auth/register - Register new user
- POST /api/auth/login - User login
- GET /api/users - List all users (Admin only)

### Express.js Endpoints (Loan Management)

- POST /api/loans/apply - Apply for a loan
- GET /api/loans/{id} - Get loan details
- PUT /api/loans/{id}/approve - Approve loan (Loan Officer)
- PUT /api/loans/{id}/reject - Reject loan (Loan Officer)

## Security Features

- JWT-based authentication
- Role-based access control
- Password hashing
- HTTPS support

## Notes

- The .NET API is responsible for user management and authentication
- The Node.js API handles loan-related functionality
- Both APIs use the same SQL Server database
- The JWT tokens issued by the .NET API are compatible with the Node.js API
