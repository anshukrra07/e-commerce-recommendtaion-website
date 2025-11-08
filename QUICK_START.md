# 🚀 Quick Start Guide

## Setup & Run

### 1. Start MongoDB
```bash
# Make sure MongoDB is running
mongod
```

### 2. Create Admin User
```bash
cd /Users/anshu/Downloads/e-com/backend
node scripts/createAdmin.js
```

**Output:**
```
✅ Connected to MongoDB
✅ Admin user created successfully!
📧 Email: admin@eshop.com
👤 Name: Super Admin

🔐 You can now login with these credentials
```

### 3. Start Backend
```bash
cd /Users/anshu/Downloads/e-com/backend
npm start
```

**Expected Output:**
```
🚀 Server running on port 5050
✅ MongoDB Connected: localhost
```

### 4. Start Frontend
```bash
cd /Users/anshu/Downloads/e-com/frontend1
npm start
```

**Opens:** `http://localhost:3000`

---

## 🧪 Test the System

### Test 1: Customer Signup & Login
1. Open `http://localhost:3000`
2. Click "Login" button
3. Switch to "Sign Up" mode
4. Fill in customer details:
   - Name: John Doe
   - Email: john@test.com
   - Phone: 1234567890
   - Address: 123 Main St
   - Password: password123
5. Click "Create Account"
6. ✅ **Expected**: Automatically logged in, modal closes

### Test 2: Seller Signup (Pending)
1. Click "Login" → "Sign Up" → "Seller" tab
2. Fill in seller details:
   - Business Name: Test Store
   - Owner Name: Jane Smith
   - Email: jane@teststore.com
   - Phone: 9876543210
   - Business Address: 456 Business Rd
   - GST Number: 29ABCDE1234F1Z5
   - Bank Account: HDFC0001234
   - Password: password123
3. Click "Submit for Approval"
4. ✅ **Expected**: "Seller registration submitted! Your account is pending admin approval."

### Test 3: Seller Cannot Login (Pending)
1. Click "Login" → "Seller" tab
2. Try to login with: jane@teststore.com / password123
3. ❌ **Expected**: "Your account is pending approval. Please wait for admin approval."

### Test 4: Admin Approves Seller
1. Click "Login" → "Admin" tab
2. Login with:
   - Email: admin@eshop.com
   - Password: admin123
3. Navigate to "Approvals" tab
4. ✅ **Expected**: See "Test Store" in pending sellers list
5. Click "Approve" button
6. ✅ **Expected**: Success message, seller disappears from list

### Test 5: Seller Login (Approved)
1. Click "Login" → "Seller" tab
2. Login with: jane@teststore.com / password123
3. ✅ **Expected**: Login successful, redirected to seller dashboard

### Test 6: Admin Rejects Seller
1. Create another seller (follow Test 2 with different email)
2. Admin logs in → "Approvals" tab
3. Click "Reject" button
4. Enter rejection reason
5. ✅ **Expected**: Seller is deleted from database
6. Try to login with rejected seller → ❌ "Invalid email or password"

---

## 📋 Default Credentials

### Admin
- **Email:** admin@eshop.com
- **Password:** admin123

### Database
- **MongoDB URI:** mongodb://localhost:27017/ecommercedb
- **JWT Secret:** supersecretkey123

---

## 🔍 Verify Database

### Check MongoDB Data
```bash
mongosh
use ecommercedb

# View all customers
db.customers.find().pretty()

# View all sellers
db.sellers.find().pretty()

# View admin
db.admins.find().pretty()

# Count pending sellers
db.sellers.countDocuments({ status: "pending" })
```

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to MongoDB"
**Solution:** Make sure MongoDB is running
```bash
mongod
```

### Issue: "Port 5050 already in use"
**Solution:** Kill the process using port 5050
```bash
lsof -ti:5050 | xargs kill -9
```

### Issue: "CORS error in browser"
**Solution:** Backend already has CORS enabled. If still facing issues:
```javascript
// backend/server.js
app.use(cors({ origin: 'http://localhost:3000' }));
```

### Issue: "401 Unauthorized" in admin dashboard
**Solution:** Make sure you're logged in as admin and token is stored:
```javascript
// Check in browser console
console.log(localStorage.getItem('authToken'));
console.log(localStorage.getItem('userRole'));
```

### Issue: Admin login fails
**Solution:** Make sure you ran the createAdmin script:
```bash
cd backend
node scripts/createAdmin.js
```

---

## 📁 Project Structure

```
e-com/
├── backend/
│   ├── models/              # Mongoose models (Customer, Seller, Admin)
│   ├── controllers/         # Business logic
│   ├── routes/             # API routes
│   ├── middleware/         # Auth & role middleware
│   ├── config/             # Database connection
│   ├── scripts/            # Utility scripts (createAdmin)
│   ├── server.js           # Entry point
│   └── .env                # Environment variables
│
├── frontend1/
│   └── src/
│       ├── components/
│       │   └── LoginModal/ # Updated with API integration
│       └── pages/
│           └── AdminDashboard.js  # Updated with API integration
│
├── API_DOCUMENTATION.md     # Complete API docs
├── FRONTEND_INTEGRATION.md  # Frontend changes
└── QUICK_START.md          # This file
```

---

## 🎯 What's Working

✅ Customer signup & auto-login
✅ Seller signup with pending status
✅ Seller login only after approval
✅ Admin login
✅ Admin fetch pending sellers from database
✅ Admin approve sellers (status → "approved")
✅ Admin reject sellers (deleted from database)
✅ JWT authentication with 30-day expiration
✅ Password hashing with bcrypt
✅ Role-based access control
✅ Error handling & validation

---

## 📚 Documentation

- **Backend API**: See `API_DOCUMENTATION.md`
- **Frontend Changes**: See `FRONTEND_INTEGRATION.md`
- **This Guide**: `QUICK_START.md`

---

## 🎉 You're All Set!

Your e-commerce authentication system is now fully functional with:
- ✅ Separate models for Customer, Seller, Admin
- ✅ Login functionality for Customer and Seller only
- ✅ Admin approval workflow for sellers
- ✅ Rejected sellers are deleted (not just status update)
- ✅ JWT-based authentication
- ✅ Frontend integrated with backend API

**Happy coding! 🚀**
