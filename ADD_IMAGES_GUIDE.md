# How to Add Real Hand Gesture Images

## 🎯 **Current Status:**

Your website is working with placeholder images. To show real hand gesture images, follow these steps:

## 🚀 **Option 1: Use Cloudinary (Recommended)**

### **Step 1: Create Cloudinary Account**

1. **Go to [cloudinary.com](https://cloudinary.com)**
2. **Click "Sign Up"** (free tier available)
3. **Fill in your details** and verify email
4. **Login to your dashboard**

### **Step 2: Get Your Credentials**

1. **In Cloudinary Dashboard**, find:
   - **Cloud Name** (top right corner)
   - **API Key** (Settings → Access Keys)
   - **API Secret** (Settings → Access Keys)
2. **Copy these values**

### **Step 3: Create Environment File**

1. **Create `.env.local` file** in your project root
2. **Add your credentials:**
   ```env
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
   CLOUDINARY_API_KEY=your_api_key_here
   CLOUDINARY_API_SECRET=your_api_secret_here
   ```

### **Step 4: Upload Images**

1. **Go to Cloudinary Media Library**
2. **Click "Upload"**
3. **Create folder:** `isl`
4. **Upload 26 images** with these exact names:
   - `letter-a.jpg`
   - `letter-b.jpg`
   - `letter-c.jpg`
   - ... (continue for all 26 letters)
   - `letter-z.jpg`

### **Step 5: Test**

1. **Restart your server:** `npm run dev`
2. **Visit** `http://localhost:3003/learn`
3. **Click on letters** - Real images should now show!

## 🎯 **Option 2: Use Local Images (Alternative)**

### **Step 1: Create Images Folder**

1. **Create folder:** `public/images/isl/`
2. **Add your 26 images** with names: `letter-a.jpg`, `letter-b.jpg`, etc.

### **Step 2: Update Code**

Replace the Cloudinary URLs with local paths in `pages/learn.tsx`:

```javascript
handImage: `/images/isl/letter-${letter.toLowerCase()}.jpg`;
```

## 🎯 **Option 3: Use Free Stock Images**

### **Step 1: Find Images**

Visit these sites for free hand sign images:

- **Unsplash**: https://unsplash.com/s/photos/hand-signs
- **Pexels**: https://www.pexels.com/search/hand%20signs/
- **Pixabay**: https://pixabay.com/images/search/hand%20signs/

### **Step 2: Download and Rename**

1. **Download 26 hand sign images**
2. **Rename them** to: `letter-a.jpg`, `letter-b.jpg`, etc.
3. **Follow Option 1 or 2** above to upload them

## 🎯 **Image Requirements**

### **Recommended Specifications:**

- **Format**: JPG or PNG
- **Size**: 400x400 pixels minimum
- **Background**: White or light colored
- **Lighting**: Well-lit, clear visibility
- **Hand Position**: Clear, centered in frame

### **File Naming Convention:**

```
letter-a.jpg
letter-b.jpg
letter-c.jpg
...
letter-z.jpg
```

## 🎯 **Quick Test Setup**

If you want to test immediately with placeholder images:

1. **Create `.env.local` file:**

   ```env
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=demo
   CLOUDINARY_API_KEY=123456789
   CLOUDINARY_API_SECRET=abcdefgh
   ```

2. **Restart server:** `npm run dev`

3. **Visit website** - You'll see colored placeholder images with letter names

## 🎯 **Troubleshooting**

### **Images not showing?**

1. **Check file names** - Must be exactly `letter-a.jpg`, `letter-b.jpg`, etc.
2. **Check folder structure** - Images must be in `isl` folder
3. **Check credentials** - Verify Cloudinary credentials in `.env.local`
4. **Restart server** after changing `.env.local`

### **Wrong images showing?**

1. **Check file names** - Must match exactly
2. **Clear browser cache** - Press Ctrl+F5
3. **Check Cloudinary folder** - Images must be in `isl` folder

## 🎯 **Next Steps**

1. **Choose your option** (Cloudinary, Local, or Stock Images)
2. **Follow the steps** for your chosen option
3. **Test the website** - Images should show in modals
4. **Enjoy your working ISL website!** 🎉

**Which option would you like to try first?**
