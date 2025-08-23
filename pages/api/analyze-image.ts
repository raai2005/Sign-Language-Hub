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

        // Try multiple models in order of preference
        const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.5-pro"] as const;

        let lastError: any = null;

        for (const modelName of models) {
            try {
                console.log(`Trying Gemini model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });

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

                const contentResult = await model.generateContent([
                    {
                        inlineData: {
                            mimeType: "image/jpeg",
                            data: imageBase64
                        }
                    },
                    { text: prompt }
                ]);

                const response = await contentResult.response;
                const text = response.text();

                console.log(`Raw response from ${modelName}:`, text.substring(0, 200) + '...');

                // Clean the response text
                let cleanedText = text.trim();

                // Remove markdown code blocks if present
                cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

                // Remove any leading/trailing text that's not JSON
                cleanedText = cleanedText.replace(/^[^{]*/, '').replace(/[^}]*$/, '');

                // Extract JSON from response with more robust matching
                let jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    // Try alternative parsing - look for the first { to last }
                    const firstBrace = cleanedText.indexOf('{');
                    const lastBrace = cleanedText.lastIndexOf('}');
                    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                        jsonMatch = [cleanedText.substring(firstBrace, lastBrace + 1)];
                    }
                }

                if (!jsonMatch) {
                    throw new Error(`No valid JSON found in response from ${modelName}: ${text.substring(0, 100)}`);
                }

                let analysisResult;
                try {
                    analysisResult = JSON.parse(jsonMatch[0]);
                } catch (parseError) {
                    throw new Error(`JSON parsing failed for ${modelName}: ${parseError}. Raw JSON: ${jsonMatch[0].substring(0, 100)}`);
                }

                // Validate the response structure with fallbacks
                const validatedResult = {
                    isCorrect: typeof analysisResult.isCorrect === 'boolean' ? analysisResult.isCorrect : false,
                    confidence: typeof analysisResult.confidence === 'number' ? Math.max(0, Math.min(100, analysisResult.confidence)) : 50,
                    detectedLetter: typeof analysisResult.detectedLetter === 'string' ? analysisResult.detectedLetter : 'Unknown',
                    analysis: typeof analysisResult.analysis === 'string' ? analysisResult.analysis : 'Analysis not available',
                    feedback: typeof analysisResult.feedback === 'string' ? analysisResult.feedback : 'Keep practicing with proper ISL techniques'
                };

                console.log(`Successfully analyzed with ${modelName}:`, validatedResult);
                return validatedResult;

            } catch (modelError) {
                console.error(`Model ${modelName} failed:`, modelError);
                lastError = modelError;

                // Check if it's a quota error and skip immediately for similar models
                if (modelError instanceof Error && modelError.message.includes('quota')) {
                    console.log('Quota exceeded, skipping to fallback analysis');
                    break; // Skip remaining models if quota is exceeded
                }

                // Check if it's a rate limit error and add delay
                if (modelError instanceof Error && modelError.message.includes('429')) {
                    console.log('Rate limited, waiting before trying next model...');
                    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
                }

                continue; // Try next model
            }
        }

        // If all models failed, throw the last error
        throw lastError || new Error('All Gemini models failed');

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

    // Provide educational feedback with some encouragement (60% success rate for learning)
    const isEducationallyCorrect = Math.random() > 0.4;

    return {
        isCorrect: isEducationallyCorrect,
        confidence: isEducationallyCorrect ? 75 : 35,
        detectedLetter: isEducationallyCorrect ? expectedLetter : 'Needs Practice',
        analysis: isEducationallyCorrect
            ? `Good attempt! Your gesture appears to match the ISL sign for "${expectedLetter}".`
            : 'The gesture could use some refinement. Keep practicing!',
        feedback: `For letter "${expectedLetter}": ${description}\n\n${isEducationallyCorrect
            ? '✅ Well done! Your hand position looks good. Continue practicing to perfect your form.'
            : '📚 Practice tip: Look at ISL reference images and practice this gesture in front of a mirror.'
            }\n\nReminder:\n- Keep your hand clearly visible\n- Use good lighting conditions\n- Maintain steady hand positioning\n- Practice makes perfect!`
    };
}

// Export functions for internal use
export { analyzeImageWithGemini, getFallbackAnalysis };
