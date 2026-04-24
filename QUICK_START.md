// File: QUICK_START.md
# Quick Start Guide - Travel Management System

## 1. Clone/Copy the Project

All files are already created in the project directory.

## 2. Start Backend (Terminal 1)

```bash
cd backend
dotnet restore
dotnet ef database update
dotnet run
```

✅ Backend will start on: http://localhost:5000

## 3. Start Frontend (Terminal 2)

```bash
cd frontend
npm install
npm start
```

✅ Frontend will be ready at: http://localhost:4200

## 4. Login with Test Credentials

Use any of these accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | password |
| Manager | manager@example.com | password |
| Employee | employee@example.com | password |

## 5. Explore Features

### Admin/Manager Dashboard
- View all travel requests
- Approve or reject requests
- See request details

### Employee Dashboard
- Create travel requests
- View their own requests
- Track approval status

## API Documentation

Visit Swagger UI (when backend is running):
https://localhost:5001/swagger/index.html

## Troubleshooting

### Backend won't start?
- Ensure SQL Server is running
- Check connection string in `backend/appsettings.json`

### Frontend port in use?
```bash
ng serve --port 4201
```

### Database issues?
```bash
cd backend
dotnet ef database drop
dotnet ef database update
```

## File Structure Overview

```
├── frontend/                 # Angular 18 application
│   ├── src/app/
│   │   ├── components/       # UI components
│   │   ├── services/         # API services
│   │   └── guards/           # Route guards
│
├── backend/                  # ASP.NET Core Web API
│   ├── Controllers/          # API endpoints
│   ├── Models/               # Database models
│   ├── Data/                 # Database context
│   └── DTOs/                 # Data transfer objects
```

## Key Technologies

- **Frontend:** Angular 18, Material UI, TypeScript
- **Backend:** ASP.NET Core 8, Entity Framework Core
- **Database:** SQL Server
- **Authentication:** JWT Tokens

That's it! Your full-stack travel management system is ready to use.
