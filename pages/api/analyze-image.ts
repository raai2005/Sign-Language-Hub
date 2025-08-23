import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ImageAnalysisResult {
    isCorrect: boolean;
    confidence: number;
    detectedLetter: string;
    analysis: string;
    feedback: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { imageUrl, expectedLetter, questionText } = req.body;

        if (!imageUrl || !expectedLetter) {
            return res.status(400).json({ message: 'Image URL and expected letter are required' });
        }

        // Check if Gemini API is configured
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {
            return res.status(200).json({
                success: false,
                fallback: true,
                message: 'Gemini Vision not configured, using fallback analysis',
                result: await getFallbackAnalysis(expectedLetter, questionText)
            });
        }

        // Analyze image with Gemini Vision
        const result = await analyzeImageWithGemini(imageUrl, expectedLetter, questionText);

        res.status(200).json({
            success: true,
            result: result,
            message: 'Image analyzed successfully with Gemini Vision'
        });

    } catch (error) {
        console.error('Image analysis error:', error);

        // Fallback to educational guidance
        const fallbackResult = await getFallbackAnalysis(req.body.expectedLetter, req.body.questionText);

        res.status(200).json({
            success: false,
            fallback: true,
            error: error instanceof Error ? error.message : 'Analysis failed',
            result: fallbackResult,
            message: 'Using fallback analysis due to error'
        });
    }
}

async function analyzeImageWithGemini(imageUrl: string, expectedLetter: string, questionText: string): Promise<ImageAnalysisResult> {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

        // Fetch the image
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
            throw new Error('Failed to fetch image');
        }

        const imageBuffer = await imageResponse.arrayBuffer();
        const imageBase64 = Buffer.from(imageBuffer).toString('base64');

        const prompt = `You are an expert Indian Sign Language (ISL) instructor analyzing a student's hand gesture image.

TASK: Analyze this image to determine if the student is correctly forming the ISL handshape for letter "${expectedLetter}".

QUESTION CONTEXT: "${questionText}"

Please provide a detailed analysis in the following JSON format:

{
  "isCorrect": boolean,
  "confidence": number (0-100),
  "detectedLetter": "X" (what letter the gesture appears to represent),
  "analysis": "Detailed description of what you see in the image",
  "feedback": "Specific feedback about correctness and improvements needed"
}

ANALYSIS CRITERIA:
1. Hand position and orientation
2. Finger placement and extension
3. Thumb position
4. Overall handshape accuracy
5. Clarity of the gesture

Be precise in your analysis. If the gesture is correct, provide encouraging feedback. If incorrect, give specific guidance on how to improve.

Return ONLY the JSON response, no other text.`;

        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType: "image/jpeg",
                    data: imageBase64
                }
            },
            { text: prompt }
        ]);

        const response = await result.response;
        const text = response.text();

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid JSON response from Gemini');
        }

        const analysisResult = JSON.parse(jsonMatch[0]);

        // Validate the response structure
        if (typeof analysisResult.isCorrect !== 'boolean' ||
            typeof analysisResult.confidence !== 'number' ||
            typeof analysisResult.detectedLetter !== 'string' ||
            typeof analysisResult.analysis !== 'string' ||
            typeof analysisResult.feedback !== 'string') {
            throw new Error('Invalid analysis result structure');
        }

        return analysisResult;

    } catch (error) {
        console.error('Gemini analysis error:', error);
        throw error;
    }
}

async function getFallbackAnalysis(expectedLetter: string, questionText: string): Promise<ImageAnalysisResult> {
    // ISL hand descriptions for common letters
    const islDescriptions: { [key: string]: string } = {
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

    const description = islDescriptions[expectedLetter] || 'Follow standard ISL guidelines for this letter.';

    return {
        isCorrect: false,
        confidence: 0,
        detectedLetter: 'Unknown',
        analysis: 'Unable to analyze image automatically. Manual verification needed.',
        feedback: `For letter "${expectedLetter}": ${description}\n\nPlease ensure:\n- Your hand is clearly visible\n- Good lighting conditions\n- Plain background\n- Hold the gesture steady\n\nCompare your hand position with ISL reference materials to verify correctness.`
    };
}
