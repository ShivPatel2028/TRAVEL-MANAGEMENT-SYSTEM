// File: API_DOCUMENTATION.md
# Travel Management System - API Documentation

## Base URL

```
http://localhost:5000/api
```

## Authentication

All protected endpoints require the JWT token to be sent in the Authorization header:

```
Authorization: Bearer <token>
```

The token is automatically added by the Angular HTTP interceptor.

---

## Authentication Endpoints

### 1. User Registration

**Endpoint:** `POST /auth/register`  
**Authentication:** Not required  
**Status Code:** 200 (Success) | 400 (Bad Request)

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

**Response (Success):**
```json
{
  "message": "User registered successfully"
}
```

**Response (Error):**
```json
{
  "message": "Email already exists"
}
```

**Validation Rules:**
- Email: Required, must be valid email format, must be unique
- Password: Required, minimum 6 characters
- Confirm Password: Must match password field
- Name: Required

---

### 2. User Login

**Endpoint:** `POST /auth/login`  
**Authentication:** Not required  
**Status Code:** 200 (Success) | 401 (Unauthorized)

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

**Response (Success):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "Admin"
  }
}
```

**Response (Error):**
```json
{
  "message": "Invalid email or password"
}
```

**Notes:**
- Token expires in 1 hour
- Store token in localStorage
- Use token for all subsequent requests

---

## User Endpoints

### 3. Get User Profile

**Endpoint:** `GET /user/profile`  
**Authentication:** Required  
**Status Code:** 200 (Success) | 401 (Unauthorized) | 404 (Not Found)

**Response:**
```json
{
  "id": 1,
  "name": "Admin User",
  "email": "admin@example.com",
  "role": "Admin"
}
```

**Example Request:**
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/user/profile
```

---

## Travel Request Endpoints

### 4. Create Travel Request

**Endpoint:** `POST /travel/request`  
**Authentication:** Required  
**Roles:** All (Employee creates, Admin/Manager can also create)  
**Status Code:** 200 (Success) | 401 (Unauthorized) | 400 (Bad Request)

**Request Body:**
```json
{
  "destination": "Paris",
  "travelDate": "2024-06-15",
  "returnDate": "2024-06-20",
  "purpose": "Business conference and client meetings"
}
```

**Response (Success):**
```json
{
  "message": "Travel request created successfully",
  "id": 1
}
```

**Response (Error):**
```json
{
  "message": "Destination is required"
}
```

**Validation Rules:**
- Destination: Required, minimum 3 characters
- Travel Date: Required, must be valid date
- Return Date: Required, must be valid date
- Purpose: Required, minimum 10 characters

---

### 5. Get All Travel Requests

**Endpoint:** `GET /travel/all`  
**Authentication:** Required  
**Roles:** Admin/Manager see all, Employee sees only their own  
**Status Code:** 200 (Success) | 401 (Unauthorized)

**Response:**
```json
[
  {
    "id": 1,
    "userId": 3,
    "userName": "Employee User",
    "destination": "Paris",
    "travelDate": "2024-06-15T00:00:00",
    "returnDate": "2024-06-20T00:00:00",
    "purpose": "Business conference and client meetings",
    "status": "Pending"
  },
  {
    "id": 2,
    "userId": 3,
    "userName": "Employee User",
    "destination": "London",
    "travelDate": "2024-07-01T00:00:00",
    "returnDate": "2024-07-05T00:00:00",
    "purpose": "Project kickoff meeting with stakeholders",
    "status": "Approved"
  }
]
```

**Query Parameters:**
None (filtering done server-side based on role)

---

### 6. Get My Travel Requests

**Endpoint:** `GET /travel/my-requests`  
**Authentication:** Required  
**Roles:** All  
**Status Code:** 200 (Success) | 401 (Unauthorized)

**Response:**
```json
[
  {
    "id": 1,
    "userId": 3,
    "destination": "Paris",
    "travelDate": "2024-06-15T00:00:00",
    "returnDate": "2024-06-20T00:00:00",
    "purpose": "Business conference",
    "status": "Pending"
  }
]
```

