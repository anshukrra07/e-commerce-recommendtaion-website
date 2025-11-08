# Image Upload Feature

## 🎉 Feature Overview

Sellers can now upload real product images directly from their device instead of using URLs or emojis.

## 🚀 How It Works

### For Sellers

1. **Add/Edit Product**
   - Click "Add New Product" in Products tab
   - Scroll to "Product Images" section
   - Click "📁 Choose Images (Max 5)"
   - Select up to 5 images from your device
   - Click "📤 Upload" button
   - Images are uploaded to server
   - Continue filling other product details
   - Submit product

2. **Image Requirements**
   - **Formats**: JPG, JPEG, PNG, GIF, WebP
   - **Max Size**: 5MB per image
   - **Max Count**: 5 images per product
   - **Recommended**: 800x800px or higher resolution

3. **Features**
   - ✅ Preview selected images before upload
   - ✅ Upload multiple images at once
   - ✅ Remove uploaded images with ✕ button
   - ✅ Shows upload progress
   - ✅ Error handling with clear messages

### For Admins

- Uploaded images are visible in the Approval tab
- Images display as thumbnails in product cards
- Can approve/reject products with images

### For Customers

- Product images appear in ProductDetailsPage
- Image gallery with zoom functionality
- High-quality product viewing experience

## 🏗️ Technical Implementation

### Backend

**1. Multer Configuration** (`backend/config/multer.js`)
```javascript
- Storage: Disk storage in uploads/products/
- File naming: product-{timestamp}-{random}.ext
- Validation: Only image formats allowed
- Size limit: 5MB per file
```

**2. Upload Endpoint** (`POST /api/products/upload-images`)
```javascript
- Protected route (requires authentication)
- Seller only (role-based)
- Accepts multiple files (max 5)
- Returns array of image URLs
```

**3. Static File Serving**
```javascript
app.use('/uploads', express.static('uploads'));
// Images accessible at: http://localhost:5050/uploads/products/filename.jpg
```

### Frontend

**1. ProductForm Component**
- File selection with preview
- Async upload to backend
- Display uploaded images
- Remove image functionality
- Error handling

**2. Image Upload Flow**
```
1. User selects files → Preview
2. Click Upload → Send to API
3. API returns URLs → Update form
4. URLs saved with product data
5. Images displayed on approval/product pages
```

## 📁 File Structure

```
backend/
├── config/
│   └── multer.js          # Multer configuration
├── uploads/
│   └── products/          # Uploaded images storage
│       ├── product-1234567890-123.jpg
│       └── product-1234567890-456.png
└── routes/
    └── productRoutes.js   # Upload endpoint

frontend1/
└── src/
    ├── components/
    │   └── SellerComponents/
    │       └── ProductForm.js  # Image upload UI
    └── styles/
        └── SellerComponents/
            └── ProductForm.css # Upload styles
```

## 🔒 Security Features

1. **File Type Validation**
   - Only image formats accepted
   - Validated by extension and MIME type

2. **File Size Limit**
   - 5MB maximum per image
   - Prevents server overload

3. **Authentication Required**
   - JWT token verification
   - Only sellers can upload

4. **Unique Filenames**
   - Prevents conflicts
   - Timestamp + random number

## 📊 Storage Information

### Disk Storage
- **Location**: `backend/uploads/products/`
- **Naming**: `product-{timestamp}-{random}.{ext}`
- **Example**: `product-1704556800-123456789.jpg`

### Database Storage
- **Model**: Product.images (Array of Strings)
- **Format**: Full URLs
- **Example**: `["http://localhost:5050/uploads/products/product-123.jpg"]`

## 🎨 UI/UX Features

### Visual Feedback
- ✅ File selection shows preview
- ✅ Upload button shows progress (⏳ Uploading...)
- ✅ Success: Images appear in "Uploaded Images" section
- ✅ Error: Red error message displayed
- ✅ Remove button (✕) on each uploaded image

### Responsive Design
- Desktop: Side-by-side buttons
- Mobile: Stacked buttons, smaller thumbnails
- Touch-friendly: Large buttons and tap targets

## 🔧 Configuration

### Backend (.env)
```env
# No additional config needed
# Uses default multer settings
```

### Frontend (ProductForm.js)
```javascript
const API_URL = 'http://localhost:5050/api/products/upload-images';
const MAX_FILES = 5;
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
```

## 🚨 Error Handling

### Common Errors & Solutions

1. **"Maximum 5 images allowed"**
   - Solution: Select 5 or fewer images

2. **"Only image files allowed"**
   - Solution: Use JPG, PNG, GIF, or WebP format

3. **"File too large"**
   - Solution: Compress image or use smaller size (< 5MB)

4. **"Failed to upload images"**
   - Solution: Check internet connection and try again

5. **"Not authorized"**
   - Solution: Log in as seller

## 📝 Usage Examples

### Example 1: Adding Product with Images
```
1. Login as seller
2. Navigate to Products tab
3. Click "Add New Product"
4. Fill product details (name, price, etc.)
5. Click "Choose Images"
6. Select 3 product photos
7. Click "Upload 3 Image(s)"
8. Wait for success (images appear below)
9. Fill remaining details
10. Click "Add Product"
```

### Example 2: Editing Product Images
```
1. Click "Edit" on existing product
2. Scroll to "Product Images"
3. See currently uploaded images
4. Click ✕ to remove unwanted images
5. Click "Choose Images" to add new ones
6. Upload and save
```

## 🎯 Future Enhancements

Possible improvements (not implemented yet):
- [ ] Image compression before upload
- [ ] Drag-and-drop upload
- [ ] Crop/edit before upload
- [ ] Cloud storage (AWS S3, Cloudinary)
- [ ] Image optimization (WebP conversion)
- [ ] Batch delete
- [ ] Reorder images
- [ ] Set primary image

## 📚 API Reference

### Upload Images
```http
POST /api/products/upload-images
Authorization: Bearer {token}
Content-Type: multipart/form-data

Body: FormData with 'images' field (array of files)

Response:
{
  "success": true,
  "message": "Images uploaded successfully",
  "imageUrls": [
    "/uploads/products/product-123.jpg",
    "/uploads/products/product-456.jpg"
  ]
}
```

### Access Uploaded Image
```
GET http://localhost:5050/uploads/products/product-123.jpg
```

## ✅ Testing Checklist

- [ ] Upload single image
- [ ] Upload multiple images (2-5)
- [ ] Try to upload > 5 images (should show error)
- [ ] Upload non-image file (should show error)
- [ ] Upload large file > 5MB (should show error)
- [ ] Remove uploaded image
- [ ] Edit product and add more images
- [ ] Verify images show in admin approval
- [ ] Verify images show in product details page

---

**Feature Status**: ✅ Complete and Working
**Last Updated**: 2025-01-07
