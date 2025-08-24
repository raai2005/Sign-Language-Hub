import type { NextApiRequest, NextApiResponse } from 'next';
import Groq from 'groq-sdk';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

// Random helper for fallback variety
function pickUnique<T>(arr: T[], count: number): T[] {
  const pool = [...arr];
  const out: T[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

// Fallback questions (non-AI) in case Groq API fails; randomized to avoid repetition
const fallbackQuestionSets: { [key: number]: () => Question[] } = {
  1: () => pickUnique('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), 5).map((letter, i) => ({
    id: i + 1,
    question: `Give me the hand image that expresses the alphabet '${letter}'`,
    options: ["Capture Image"],
    correctAnswer: letter,
    explanation: `Capture a clear image of your hand forming the correct ISL handshape for '${letter}'.`
  })),
  2: () => pickUnique('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), 5).map((letter, i) => ({
    id: i + 1,
    question: `Give me the hand image that expresses the alphabet '${letter}'`,
    options: ["Capture Image"],
    correctAnswer: letter,
    explanation: `Capture a clear image of your hand forming the correct ISL handshape for '${letter}'.`
  })),
  3: () => pickUnique('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), 5).map((letter, i) => ({
    id: i + 1,
    question: `Give me the hand image that expresses the alphabet '${letter}'`,
    options: ["Capture Image"],
    correctAnswer: letter,
    explanation: `Capture a clear image of your hand forming the correct ISL handshape for '${letter}'.`
  })),
  4: () => pickUnique('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), 5).map((letter, i) => ({
    id: i + 1,
    question: `Give me the hand image that expresses the alphabet '${letter}'`,
    options: ["Capture Image"],
    correctAnswer: letter,
    explanation: `Capture a clear image of your hand forming the correct ISL handshape for '${letter}'.`
  })),
  5: () => pickUnique('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''), 5).map((letter, i) => ({
    id: i + 1,
    question: `Give me the hand image that expresses the alphabet '${letter}'`,
    options: ["Capture Image"],
    correctAnswer: letter,
    explanation: `Capture a clear image of your hand forming the correct ISL handshape for '${letter}'.`
  })),
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
    console.log(`Attempting to generate questions for set ${setId} using Groq AI...`);

    // Always try to generate questions using Groq AI first
    const questions = await generateQuestionsWithGroq(setId);

    console.log(`Successfully generated ${questions.length} questions with Groq AI`);

    // Ensure exactly 5 questions are sent (randomize if more)
    const shuffled = [...questions].sort(() => Math.random() - 0.5);
    const five = shuffled.slice(0, 5).map((q, idx) => ({ ...q, id: idx + 1 }));

    res.status(200).json({
      questions: five,
      setId: setId,
      generated: new Date().toISOString(),
      aiGenerated: true,
      source: 'groq-ai'
    });

  } catch (error) {
    console.error('Error generating questions with Groq:', error);

    // Try alternative generation methods or enhanced fallback
    try {
      const enhancedQuestions = await generateEnhancedFallbackQuestions(setId);

      res.status(200).json({
        questions: enhancedQuestions,
        setId: setId,
        generated: new Date().toISOString(),
        aiGenerated: false,
        fallback: true,
        source: 'enhanced-fallback',
        message: 'Using enhanced fallback questions due to AI service unavailability'
      });
    } catch (fallbackError) {
      // Final fallback to basic questions
      const generator = fallbackQuestionSets[setId] || fallbackQuestionSets[1];
      const fallbackQuestions = generator();

      res.status(200).json({
  questions: fallbackQuestions,
        setId: setId,
        generated: new Date().toISOString(),
        aiGenerated: false,
        fallback: true,
        source: 'basic-fallback',
        message: 'Using basic fallback questions due to all AI services being unavailable'
      });
    }
  }
}

async function generateEnhancedFallbackQuestions(setId: number): Promise<Question[]> {
  // Enhanced fallback that creates more varied questions
  const letterSets = {
    1: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'], // Beginner
    2: ['K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'], // Intermediate  
    3: ['U', 'V', 'W', 'X', 'Y', 'Z', 'A', 'E', 'I', 'O'], // Advanced
    4: ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'], // Expert
    5: ['N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X']  // Master
  };

  const explanations: { [key: string]: string } = {
    'A': 'Form a fist with your thumb pointing upward along the side of your index finger.',
    'B': 'Hold your hand upright with all four fingers extended and pressed together, thumb folded across your palm.',
    'C': 'Curve your hand like you are holding a cup, with fingers and thumb forming a C shape.',
    'D': 'Point your index finger upward while keeping other fingers closed, thumb touches middle finger.',
    'E': 'Curl all fingers into a fist with fingertips touching your palm.',
    'F': 'Touch your index finger and thumb together forming a circle, other fingers extended upward.',
    'G': 'Point your index finger horizontally to the side, thumb pointing upward.',
    'H': 'Extend your index and middle fingers horizontally, other fingers closed.',
    'I': 'Extend only your pinky finger upward, other fingers closed in a fist.',
    'J': 'Extend your pinky finger and draw a J shape in the air.',
    'K': 'Extend index and middle fingers in a V shape, thumb between them.',
    'L': 'Form an L shape with your index finger pointing up and thumb pointing sideways.',
    'M': 'Fold your thumb under your first three fingers.',
    'N': 'Fold your thumb under your first two fingers.',
    'O': 'Curve all fingers and thumb to form a circle or oval shape.',
    'P': 'Similar to K but pointing downward.',
    'Q': 'Point your index finger and thumb downward.',
    'R': 'Cross your index and middle fingers.',
    'S': 'Make a fist with your thumb closed over your fingers.',
    'T': 'Make a fist with your thumb between your index and middle fingers.',
    'U': 'Extend your index and middle fingers upward, side by side.',
    'V': 'Extend your index and middle fingers upward in a V shape.',
    'W': 'Extend your index, middle, and ring fingers upward.',
    'X': 'Bend your index finger into a hook shape.',
    'Y': 'Extend your thumb and pinky finger, other fingers closed.',
    'Z': 'Draw a Z shape in the air with your index finger.'
  };

  const letters = letterSets[setId as keyof typeof letterSets] || letterSets[1];
  const chosen = pickUnique(letters, 5);

  return chosen.map((letter, index) => ({
    id: index + 1,
    question: `Give me the hand image that expresses the alphabet '${letter}'`,
    options: ["Capture Image"],
    correctAnswer: letter,
    explanation: explanations[letter] || `Capture a clear image of your hand forming the correct ISL handshape for '${letter}'.`
  }));
}