**Notes:**
- Only returns requests for the authenticated user
- Employee uses this endpoint to view their requests

---

### 7. Approve Travel Request

**Endpoint:** `PUT /travel/approve/{id}`  
**Authentication:** Required  
**Roles:** Admin, Manager (only)  
**Status Code:** 200 (Success) | 403 (Forbidden) | 401 (Unauthorized) | 404 (Not Found)

**URL Parameters:**
- `id` (integer) - Travel request ID to approve

**Response (Success):**
```json
{
  "message": "Travel request approved"
}
```

**Response (Error - Not Found):**
```json
{
  "message": "Not Found"
}
```

**Response (Error - Forbidden):**
```json
{
  "message": "Forbidden"
}
```

**Example Request:**
```bash
curl -X PUT \
  -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/travel/approve/1
```

**Notes:**
- Only Admin and Manager roles can approve
- Request must exist
- Status is updated to "Approved"

---

### 8. Reject Travel Request

**Endpoint:** `PUT /travel/reject/{id}`  
**Authentication:** Required  
**Roles:** Admin, Manager (only)  
**Status Code:** 200 (Success) | 403 (Forbidden) | 401 (Unauthorized) | 404 (Not Found)

**URL Parameters:**
- `id` (integer) - Travel request ID to reject

**Response (Success):**
```json
{
  "message": "Travel request rejected"
}
```

**Response (Error):**
```json
{
  "message": "Not Found"
}
```

**Example Request:**
```bash
curl -X PUT \
  -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/travel/reject/1
```

**Notes:**
- Only Admin and Manager roles can reject
- Request must exist
- Status is updated to "Rejected"

---

## Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | No valid token provided |
| 403 | Forbidden | User lacks required role |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Internal server error |

---

## Request/Response Headers

### Request Headers
```
Content-Type: application/json
Authorization: Bearer <token>
```

### Response Headers
```
Content-Type: application/json
```

---

## Default Test Accounts

All test accounts have password: `password`

| Role | Email |
|------|-------|
| Admin | admin@example.com |
| Manager | manager@example.com |
| Employee | employee@example.com |

---

## Error Handling

All error responses follow this format:

```json
{
  "message": "Error description"
}
```

Common error messages:
- "Invalid email or password" - Login failed
- "Email already exists" - Registration duplicate email
- "Passwords do not match" - Password confirmation mismatch
- "Email and password are required" - Missing required fields
- "Unauthorized" - No valid token
- "Forbidden" - Insufficient permissions
- "Not Found" - Resource doesn't exist

---

## JWT Token Structure

The JWT token contains the following claims:
- `sub` - User ID
- `email` - User email
- `role` - User role (Admin, Manager, Employee)
- `name` - User name
- `exp` - Token expiration time

**Token Lifetime:** 1 hour

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding for production.

---

## CORS Configuration

The backend allows requests from:
- `http://localhost:4200` (Angular development server)

Add more origins in `Program.cs` as needed.

---

## Swagger API Documentation

When backend is running, access Swagger UI:
```
https://localhost:5001/swagger/index.html
```

---

## Testing with cURL

### Login Example
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}'
```

### Create Travel Request
```bash
curl -X POST http://localhost:5000/api/travel/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "destination":"Paris",
    "travelDate":"2024-06-15",
    "returnDate":"2024-06-20",
    "purpose":"Business meeting"
  }'
```

### Get All Requests
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/travel/all
```

### Approve Request
```bash
curl -X PUT \
  -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/travel/approve/1
```

---

## Best Practices

1. **Always include Authorization header** for protected endpoints
2. **Store token securely** in localStorage or sessionStorage
3. **Handle token expiration** and request new token
4. **Validate input** on client side before sending
5. **Use HTTPS** in production
6. **Keep JWT key secret** in production
7. **Implement refresh tokens** for better security
8. **Add request timeout** to prevent hanging requests
9. **Implement retry logic** for failed requests
10. **Log API errors** for debugging

---

## Versioning

This is API v1. Future versions may be added at `/api/v2/`.

---

For more information, refer to PROJECT_STRUCTURE.md and SETUP_INSTRUCTIONS.md.
