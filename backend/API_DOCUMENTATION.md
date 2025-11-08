# E-Commerce API Documentation

## Authentication System

This API provides authentication for three user types: **Customer**, **Seller**, and **Admin**.

---

## 🔐 Authentication Flow

### Customer
- ✅ Can signup immediately
- ✅ Can login immediately after signup
- ✅ No approval required

### Seller
- ✅ Can signup (status = "pending")
- ❌ Cannot login until approved by admin
- ✅ Can login only after admin approval (status = "approved")
- ❌ If rejected by admin, seller is deleted from database

### Admin
- ✅ Manually added to database via script
- ✅ Can login to manage sellers
- ✅ Can approve/reject pending sellers

---

## 📍 API Endpoints

### Base URL
```
http://localhost:5050/api
```

---

## 👥 Customer Endpoints

### 1. Customer Signup
**POST** `/api/customers/signup`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+91 9876543210",
  "address": "123 Street, City"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Customer registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "customer": {
    "id": "123abc",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+91 9876543210",
    "address": "123 Street, City",
    "createdAt": "2025-11-06T12:00:00.000Z"
  }
}
```

### 2. Customer Login
**POST** `/api/customers/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "customer": {
    "id": "123abc",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+91 9876543210",
    "address": "123 Street, City",
    "createdAt": "2025-11-06T12:00:00.000Z"
  }
}
```

---

## 🏪 Seller Endpoints

### 1. Seller Signup
**POST** `/api/sellers/signup`

**Request Body:**
```json
{
  "businessName": "TechVista Electronics",
  "ownerName": "Rajesh Kumar",
  "email": "rajesh@techvista.com",
  "password": "password123",
  "phone": "+91 9876543210",
  "businessAddress": "123 Tech Park, Bangalore",
  "gstNumber": "29ABCDE1234F1Z5",
  "bankAccount": "HDFC0001234 - 12345678901234"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Seller registration submitted successfully. Your account is pending admin approval.",
  "seller": {
    "id": "456def",
    "businessName": "TechVista Electronics",
    "ownerName": "Rajesh Kumar",
    "email": "rajesh@techvista.com",
    "phone": "+91 9876543210",
    "businessAddress": "123 Tech Park, Bangalore",
    "gstNumber": "29ABCDE1234F1Z5",
    "bankAccount": "HDFC0001234 - 12345678901234",
    "status": "pending",
    "submittedDate": "2025-11-06T12:00:00.000Z"
  }
}
```

### 2. Seller Login
**POST** `/api/sellers/login`

**Request Body:**
```json
{
  "email": "rajesh@techvista.com",
  "password": "password123"
}
```

**Response (200) - If Approved:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "seller": {
    "id": "456def",
    "businessName": "TechVista Electronics",
    "ownerName": "Rajesh Kumar",
    "email": "rajesh@techvista.com",
    "phone": "+91 9876543210",
    "businessAddress": "123 Tech Park, Bangalore",
    "gstNumber": "29ABCDE1234F1Z5",
    "bankAccount": "HDFC0001234 - 12345678901234",
    "status": "approved",
    "submittedDate": "2025-11-06T12:00:00.000Z"
  }
}
```

**Response (401) - If Pending:**
```json
{
  "success": false,
  "message": "Your account is pending approval. Please wait for admin approval."
}
```

**Response (401) - If Rejected:**
```json
{
  "success": false,
  "message": "Your account has been rejected. Please contact support for more information."
}
```

---

## 👨‍💼 Admin Endpoints

### 1. Admin Login
**POST** `/api/admin/login`

**Request Body:**
```json
{
  "email": "admin@eshop.com",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Admin login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "789ghi",
    "name": "Super Admin",
    "email": "admin@eshop.com",
    "role": "admin",
    "createdAt": "2025-11-01T12:00:00.000Z"
  }
}
```

### 2. Get Pending Sellers
**GET** `/api/admin/sellers/pending`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "count": 2,
  "sellers": [
    {
      "id": "456def",
      "businessName": "TechVista Electronics",
      "ownerName": "Rajesh Kumar",
      "email": "rajesh@techvista.com",
      "phone": "+91 9876543210",
      "businessAddress": "123 Tech Park, Bangalore",
      "gstNumber": "29ABCDE1234F1Z5",
      "bankAccount": "HDFC0001234 - 12345678901234",
      "status": "pending",
      "submittedDate": "2025-11-06T12:00:00.000Z"
    }
  ]
}
```

### 3. Approve Seller
**PUT** `/api/admin/sellers/:id/approve`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Seller \"TechVista Electronics\" has been approved successfully",
  "seller": {
    "id": "456def",
    "businessName": "TechVista Electronics",
    "ownerName": "Rajesh Kumar",
    "email": "rajesh@techvista.com",
    "status": "approved",
    "submittedDate": "2025-11-06T12:00:00.000Z"
  }
}
```

### 4. Reject Seller (Delete)
**DELETE** `/api/admin/sellers/:id/reject`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Seller \"TechVista Electronics\" has been rejected and removed from the system"
}
```

---

## 🛡️ Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

The token is returned upon successful login and is valid for **30 days**.

---

## ⚙️ Setup Instructions

### 1. Create Admin User

Run the following command to create an admin user:

```bash
node scripts/createAdmin.js
```

This will create an admin with credentials from `.env`:
- Email: `admin@eshop.com`
- Password: `admin123`

### 2. Start the Server

```bash
cd backend
npm start
```

Server will run on `http://localhost:5050`

### 3. Test the API

Use tools like Postman, Thunder Client, or curl to test the endpoints.

---

## 📝 Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Please provide all required fields"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Seller not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error message here",
  "error": "Detailed error"
}
```

---

## 🔄 Workflow Example

1. **Seller Registration Flow:**
   - Seller signs up → Status = "pending"
   - Admin logs in → Views pending sellers
   - Admin approves seller → Status = "approved"
   - Seller can now login

2. **Customer Registration Flow:**
   - Customer signs up → Immediately gets token
   - Customer can login anytime

3. **Admin Flow:**
   - Admin is created via script
   - Admin logs in → Gets token
   - Admin manages sellers via protected routes
