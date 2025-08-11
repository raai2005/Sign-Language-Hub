import type { NextApiRequest, NextApiResponse } from 'next';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { imageData, questionId, setId, userId } = req.body;

    if (!imageData) {
      return res.status(400).json({ message: 'No image data provided' });
    }

    if (!setId || !questionId) {
      return res.status(400).json({ message: 'Set ID and Question ID are required' });
    }

    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.log('Cloudinary not configured, using fallback simulation');
      
      // Fallback to simulation if Cloudinary not configured
      const timestamp = Date.now();
      const simulatedUrl = `https://res.cloudinary.com/demo/image/upload/v${timestamp}/sign-language-exams/set_${setId}_question_${questionId}_${timestamp}.jpg`;
      
      return res.status(200).json({ 
        success: true, 
        imageUrl: simulatedUrl,
        message: 'Image upload simulated (Cloudinary not configured)',
        fallback: true
      });
    }

    const timestamp = Date.now();
    const publicId = `sign-language-exams/set_${setId}/question_${questionId}_${userId || 'anonymous'}_${timestamp}`;

    // Upload to Cloudinary with optimizations
    const result = await cloudinary.uploader.upload(imageData, {
      public_id: publicId,
      folder: 'sign-language-exams',
      transformation: [
        { width: 800, height: 600, crop: 'fill', gravity: 'center' },
        { quality: 'auto:good' },
        { format: 'jpg' }
      ],
      resource_type: 'image',
      overwrite: true,
      invalidate: true,
    });

    // Generate additional formats for AI analysis
    const formats = {
      original: result.secure_url,
      thumbnail: cloudinary.url(result.public_id, {
        width: 200,
        height: 200,
        crop: 'fill',
        quality: 'auto:good',
        format: 'jpg'
      }),
      analysis: cloudinary.url(result.public_id, {
        width: 512,
        height: 512,
        crop: 'fill',
        quality: 'auto:best',
        format: 'png'
      })
    };

    res.status(200).json({ 
      success: true, 
      imageUrl: result.secure_url,
      publicId: result.public_id,
      formats: formats,
      metadata: {
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        uploadedAt: new Date().toISOString()
      },
      message: 'Image uploaded successfully to Cloudinary'
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('Invalid image file')) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid image format. Please provide a valid image.' 
        });
      }
      if (error.message.includes('File size too large')) {
        return res.status(400).json({ 
          success: false, 
          error: 'Image file is too large. Please compress the image.' 
        });
      }
    }

    res.status(500).json({ 
      success: false, 
      error: 'Failed to upload image',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}; 