import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

// Fallback questions in case Gemini API fails
const fallbackQuestionSets: { [key: number]: Question[] } = {
  1: Array.from({ length: 10 }, (_, i) => {
    const letter = String.fromCharCode(65 + ((i + 0) % 26));
    return {
      id: i + 1,
      question: `Give me the hand image that expresses the alphabet '${letter}'`,
      options: ["Capture Image"],
      correctAnswer: letter,
      explanation: `Capture a clear image of your hand forming the correct ISL handshape for '${letter}'.`
    };
  }),
  2: Array.from({ length: 10 }, (_, i) => {
    const letter = String.fromCharCode(65 + ((i + 5) % 26));
    return {
      id: i + 1,
      question: `Give me the hand image that expresses the alphabet '${letter}'`,
      options: ["Capture Image"],
      correctAnswer: letter,
      explanation: `Capture a clear image of your hand forming the correct ISL handshape for '${letter}'.`
    };
  }),
  3: Array.from({ length: 10 }, (_, i) => {
    const letter = String.fromCharCode(65 + ((i + 10) % 26));
    return {
      id: i + 1,
      question: `Give me the hand image that expresses the alphabet '${letter}'`,
      options: ["Capture Image"],
      correctAnswer: letter,
      explanation: `Capture a clear image of your hand forming the correct ISL handshape for '${letter}'.`
    };
  }),
  4: Array.from({ length: 10 }, (_, i) => {
    const letter = String.fromCharCode(65 + ((i + 15) % 26));
    return {
      id: i + 1,
      question: `Give me the hand image that expresses the alphabet '${letter}'`,
      options: ["Capture Image"],
      correctAnswer: letter,
      explanation: `Capture a clear image of your hand forming the correct ISL handshape for '${letter}'.`
    };
  }),
  5: Array.from({ length: 10 }, (_, i) => {
    const letter = String.fromCharCode(65 + ((i + 20) % 26));
    return {
      id: i + 1,
      question: `Give me the hand image that expresses the alphabet '${letter}'`,
      options: ["Capture Image"],
      correctAnswer: letter,
      explanation: `Capture a clear image of your hand forming the correct ISL handshape for '${letter}'.`
    };
  }),
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { setId } = req.body;

  if (!setId || setId < 1 || setId > 5) {
    return res.status(400).json({ message: 'Invalid set ID' });
  }

  try {
    // Generate questions using Gemini AI
    const questions = await generateQuestionsWithGemini(setId);

    res.status(200).json({
      questions: questions,
      setId: setId,
      generated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating questions:', error);
    
    // Fallback to predefined questions if Gemini fails
    const fallbackQuestions = fallbackQuestionSets[setId] || fallbackQuestionSets[1];
    
    res.status(200).json({
      questions: fallbackQuestions,
      setId: setId,
      generated: new Date().toISOString(),
      fallback: true,
      message: 'Using fallback questions due to AI service unavailability'
    });
  }
}

async function generateQuestionsWithGemini(setId: number): Promise<Question[]> {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  // Try multiple model versions for better compatibility
  const modelCandidates = ["gemini-2.5-pro", "gemini-1.5-pro", "gemini-pro"] as const;
  let model = genAI.getGenerativeModel({ model: modelCandidates[0] });

  // Define difficulty levels and contexts
  const difficultyLevels = {
    1: { 
      level: "Beginner", 
      context: "Basic alphabet recognition and simple hand formations for new learners",
      focus: "fundamental letter shapes, basic hand positions, common letters A-Z"
    },
    2: { 
      level: "Intermediate", 
      context: "Letter combinations, common confusions, and basic techniques",
      focus: "similar-looking letters, finger positioning details, basic transitions"
    },
    3: { 
      level: "Advanced", 
      context: "Complex hand positions, transitions, and professional techniques",
      focus: "subtle differences, hand orientation, advanced letter formations"
    },
    4: { 
      level: "Expert", 
      context: "Linguistic principles, coarticulation, and advanced interpretation skills",
      focus: "sign language linguistics, professional interpretation, advanced techniques"
    },
    5: { 
      level: "Master", 
      context: "Research-level concepts, morphophonology, and psycholinguistic analysis",
      focus: "academic concepts, research methodology, expert-level analysis"
    }
  };

  const difficulty = difficultyLevels[setId as keyof typeof difficultyLevels];

  const prompt = `You are an expert Indian Sign Language (ISL) instructor. Generate exactly 10 questions for ${difficulty.level} level students.

CONTEXT: ${difficulty.context}
FOCUS AREAS: ${difficulty.focus}

STRICT REQUIREMENTS:
1) Generate EXACTLY 10 questions
2) EVERY question MUST be an IMAGE-CAPTURE task with options strictly as ["Capture Image"]
3) Each question MUST ask the learner to provide a hand image that expresses a specific ISL alphabet letter (A-Z)
4) Vary the letters across questions and avoid repetition when possible
5) The "correctAnswer" MUST be the target alphabet letter (single uppercase character like "A")
6) The "explanation" MUST describe the correct handshape/orientation for that letter in clear, concise terms
7) Keep the wording simple: "Give me the hand image that expresses the alphabet '<LETTER>'"

OUTPUT FORMAT (valid JSON only):
{
  "questions": [
    {
      "id": 1,
      "question": "Give me the hand image that expresses the alphabet 'A'",
      "options": ["Capture Image"],
      "correctAnswer": "A",
      "explanation": "Brief guidance on the correct ISL handshape for 'A'"
    }
  ]
}

Generate the 10 questions now for Set ${setId} (${difficulty.level} level).`;

  try {
    let result;
    let lastErr: any = null;
    for (const name of modelCandidates) {
      try {
        model = genAI.getGenerativeModel({ model: name });
        result = await model.generateContent(prompt);
        break;
      } catch (e) {
        lastErr = e;
        continue;
      }
    }
    if (!result) throw lastErr || new Error('Failed to generate content');
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Gemini AI');
    }
    
    const parsedResponse = JSON.parse(jsonMatch[0]);
    
    if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
      throw new Error('Invalid question format from Gemini AI');
    }

    // Validate and format questions
    const questions: Question[] = parsedResponse.questions.slice(0, 10).map((q: any, index: number) => ({
      id: index + 1,
      question: q.question || `Give me the hand image that expresses the alphabet '${String.fromCharCode(65 + (index % 26))}'`,
      options: ["Capture Image"],
      correctAnswer: (typeof q.correctAnswer === 'string' && q.correctAnswer.trim().length === 1)
        ? q.correctAnswer.toUpperCase()
        : String.fromCharCode(65 + (index % 26)),
      explanation: q.explanation || "Capture a clear image of your hand forming the correct ISL handshape for this letter."
    }));

    // Ensure we have exactly 10 questions
    if (questions.length < 10) {
      throw new Error(`Only ${questions.length} questions generated, need 10`);
    }

    return questions.slice(0, 10);

  } catch (error) {
    console.error('Gemini AI generation error:', error);
    throw error;
  }
}
