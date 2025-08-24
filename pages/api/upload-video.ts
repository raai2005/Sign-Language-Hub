import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { videoData, questionId, setId } = req.body as { videoData: string; questionId?: number; setId?: number };

    if (!videoData) {
      return res.status(400).json({ message: 'Missing video data' });
    }

    // If it's a data URL, echo back as-is (no cloud configured)
    if (typeof videoData === 'string' && videoData.startsWith('data:')) {
      return res.status(200).json({ success: true, videoUrl: videoData, provider: 'local-echo' });
    }

    // In a real deployment, upload to a storage provider (Cloudinary, S3, etc.)
    // For now, just pass through the URL
    return res.status(200).json({ success: true, videoUrl: videoData, provider: 'pass-through' });

  } catch (error) {
    console.error('Video upload error:', error);
    return res.status(500).json({ message: 'Failed to upload video' });
  }
}
