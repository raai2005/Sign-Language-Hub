import type { NextApiRequest, NextApiResponse } from 'next';

interface UserAnswer {
  questionId: number;
  selectedAnswer: string;
  imageUrl?: string;
  timestamp: Date;
}

// In-memory storage for demonstration (in production, use a real database)
const examSessions: { [sessionId: string]: UserAnswer[] } = {};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { setId, answer } = req.body;

  if (!setId || !answer) {
    return res.status(400).json({ message: 'Missing setId or answer' });
  }

  try {
    // Create session ID based on setId and timestamp
    const sessionId = `set_${setId}_${Date.now()}`;
    
    // Handle image upload if present
    if (answer.imageUrl && answer.imageUrl.startsWith('data:')) {
      // In a real implementation, you would upload to Cloudinary here
      const cloudinaryUrl = uploadToCloudinary(answer.imageUrl);
      answer.imageUrl = cloudinaryUrl;
    }

    // Save answer to session
    if (!examSessions[sessionId]) {
      examSessions[sessionId] = [];
    }
    
    examSessions[sessionId].push({
      ...answer,
      timestamp: new Date()
    });

    // In a real implementation, save to database
    // await saveToDatabase(sessionId, answer);

    res.status(200).json({
      success: true,
      sessionId: sessionId,
      message: 'Answer saved successfully'
    });

  } catch (error) {
    console.error('Error saving answer:', error);
    res.status(500).json({ message: 'Failed to save answer' });
  }
}

// Placeholder function for Cloudinary upload
function uploadToCloudinary(imageData: string): string {
  // In a real implementation, this would upload to Cloudinary
  // and return the public URL
  
  // For now, return a placeholder URL
  return `https://res.cloudinary.com/demo/image/upload/v1234567890/sign_language_answer_${Date.now()}.jpg`;
}

// Placeholder function for database save
async function saveToDatabase(sessionId: string, answer: UserAnswer) {
  // In a real implementation, this would save to your database
  // Examples: MongoDB, PostgreSQL, Firebase, etc.
  
  console.log(`Saving answer for session ${sessionId}:`, answer);
  
  // Example database query:
  // await db.collection('exam_answers').add({
  //   sessionId,
  //   questionId: answer.questionId,
  //   selectedAnswer: answer.selectedAnswer,
  //   imageUrl: answer.imageUrl,
  //   timestamp: answer.timestamp
  // });
}
