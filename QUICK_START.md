# Quick Start Guide - Travel Management System (2026 Edition)

## 1. Project Overview
This project is a modernized Enterprise Travel Management System featuring a multi-departmental approval workflow (Employee -> Manager -> Finance).

## 2. Start Backend (Terminal 1)
Ensure you have the .NET SDK installed.

```bash
cd backend
dotnet tool restore
dotnet ef database update
dotnet run
```
✅ **Backend API**: http://localhost:5000
✅ **Swagger UI**: http://localhost:5000/swagger

## 3. Start Frontend (Terminal 2)
Ensure you have Node.js installed.

```bash
cd client
npm install
npm run dev
```
✅ **Frontend Portal**: http://localhost:3000

## 4. Test Credentials
Log in using either **Username** or **Employee ID**.

| Role | Username | Password | Notes |
|------|----------|----------|-------|
| **Admin** | `admin` | `password` | Full system control |
| **Manager** | `rahul` | `password` | Technical approvals |
| **Finance** | `finance` | `password` | Budget & Expense review |
| **Employee** | `priya` | `password` | Request submission |

## 5. Modern Features (2026 Standard)
- **Finance Integration**: New specialized dashboard for budget verification and reimbursement approval.
- **Dual Login**: Support for login via Employee ID or Username.
- **Glassmorphism UI**: High-end Next.js 16 frontend with premium aesthetics.
- **Post-Trip Reporting**: Employees can now submit detailed reports and upload receipts for reimbursement.

## Troubleshooting
- **Database Error**: Run `dotnet ef database update` in the backend folder.
- **Port Conflict**: If port 3000 or 5000 is in use, stop existing processes and retry.
- **Missing Bills**: Ensure the `backend/wwwroot/uploads` folder exists for receipt storage.

---
© 2026 TravelCorp. All rights reserved.
