import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface UserAnswer {
  questionId: number;
  selectedAnswer: string;
  imageUrl?: string;
  timestamp: Date;
}

interface ExamResult {
  score: number;
  totalQuestions: number;
  answers: UserAnswer[];
  feedback: {
    questionId: number;
    isCorrect: boolean;
    correctAnswer: string;
    explanation: string;
    geminiAnalysis?: string;
  }[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { setId, questions, answers } = req.body;

  if (!setId || !questions || !answers) {
    return res.status(400).json({ message: 'Missing required data' });
  }

  try {
    // Process each answer and evaluate with Gemini AI
    const feedback = await evaluateAnswersWithGemini(questions, answers);
    
    // Calculate score
    const correctAnswers = feedback.filter(f => f.isCorrect).length;
    
    const result: ExamResult = {
      score: correctAnswers,
      totalQuestions: questions.length,
      answers: answers,
      feedback: feedback
    };

    res.status(200).json(result);

  } catch (error) {
    console.error('Error evaluating exam:', error);
    res.status(500).json({ message: 'Failed to evaluate exam' });
  }
}

async function evaluateAnswersWithGemini(questions: Question[], answers: UserAnswer[]) {
  const feedback = [];

  for (const question of questions) {
    const userAnswer = answers.find(a => a.questionId === question.id);
    
    if (!userAnswer) {
      feedback.push({
        questionId: question.id,
        isCorrect: false,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        geminiAnalysis: 'No answer provided'
      });
      continue;
    }

    let isCorrect = false;
    let geminiAnalysis = '';

    // For text-based answers
    if (!userAnswer.imageUrl) {
      isCorrect = userAnswer.selectedAnswer.toLowerCase().trim() === 
                 question.correctAnswer.toLowerCase().trim();
    } else {
      // For image-based answers, use Gemini AI to analyze
      geminiAnalysis = await analyzeImageWithGemini(userAnswer.imageUrl, question);
      isCorrect = geminiAnalysis.includes('correct') || geminiAnalysis.includes('accurate');
    }

    feedback.push({
      questionId: question.id,
      isCorrect: isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      geminiAnalysis: geminiAnalysis || undefined
    });
  }

  return feedback;
}

async function analyzeImageWithGemini(imageUrl: string, question: Question): Promise<string> {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured');
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

    // Download and convert image to base64 if it's a URL
    let imageData;
    if (imageUrl.startsWith('http')) {
      const response = await fetch(imageUrl);
      const arrayBuffer = await response.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');
      imageData = {
        inlineData: {
          data: base64,
          mimeType: response.headers.get('content-type') || 'image/jpeg'
        }
      };
    } else {
      // Handle base64 data URLs
      const [mimeInfo, base64Data] = imageUrl.split(',');
      const mimeType = mimeInfo.match(/:(.*?);/)?.[1] || 'image/jpeg';
      imageData = {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      };
    }

    const prompt = `You are an expert Indian Sign Language (ISL) instructor. Analyze this hand gesture image and evaluate if it correctly represents the answer to this question.

QUESTION: "${question.question}"
EXPECTED ANSWER: "${question.correctAnswer}"

Please analyze the image and provide:

1. **Recognition**: What ISL letter or sign do you see in the image?
2. **Accuracy**: Is this the correct answer to the question? (YES/NO)
3. **Hand Position**: Describe the hand shape, finger positions, and orientation
4. **Evaluation**: Rate the accuracy (Perfect/Good/Needs Improvement/Incorrect)
5. **Feedback**: Specific suggestions for improvement if needed

ANALYSIS CRITERIA:
- Hand shape and finger positioning
- Thumb placement and orientation
- Palm direction and angle
- Overall form and clarity
- Adherence to ISL standards

Provide a detailed, educational response that helps the student learn.`;

    const result = await model.generateContent([prompt, imageData]);
    const response = await result.response;
    const analysis = response.text();

    return analysis;

  } catch (error) {
    console.error('Error analyzing image with Gemini Vision:', error);
    
    // Provide fallback analysis
    return `Unable to analyze image with AI vision. Error: ${error instanceof Error ? error.message : 'Unknown error'}. 
    
Please ensure:
1. The image is clear and well-lit
2. Your hand is clearly visible against a plain background
3. The gesture is held steady and matches ISL standards
4. The image format is supported (JPG, PNG, WebP)

For the question "${question.question}", the correct answer should be: "${question.correctAnswer}". 
Please review your hand position and try again if needed.`;
  }
}

// Function to call actual Gemini Vision API (for future implementation)
async function callGeminiVisionAPI(imageUrl: string, prompt: string) {
  // This would be the actual Gemini Vision API integration
  // You would need to:
  // 1. Set up Google AI Studio account
  // 2. Get API key
  // 3. Use the Gemini Vision model
  
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  // Example API call structure (adapt based on actual Gemini API):
  // const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-vision:analyze', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${GEMINI_API_KEY}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({
  //     prompt: prompt,
  //     image: imageUrl,
  //     parameters: {
  //       maxTokens: 500,
  //       temperature: 0.3
  //     }
  //   })
  // });
  
  // return await response.json();
}
