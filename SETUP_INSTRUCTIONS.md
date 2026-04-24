// File: SETUP_INSTRUCTIONS.md
# Travel Management System - Complete Setup Guide

## Prerequisites

### Frontend
- Node.js (v18 or higher)
- npm (v9 or higher)
- Angular CLI 18

### Backend
- .NET 8 SDK
- SQL Server (LocalDB or any SQL Server instance)
- Visual Studio Code or Visual Studio 2022+

---

## FRONTEND SETUP (Angular)

### Step 1: Navigate to Frontend Directory
```bash
cd frontend
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Update Angular Material Theme (if needed)
The Material theme is already configured in `angular.json`. If you want to change it:
- Edit `angular.json`
- Update the styles array with your preferred theme

### Step 4: Run Angular Development Server
```bash
npm start
```
or
```bash
ng serve
```

The application will be available at: **http://localhost:4200**

### Step 5: Default Test Credentials
- **Admin Account:**
  - Email: `admin@example.com`
  - Password: `password`

- **Manager Account:**
  - Email: `manager@example.com`
  - Password: `password`

- **Employee Account:**
  - Email: `employee@example.com`
  - Password: `password`

---

## BACKEND SETUP (ASP.NET Core .NET 8)

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Install NuGet Packages
All packages are already defined in `TravelManagementAPI.csproj`, so just restore:
```bash
dotnet restore
```

### Step 3: Update Database Connection String (if needed)
Edit `appsettings.json`:
```json
"ConnectionStrings": {
  "DefaultConnection": "Server=localhost;Database=TravelManagementDB;Trusted_Connection=True;Encrypt=false;"
}
```

For SQL Server Authentication instead of Windows Authentication:
```json
"DefaultConnection": "Server=YOUR_SERVER;Database=TravelManagementDB;User Id=sa;Password=YOUR_PASSWORD;Encrypt=false;"
```

### Step 4: Create Database Migrations
```bash
dotnet ef migrations add InitialCreate
```

### Step 5: Apply Migrations to Database
```bash
dotnet ef database update
```

### Step 6: Run Backend Server
```bash
dotnet run
```

The API will be available at:
- **HTTP:** http://localhost:5000
- **HTTPS:** https://localhost:5001
- **Swagger UI:** https://localhost:5001/swagger/index.html

---

## API ENDPOINTS

### Authentication
- **POST** `/api/auth/register` - Register new user
- **POST** `/api/auth/login` - User login

### User Management
- **GET** `/api/user/profile` - Get current user profile

### Travel Requests
- **POST** `/api/travel/request` - Create travel request
- **GET** `/api/travel/all` - Get all travel requests (Admin/Manager) or user requests
- **GET** `/api/travel/my-requests` - Get logged-in user's requests
- **PUT** `/api/travel/approve/{id}` - Approve request (Admin/Manager only)
- **PUT** `/api/travel/reject/{id}` - Reject request (Admin/Manager only)

---

## PROJECT FEATURES

### Authentication & Authorization
- JWT Token-based authentication
- Role-based access control (Admin, Manager, Employee)
- Secure password hashing with BCrypt

### Frontend Features
- Responsive UI with Angular Material
- Form validation
- Role-based dashboards
- Real-time data loading
- Error handling
- Logout functionality

### Backend Features
- RESTful API architecture
- Entity Framework Core ORM
- SQL Server database
- JWT middleware validation
- CORS enabled for Angular frontend
- Swagger API documentation

### User Roles

#### Admin
- View all travel requests
- Approve/reject any request
- Manage system

#### Manager
- View all team travel requests
- Approve/reject pending requests

#### Employee
- Create travel requests
- View their own requests
- Track request status

---

## DATABASE SCHEMA

### Users Table
- Id (Primary Key)
- Name
- Email (Unique)
- PasswordHash
- Role (Admin, Manager, Employee)
- CreatedAt

### TravelRequests Table
- Id (Primary Key)
- UserId (Foreign Key)
- Destination
- TravelDate
- ReturnDate
- Purpose
- Status (Pending, Approved, Rejected)
- CreatedAt

---

## DEVELOPMENT WORKFLOW

### Frontend Development
```bash
cd frontend
npm start
```

### Backend Development
```bash
cd backend
dotnet watch run
```

---

## BUILD FOR PRODUCTION

### Frontend Build
```bash
cd frontend
npm run build
```
Output: `frontend/dist/travel-management`

### Backend Build
```bash
cd backend
dotnet publish -c Release
```
Output: `backend/bin/Release/net8.0/publish`

---

## TROUBLESHOOTING

### Database Issues
- Ensure SQL Server is running
- Check connection string in `appsettings.json`
- Verify database name and credentials

### CORS Issues
- Make sure backend is running on http://localhost:5000
- Check CORS policy in `Program.cs`

### Angular Port Already in Use
```bash
ng serve --port 4201
```

### Backend Port Already in Use
Edit `Program.cs` to change the port

---

## SECURITY CONSIDERATIONS

1. Change JWT Secret Key in `appsettings.json`
2. Use HTTPS in production
3. Implement rate limiting
4. Add CSRF protection
5. Validate all inputs
6. Use environment variables for sensitive data
7. Implement refresh token mechanism
8. Add API key authentication for services

---

## ADDITIONAL NOTES

- Default seeded users are created on first database migration
- All timestamps are stored in UTC
- Passwords must be at least 6 characters
- Email addresses must be unique
- Travel requests are soft-deleted (not actually deleted)
- All API responses include appropriate HTTP status codes

---

## SUPPORT

For issues or questions:
1. Check the console for error messages
2. Review API responses in Network tab
3. Verify all prerequisites are installed
4. Ensure both frontend and backend are running
5. Check database connectivity
