// File: README.md
# Travel Management System

A full-stack web application for managing travel requests with role-based access control. Built with Angular 18 frontend and ASP.NET Core 8 backend with SQL Server database.

## Quick Start

### Prerequisites
- Node.js 18+
- .NET 8 SDK
- SQL Server (LocalDB or any instance)

### Backend Setup
```bash
cd backend
dotnet restore
dotnet ef database update
dotnet run
```
Backend runs on: http://localhost:5000

### Frontend Setup
```bash
cd frontend
npm install
npm start
```
Frontend runs on: http://localhost:4200

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | password |
| Manager | manager@example.com | password |
| Employee | employee@example.com | password |

## Key Features

✅ JWT Authentication & Authorization  
✅ Role-Based Access Control (Admin, Manager, Employee)  
✅ Travel Request Management  
✅ Request Approval Workflow  
✅ Responsive UI with Angular Material  
✅ Real-time Data Loading  
✅ Form Validation  
✅ Error Handling  
✅ RESTful API  
✅ SQL Server Database  

## Architecture

### Frontend
- Angular 18
- Angular Material UI
- Reactive Forms
- HTTP Interceptors
- Route Guards
- Services

### Backend
- ASP.NET Core 8 Web API
- Entity Framework Core
- SQL Server
- JWT Authentication
- CORS Configuration

## File Structure

```
travel-management/
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   │   ├── login/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── travel-request/
│   │   │   │   └── approval/
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── travel.service.ts
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   └── auth.interceptor.ts
│   │   │   ├── app-routing.module.ts
│   │   │   └── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   ├── angular.json
│   └── tsconfig.json
│
├── backend/
│   ├── Controllers/
│   │   ├── AuthController.cs
│   │   ├── UserController.cs
│   │   └── TravelController.cs
│   ├── Models/
│   │   ├── User.cs
│   │   └── TravelRequest.cs
│   ├── Data/
│   │   └── AppDbContext.cs
│   ├── DTOs/
│   │   ├── LoginDto.cs
│   │   ├── RegisterDto.cs
│   │   └── TravelRequestDto.cs
│   ├── Middleware/
│   │   └── JwtMiddleware.cs
│   ├── Program.cs
│   ├── appsettings.json
│   └── TravelManagementAPI.csproj
│
├── SETUP_INSTRUCTIONS.md
└── README.md
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### User Endpoints
- `GET /api/user/profile` - Get current user profile (Protected)

### Travel Request Endpoints
- `POST /api/travel/request` - Create travel request (Protected)
- `GET /api/travel/all` - Get all requests (Protected)
- `GET /api/travel/my-requests` - Get user's requests (Protected)
- `PUT /api/travel/approve/{id}` - Approve request (Admin/Manager)
- `PUT /api/travel/reject/{id}` - Reject request (Admin/Manager)

## Authentication Flow

1. User enters credentials on login page
2. Backend validates and issues JWT token
3. Frontend stores token in localStorage
4. HTTP Interceptor adds token to all requests
5. Backend validates token in middleware
6. Route guards protect frontend routes
7. User is authenticated and can access protected resources

## Database

### Migrations
```bash
cd backend
dotnet ef migrations add InitialCreate
dotnet ef database update
```

### Seed Data
Three default users are created:
- Admin User (admin@example.com)
- Manager User (manager@example.com)
- Employee User (employee@example.com)

## Environment Configuration

### Backend (appsettings.json)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=TravelManagementDB;Trusted_Connection=True;Encrypt=false;"
  },
  "Jwt": {
    "Key": "your_super_secret_key_make_it_long_enough",
    "Issuer": "TravelManagementAPI",
    "Audience": "TravelManagementClient"
  }
}
```

## Production Considerations

- Change JWT secret key
- Use environment variables for sensitive data
- Enable HTTPS
- Implement rate limiting
- Add request logging
- Set up monitoring and alerts
- Use connection pooling
- Implement caching
- Add API versioning
- Implement pagination for large datasets

## Technologies Used

**Frontend:**
- Angular 18
- TypeScript
- Angular Material
- RxJS
- Reactive Forms

**Backend:**
- ASP.NET Core 8
- Entity Framework Core
- SQL Server
- JWT
- BCrypt

## License

MIT License

## Support

For issues or questions, refer to SETUP_INSTRUCTIONS.md for detailed troubleshooting.
