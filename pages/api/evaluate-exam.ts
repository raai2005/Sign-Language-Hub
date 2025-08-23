import type { NextApiRequest, NextApiResponse } from 'next';
import Groq from 'groq-sdk';

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
    groqAnalysis?: string;
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
    // Process each answer and evaluate with Groq AI
    const feedback = await evaluateAnswersWithGroq(questions, answers);

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

async function evaluateAnswersWithGroq(questions: Question[], answers: UserAnswer[]) {
  const feedback = [];

  for (const question of questions) {
    const userAnswer = answers.find(a => a.questionId === question.id);

    if (!userAnswer) {
      feedback.push({
        questionId: question.id,
        isCorrect: false,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        groqAnalysis: 'No answer provided'
      });
      continue;
    }

    let isCorrect = false;
    let groqAnalysis = '';

    // For text-based answers
    if (!userAnswer.imageUrl) {
      isCorrect = userAnswer.selectedAnswer.toLowerCase().trim() ===
        question.correctAnswer.toLowerCase().trim();
    } else {
      // For image-based answers, use our new image analysis API
      try {
        const analysisResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/analyze-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageUrl: userAnswer.imageUrl,
            expectedLetter: question.correctAnswer,
            questionText: question.question
          }),
        });

        if (analysisResponse.ok) {
          const analysisResult = await analysisResponse.json();

          if (analysisResult.success && analysisResult.result) {
            isCorrect = analysisResult.result.isCorrect;
            groqAnalysis = `**Image Analysis Result:**\n\n**Detected:** ${analysisResult.result.detectedLetter}\n**Confidence:** ${analysisResult.result.confidence}%\n\n**Analysis:** ${analysisResult.result.analysis}\n\n**Feedback:** ${analysisResult.result.feedback}`;
          } else {
            // Use fallback analysis
            isCorrect = false;
            groqAnalysis = analysisResult.result?.feedback || 'Unable to analyze image. Please ensure the image is clear and shows the correct hand gesture.';
          }
        } else {
          throw new Error('Image analysis API failed');
        }
      } catch (error) {
        console.error('Error calling image analysis API:', error);
        // Fallback to educational guidance
        groqAnalysis = await analyzeImageWithGroq(userAnswer.imageUrl, question);
        isCorrect = false; // Conservative approach when analysis fails
      }
    }

    feedback.push({
      questionId: question.id,
      isCorrect: isCorrect,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      groqAnalysis: groqAnalysis || undefined
    });
  }

  return feedback;
}

async function analyzeImageWithGroq(imageUrl: string, question: Question): Promise<string> {
  try {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      throw new Error('Groq API key not configured');
    }

    const groq = new Groq({
      apiKey: GROQ_API_KEY,
    });

    // Note: Groq doesn't have vision capabilities like Gemini Vision
    // We'll provide text-based analysis based on the question and expected answer
    const prompt = `You are an expert Indian Sign Language (ISL) instructor. A student has submitted an image for this question:

QUESTION: "${question.question}"
EXPECTED ANSWER: "${question.correctAnswer}"

Since I cannot analyze the actual image, please provide educational feedback about what the student should look for in their hand gesture for the letter "${question.correctAnswer}" in Indian Sign Language.

Please provide:

1. **Expected Hand Position**: Describe the correct hand shape, finger positions, and orientation for letter "${question.correctAnswer}"
2. **Common Mistakes**: What are typical errors students make with this letter?
3. **Tips for Improvement**: Specific suggestions for perfecting this handshape
4. **Self-Check**: What should the student verify in their own gesture?

Provide a detailed, educational response that helps the student learn ISL properly.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
    });

    const response = chatCompletion.choices[0]?.message?.content;

    if (!response) {
      throw new Error('No response from Groq AI');
    }

    return response;

  } catch (error) {
    console.error('Error analyzing with Groq:', error);

    // Provide fallback analysis
    return `Unable to analyze image with AI. Please ensure:
    
1. The image is clear and well-lit
2. Your hand is clearly visible against a plain background
3. The gesture is held steady and matches ISL standards
4. The image format is supported (JPG, PNG, WebP)

For the question "${question.question}", the correct answer should be: "${question.correctAnswer}". 

**Expected Hand Position for "${question.correctAnswer}":**
Please refer to ISL resources to verify the correct handshape, finger positioning, and orientation for this letter. Make sure your thumb, fingers, and palm are positioned according to standard ISL guidelines.

**Self-Check Tips:**
- Compare your hand position with reference ISL alphabet charts
- Ensure all fingers are positioned correctly
- Check that your palm orientation matches the standard
- Hold the position steady and clearly

Please review your hand position and try again if needed.`;
  }
}

// Function to call actual Groq API (current implementation)
async function callGroqAPI(prompt: string) {
  // This is our current Groq API integration
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    throw new Error('Groq API key not configured');
  }

  const groq = new Groq({
    apiKey: GROQ_API_KEY,
  });

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
    max_tokens: 1024,
  });

  return chatCompletion.choices[0]?.message?.content || '';
}
