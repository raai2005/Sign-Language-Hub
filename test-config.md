# Quick Test Configuration

## 🎯 **For Immediate Testing**

Add this to your `.env.local` file:

```env
# Cloudinary Configuration (Demo Mode)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=demo
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=abcdefgh
```

## 🎯 **What This Does**

- Uses Cloudinary's demo account
- Shows placeholder images
- Lets you test the website functionality
- No real images needed for testing

## 🎯 **Next Steps**

1. **Add the demo config** to `.env.local`
2. **Restart your server** (`npm run dev`)
3. **Visit** `http://localhost:3003/learn`
4. **Click on letters** to see the modal working

## 🎯 **When You Have Real Images**

Replace the demo config with your real Cloudinary credentials:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_real_cloud_name
CLOUDINARY_API_KEY=your_real_api_key
CLOUDINARY_API_SECRET=your_real_api_secret
```