async function generateQuestionsWithGroq(setId: number): Promise<Question[]> {
  console.log(`Starting Groq question generation for set ${setId}`);

  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    console.error('Groq API key not configured');
    throw new Error('Groq API key not configured');
  }

  console.log('Groq API key found, initializing client...');

  const groq = new Groq({
    apiKey: GROQ_API_KEY,
  });

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

  // Add randomization elements to ensure variety
  const currentTime = new Date().getTime();
  const randomSeed = Math.floor(Math.random() * 1000);
  const sessionId = `${currentTime}_${randomSeed}`;

  // Create random letter suggestions for variety
  const allLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const shuffledLetters = [...allLetters].sort(() => Math.random() - 0.5);
  const suggestedLetters = shuffledLetters.slice(0, 12); // Get 12 random letters

  // Add variation prompts
  const variationPrompts = [
    "Focus on creating questions with letters that are commonly confused",
    "Include a mix of letters with different hand orientations",
    "Vary between letters with simple and complex handshapes",
    "Create questions testing letters with similar finger positions",
    "Mix letters that require different thumb positions"
  ];
  const selectedVariation = variationPrompts[Math.floor(Math.random() * variationPrompts.length)];

  const prompt = `You are an expert Indian Sign Language (ISL) instructor. Generate exactly 5 UNIQUE questions for ${difficulty.level} level students.

SESSION: ${sessionId}
CONTEXT: ${difficulty.context}
FOCUS AREAS: ${difficulty.focus}
VARIATION INSTRUCTION: ${selectedVariation}
SUGGESTED LETTERS (use some of these for variety): ${suggestedLetters.join(', ')}

STRICT REQUIREMENTS:
1) Generate EXACTLY 5 questions
2) EVERY question MUST be an IMAGE-CAPTURE task with options strictly as ["Capture Image"]
3) Each question MUST ask the learner to provide a hand image that expresses a specific ISL alphabet letter (A-Z)
4) ENSURE VARIETY - Use different letters across questions, avoid repetition when possible
5) The "correctAnswer" MUST be the target alphabet letter (single uppercase character like "A")
6) The "explanation" MUST describe the correct handshape/orientation for that letter in clear, concise terms
7) Keep the wording simple: "Give me the hand image that expresses the alphabet '<LETTER>'"
8) RANDOMIZE the order of letters - don't use alphabetical sequence

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

Generate the 5 VARIED questions now for Set ${setId} (${difficulty.level} level).`;

  try {
    console.log('Sending request to Groq API...');

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert Indian Sign Language (ISL) instructor. You must respond with valid JSON only, containing exactly 5 questions for image capture tasks. Ensure variety in letter selection for each session."
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.8, // Higher temperature for more variation
      max_tokens: 2048,
      top_p: 0.9, // Add nucleus sampling for more diversity
    });

    console.log('Received response from Groq API');

    const response = chatCompletion.choices[0]?.message?.content;

    if (!response) {
      console.error('No response content from Groq AI');
      throw new Error('No response from Groq AI');
    }

    console.log('Response length:', response.length);
    console.log('Response preview:', response.substring(0, 200) + '...');

    // Clean and extract JSON from response
    let cleanedResponse = response.trim();

    // Remove any markdown code blocks
    cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    // Extract JSON from response
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON response from Groq AI');
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);

    if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
      throw new Error('Invalid question format from Groq AI');
    }

  // Validate and format questions with robust error handling
    const questions: Question[] = [];
    const targetLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

    for (let i = 0; i < 5; i++) {
      const q = parsedResponse.questions[i] || {};
      const fallbackLetter = targetLetters[(setId - 1) * 5 + i] || targetLetters[i] || 'A';

      questions.push({
        id: i + 1,
        question: (typeof q.question === 'string' && q.question.includes('alphabet'))
          ? q.question
          : `Give me the hand image that expresses the alphabet '${fallbackLetter}'`,
        options: ["Capture Image"],
        correctAnswer: (typeof q.correctAnswer === 'string' && q.correctAnswer.trim().length === 1 && /^[A-Z]$/.test(q.correctAnswer.toUpperCase()))
          ? q.correctAnswer.toUpperCase()
          : fallbackLetter,
        explanation: (typeof q.explanation === 'string' && q.explanation.length > 10)
          ? q.explanation
          : `Capture a clear image of your hand forming the correct ISL handshape for letter '${fallbackLetter}'.`
      });
    }

    // Final validation - ensure we have exactly 5 valid questions
    if (questions.length !== 5) {
      throw new Error(`Generated ${questions.length} questions instead of 5`);
    }

    return questions;

  } catch (error) {
    console.error('Groq AI generation error:', error);
    throw error;
  }
}
