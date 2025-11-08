# Cloudinary Integration Setup Guide

## ☁️ What is Cloudinary?

Cloudinary is a cloud-based image and video management service that provides:
- ✅ Permanent image storage (never lost on server restart)
- ✅ Fast CDN delivery worldwide
- ✅ Automatic image optimization
- ✅ Free tier: 25GB storage + 25GB bandwidth/month
- ✅ Image transformations (resize, crop, etc.)

---

## 🚀 Setup Steps

### Step 1: Create Cloudinary Account

1. Go to https://cloudinary.com/users/register_free
2. Sign up with your email
3. Verify your email address
4. Login to your dashboard

### Step 2: Get Your Credentials

1. Go to https://cloudinary.com/console
2. You'll see your **Dashboard** with:
   - **Cloud Name** (e.g., `dxxx1234`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (click "Show" to reveal)

### Step 3: Update .env File

Open `/backend/.env` and replace these values:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Example:**
```env
CLOUDINARY_CLOUD_NAME=dxxx1234
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abc123XYZ456def789
```

### Step 4: Restart Backend Server

```bash
cd backend
npm start
```

---

## 📸 How to Use

### Product Images (Sellers)

**Upload up to 6 images per product:**

1. Login as Seller
2. Go to Seller Dashboard → Products → Add Product
3. Upload images (max 6, 5MB each)
4. Images are automatically uploaded to Cloudinary
5. Cloudinary URLs are saved in MongoDB

**Supported formats:** JPG, JPEG, PNG, GIF, WebP

### Banner Images (Admins)

**Upload banner background images:**

1. Login as Admin
2. Go to Admin Dashboard → Banners → Create Banner
3. Enter image URL field with Cloudinary URL
4. Or use the banner upload endpoint

**API Endpoint:**
```
POST /api/banners/upload-image
```

---

## 🗂️ Cloudinary Folder Structure

Images are organized in folders:

```
ecommerce/
├── products/        # Product images
│   ├── product-1234567890.jpg
│   ├── product-1234567891.jpg
│   └── ...
└── banners/         # Banner images
    ├── banner-1234567890.jpg
    └── ...
```

---

## 🔧 Technical Details

### Product Images
- **Max files:** 6 per upload
- **Max size:** 5MB per image
- **Auto-optimization:** Resized to max 1000x1000px
- **Folder:** `ecommerce/products`
- **API Endpoint:** `POST /api/products/upload-images`

### Banner Images
- **Max files:** 1 per upload
- **Max size:** 10MB per image
- **Auto-optimization:** Resized to max 1920x600px
- **Folder:** `ecommerce/banners`
- **API Endpoint:** `POST /api/banners/upload-image`

### Image URLs
Cloudinary returns full URLs like:
```
https://res.cloudinary.com/dxxx1234/image/upload/v1234567890/ecommerce/products/product-1234567890.jpg
```

These URLs are:
- ✅ Permanent (never expire)
- ✅ Fast (served via CDN)
- ✅ Secure (HTTPS)
- ✅ Optimized (auto-format, auto-quality)

---

## 🎨 Image Transformations

Cloudinary automatically optimizes images:

**Product Images:**
- Max dimensions: 1000x1000px
- Maintains aspect ratio
- Auto-format (serves WebP to modern browsers)
- Auto-quality optimization

**Banner Images:**
- Max dimensions: 1920x600px
- Optimized for web display
- Fast loading via CDN

---

## 📊 Monitoring Usage

1. Go to https://cloudinary.com/console
2. Check **Dashboard** for:
   - Storage used
   - Bandwidth used
   - Number of images
   - Transformations

**Free tier limits:**
- 25GB storage
- 25GB bandwidth/month
- 25,000 transformations/month

---

## 🔍 View Your Images

1. Go to https://cloudinary.com/console/media_library
2. Browse folders: `ecommerce/products` and `ecommerce/banners`
3. View, download, or delete images

---

## ❓ Troubleshooting

### Error: "Invalid credentials"
- Check your `.env` file has correct values
- Make sure you copied Cloud Name, API Key, and API Secret exactly
- Restart backend server after changing `.env`

### Error: "Folder not found"
- Cloudinary creates folders automatically on first upload
- Try uploading an image and the folder will be created

### Images not loading on frontend
- Check browser console for errors
- Verify Cloudinary URL is valid
- Check if image was actually uploaded (see Cloudinary Media Library)

### Quota exceeded
- Free tier: 25GB/month bandwidth
- Upgrade to paid plan or optimize images
- Check usage at https://cloudinary.com/console

---

## 🆚 Cloudinary vs Local Storage

| Feature | Local Storage | Cloudinary |
|---------|--------------|------------|
| Persistence | ❌ Lost on server crash | ✅ Always available |
| Speed | ⚠️ Depends on server | ✅ Fast CDN worldwide |
| Optimization | ❌ Manual | ✅ Automatic |
| Bandwidth | ⚠️ Uses your server | ✅ Uses Cloudinary |
| Scaling | ❌ Limited by disk | ✅ Unlimited |
| Cost | ✅ Free | ✅ Free tier (25GB) |

---

## 📝 Summary

1. ✅ Cloudinary integrated for product and banner images
2. ✅ Supports 6 product images per upload
3. ✅ Automatic image optimization
4. ✅ CDN delivery for fast loading
5. ✅ Free tier: 25GB storage + bandwidth

**Next steps:**
1. Sign up at https://cloudinary.com
2. Update `.env` with your credentials
3. Restart backend
4. Start uploading images! 🎉
