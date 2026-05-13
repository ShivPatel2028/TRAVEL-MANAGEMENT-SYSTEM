# 🌍 Travel Management System - Interview Preparation Guide

This document is designed to help you explain your project during interviews. It covers the architecture, technology stack, security implementation, and key features.

---

## 📋 1. Project Overview

### **What is this project?**
The **Travel Management System** is a full-stack web application designed to streamline the process of requesting and approving business travel. It features a robust **Role-Based Access Control (RBAC)** system where different users (Employees, Managers, Admins) have specific workflows.

### **Key Features:**
*   **Authentication:** Secure Login/Registration using JWT (JSON Web Tokens).
*   **Role-Based Dashboards:** Unique interfaces for Employees (to request travel), Managers (to approve/reject), and Admins (to manage everything).
*   **Travel Workflow:** A complete lifecycle from "Pending" to "Approved" or "Rejected".
*   **Responsive UI:** Built with Angular Material for a modern, consistent look across devices.
*   **Backend API:** A RESTful service built with ASP.NET Core 8.

---

## 🛠️ 2. Technology Stack

### **Frontend: Angular 18**
*   **Why Angular?** It provides a structured framework for building large-scale enterprise applications with powerful features like dependency injection and modularity.
*   **Key Libraries:** Angular Material (UI), RxJS (Reactive programming), Reactive Forms (Validation).

### **Backend: ASP.NET Core 8 (Web API)**
*   **Why .NET 8?** It’s a high-performance, cross-platform framework. The Web API structure is perfect for decoupling the frontend and backend.
*   **ORM:** Entity Framework Core (EF Core) for database interactions.

### **Database: SQL Server**
*   Relational database for structured data management, ensuring data integrity through foreign keys and constraints.

---

## 🔐 3. Security & Authentication (Critical Interview Topic)

### **How is Authentication handled?**
The project uses **JWT Authentication**.
1.  **Login:** User sends credentials to the `/api/auth/login` endpoint.
2.  **Validation:** The backend validates the password using **BCrypt** hashing.
3.  **Token Issuance:** If valid, the backend generates a JWT containing user claims (Id, Email, Role).
4.  **Frontend Storage:** The token is stored in the browser's `localStorage`.
5.  **Authorization:** For subsequent requests, an **Angular HTTP Interceptor** automatically attaches the JWT to the `Authorization` header.

### **How is Authorization (Roles) enforced?**
*   **Frontend:** **Route Guards** (`AuthGuard`) prevent unauthorized users from accessing specific pages (e.g., an Employee cannot access the Manager's approval page).
*   **Backend:** The `[Authorize(Roles = "Admin,Manager")]` attribute is used on controller actions to ensure only users with the correct role can execute them.

---

## 💾 4. Database Design

### **Main Entities:**
1.  **User:** Stores Name, Email, PasswordHash, and **Role**.
2.  **TravelRequest:** Stores Destination, TravelDate, ReturnDate, Purpose, and **Status** (Pending, Approved, Rejected). It has a Foreign Key relationship with the `User` table.

### **Database Seeding:**
Upon first run, the system automatically creates default users (Admin, Manager, Employee) to ensure the application is ready for testing immediately.

---

## ❓ 5. Common Interview Questions & Answers

### **Q: Why did you choose this specific project?**
**A:** I wanted to build a project that demonstrates a real-world business workflow. A Travel Management System allows me to showcase complex logic like Role-Based Access Control, state management across different dashboards, and secure communication between a modern frontend and a robust backend.

### **Q: Explain the flow when an employee submits a travel request.**
**A:** 
1. The employee fills out a **Reactive Form** in Angular.
2. The frontend sends a POST request to the backend with the travel details.
3. The backend validates the data, assigns a "Pending" status, and saves it to SQL Server using EF Core.
4. The dashboard then updates in real-time to show the new request in the "My Requests" section.

### **Q: How did you handle errors in this application?**
**A:** On the backend, I used standard HTTP status codes (401 for Unauthorized, 400 for Bad Request, etc.). On the frontend, I implemented global error handling and user-friendly notifications (using Material SnackBar) to ensure the user knows exactly what went wrong.

### **Q: If you had more time, what features would you add?**
**A:** 
*   **Email Notifications:** Send an email to the Manager when a new request is submitted.
*   **Expense Tracking:** Allow users to upload receipts after the travel is completed.
*   **PDF Export:** Generate a summary of travel requests in PDF format (ironic, right?).
*   **Advanced Analytics:** A dashboard for Admins to see travel trends and costs.

---

## 🛠️ 6. Technical Solutions & Implementation

Here are the specific solutions implemented for the core challenges of this project:

### **S1: How is the JWT token automatically added to every API call?**
**Solution:** I implemented an **Angular HTTP Interceptor** (`auth.interceptor.ts`). 
*   It intercepts every outgoing HTTP request.
*   It retrieves the token from `localStorage`.
*   If the token exists, it clones the request and adds the `Authorization: Bearer <token>` header.
*   This centralizes authentication logic and avoids manual headers in every service.

### **S2: How do you prevent users from manually typing a URL to access restricted pages?**
**Solution:** I used **Angular Route Guards** (`auth.guard.ts`).
*   In the `app-routing.module.ts`, I applied the `canActivate` guard to protected routes.
*   The guard checks the user's role and authentication status before allowing the route to load.
*   If unauthorized, it redirects the user to the login page.

### **S3: How is the database initialized with data?**
**Solution:** I implemented **Database Seeding** in `Program.cs`.
*   During application startup, the code checks if any users exist in the database.
*   If the database is empty, it uses **BCrypt** to hash default passwords and adds Admin, Manager, and Employee users using Entity Framework Core.

### **S4: How do you handle cross-origin issues between Angular (Port 4200) and .NET (Port 5000)?**
**Solution:** I configured **CORS (Cross-Origin Resource Sharing)** in the backend `Program.cs`.
*   I defined a policy named `"AllowAngularClient"` that specifically allows requests from `http://localhost:4200`.
*   I applied this policy using `app.UseCors()`, enabling seamless communication between the two different ports.

### **S5: How is sensitive data protected in the database?**
**Solution:** I used **BCrypt.Net** for password hashing.
*   Passwords are never stored in plain text.
*   When a user registers or is seeded, the password is salted and hashed.
*   During login, the provided password is verified against the stored hash using `BCrypt.Verify()`.

---

## 🚀 7. How to explain "Role-Based Access Control" (RBAC)
"In this project, RBAC is implemented both on the client and server side. On the client, I use Angular Route Guards to hide or show components based on the user's role stored in the JWT. On the server, I use the standard `[Authorize]` attribute to protect the API endpoints. This ensures that even if someone bypasses the frontend, the backend will still reject unauthorized requests."

---

## 🖨️ How to download this as a PDF:
1.  Open this file in a Markdown viewer or your IDE.
2.  Press **Ctrl + P** (Print).
3.  Select **"Save as PDF"** as the destination.
4.  You now have a professional guide ready for your interview!

---
**Good luck with your interview! You've built a solid, professional application.**
