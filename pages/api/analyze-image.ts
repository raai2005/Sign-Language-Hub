import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface ImageAnalysisResult {
    isCorrect: boolean;
    confidence: number;
    detectedLetter: string;
    analysis: string;
    feedback: string;
}

// Extract the first A–Z letter from a freeform label string
function extractLetter(label: string | undefined): string | null {
    if (!label) return null;
    const match = (label.match(/[A-Z]/i) || [])[0];
    return match ? match.toUpperCase() : null;
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
            const fallback = await getFallbackAnalysis(expectedLetter, questionText);
            // Always conservative without vision model
            const corrected = applyConservativeScoring(fallback, expectedLetter);
            return res.status(200).json({
                success: false,
                fallback: true,
                message: 'Gemini Vision not configured, using conservative fallback analysis',
                result: corrected
            });
        }

        // Analyze image with Gemini Vision
        const raw = await analyzeImageWithGemini(imageUrl, expectedLetter, questionText);
        const result = applyConservativeScoring(raw, expectedLetter);

        res.status(200).json({ success: true, result, message: 'Image analyzed successfully with Gemini Vision' });

    } catch (error) {
        console.error('Image analysis error:', error);

        // Fallback to educational guidance (never mark correct)
        const fallbackResult = await getFallbackAnalysis(req.body.expectedLetter, req.body.questionText);
        const corrected = applyConservativeScoring(fallbackResult, req.body.expectedLetter);

        res.status(200).json({
            success: false,
            fallback: true,
            error: error instanceof Error ? error.message : 'Analysis failed',
            result: corrected,
            message: 'Using conservative fallback analysis due to error'
        });
    }
}

async function analyzeImageWithGemini(imageUrl: string, expectedLetter: string, questionText: string): Promise<ImageAnalysisResult> {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

        // Try multiple models in order of preference
        const models = ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-2.5-pro"] as const;

        let lastError: any = null;

        for (const modelName of models) {
            try {
                console.log(`Trying Gemini model: ${modelName}`);
                const model = genAI.getGenerativeModel({ model: modelName });

                // Support both remote URLs and data URLs
                let imageBase64: string;
                if (imageUrl.startsWith('data:')) {
                    // data:[<mediatype>][;base64],<data>
                    const commaIdx = imageUrl.indexOf(',');
                    imageBase64 = imageUrl.substring(commaIdx + 1);
                } else {
                    // Fetch the image from remote URL
                    const imageResponse = await fetch(imageUrl);
                    if (!imageResponse.ok) {
                        throw new Error('Failed to fetch image');
                    }
                    const imageBuffer = await imageResponse.arrayBuffer();
                    imageBase64 = Buffer.from(imageBuffer).toString('base64');
                }

                const prompt = `You are an expert Indian Sign Language (ISL) instructor.
STRICT TASK: Determine if the hand in the image correctly forms the ISL alphabet letter "${expectedLetter}". Only evaluate ISL static alphabet handshapes. Generic hand gestures, random poses, or non-ISL gestures must be marked incorrect.

QUESTION CONTEXT: "${questionText}"

Output JSON only, no extra text. Use this exact schema:
{
  "isCorrect": boolean, // true ONLY if the shape clearly matches ISL letter ${expectedLetter}
  "confidence": number, // 0-100
  "detectedLetter": "X", // Your best guess of the ISL letter seen (single A-Z). If unsure, put "Unknown".
  "analysis": "Short description of what you see and why",
  "feedback": "Precise correction tips for achieving ${expectedLetter} in ISL"
}

DECISION RULES:
- isCorrect must be true only if: (1) the handshape matches ${expectedLetter} AND (2) no contradictory features are present.
- Be conservative: if lighting, occlusion, angle, or ambiguity prevents reliable judgment, set isCorrect=false and reduce confidence.
- If the visible handshape resembles a different ISL letter, set detectedLetter accordingly and isCorrect=false.
- Consider: finger extension/curl, thumb placement, finger count/spacing, palm orientation.
- If motion-based letters (e.g., J, Z) are not clearly inferable from a single frame, do not guess; use Unknown and isCorrect=false.

Return ONLY valid JSON.`;

                const contentResult = await model.generateContent([
                    { inlineData: { mimeType: "image/jpeg", data: imageBase64 } },
                    { text: prompt }
                ]);

                const response = await contentResult.response;
                const text = response.text();

                console.log(`Raw response from ${modelName}:`, text.substring(0, 200) + '...');

                // Clean the response text
                let cleanedText = text.trim()
                    .replace(/```json\n?/g, '')
                    .replace(/```\n?/g, '')
                    .replace(/^[^{]*/, '')
                    .replace(/[^}]*$/, '');

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
                const validatedResult: ImageAnalysisResult = {
                    isCorrect: typeof analysisResult.isCorrect === 'boolean' ? analysisResult.isCorrect : false,
                    confidence: typeof analysisResult.confidence === 'number' ? Math.max(0, Math.min(100, analysisResult.confidence)) : 40,
                    detectedLetter: typeof analysisResult.detectedLetter === 'string' ? analysisResult.detectedLetter : 'Unknown',
                    analysis: typeof analysisResult.analysis === 'string' ? analysisResult.analysis : 'Analysis not available',
                    feedback: typeof analysisResult.feedback === 'string' ? analysisResult.feedback : `Aim for a precise ISL "${expectedLetter}" handshape.`
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

function applyConservativeScoring(input: ImageAnalysisResult, expectedLetter: string): ImageAnalysisResult {
    const expected = extractLetter(String(expectedLetter)) || String(expectedLetter).toUpperCase();
    const detected = extractLetter(input.detectedLetter) || 'Unknown';

    // Strict match only if model agrees on the same letter and is fairly confident
    const letterMatches = detected === expected;
    const sufficientConfidence = (input.confidence || 0) >= 70;

    const finalIsCorrect = Boolean(letterMatches && sufficientConfidence);

    const adjustedConfidence = finalIsCorrect ? Math.max(70, Math.min(100, input.confidence || 70)) : Math.min(60, input.confidence || 60);

    let feedback = input.feedback || '';
    if (!finalIsCorrect) {
        const reason = letterMatches ? 'Confidence below threshold' : `Detected "${detected}" vs expected "${expected}"`;
        feedback = `${feedback ? feedback + '\n\n' : ''}Strict scoring: ${reason}. Marking as incorrect. Focus on the exact ISL handshape for "${expected}".`;
    }

    return {
        isCorrect: finalIsCorrect,
        confidence: adjustedConfidence,
        detectedLetter: detected,
        analysis: input.analysis,
        feedback
    };
}

async function getFallbackAnalysis(expectedLetter: string, questionText: string): Promise<ImageAnalysisResult> {
    // ISL hand descriptions for common letters
    const islDescriptions: { [key: string]: string } = {
        'A': 'Form a fist with your thumb along the side of the index finger (not across the palm).',
        'B': 'Palm out; four fingers extended and together; thumb across the palm.',
        'C': 'Curve fingers and thumb to form a clear C shape.',
        'D': 'Index finger up; other fingers closed; thumb touches the middle finger to make a ring.',
        'E': 'Curl all fingers; fingertips toward the palm; thumb against fingers.',
        'F': 'Thumb and index touch forming a ring; other fingers extended.',
        'G': 'Index points sideways; thumb up; other fingers closed.',
        'H': 'Index and middle extended together sideways; others closed.',
        'I': 'Only pinky up; others closed.',
        'J': 'Pinky draws a J (motion). In a single photo, handshape should match I; motion can’t be confirmed.',
        'K': 'Index and middle form a V; thumb in between.',
        'L': 'Index up, thumb out to the side to form an L; others closed.',
        'M': 'Thumb under first three fingers (visible bumps).',
        'N': 'Thumb under first two fingers.',
        'O': 'All fingers curve to form an O shape.',
        'P': 'Like K but palm down / pointing downward.',
        'Q': 'Thumb and index pinch downward; others closed.',
        'R': 'Index and middle crossed; others closed.',
        'S': 'Fist with thumb across the front of fingers.',
        'T': 'Thumb between index and middle; hand in a fist.',
        'U': 'Index and middle up, together and straight.',
        'V': 'Index and middle up, making a V shape.',
        'W': 'Index, middle, ring up (three).',
        'X': 'Index bent like a hook; others closed.',
        'Y': 'Thumb and pinky out; middle fingers closed.',
        'Z': 'Index draws Z (motion). In a single photo, handshape similar to pointing; motion can’t be confirmed.'
    };

    const description = islDescriptions[(extractLetter(expectedLetter) || expectedLetter).toUpperCase()] || 'Follow standard ISL guidelines for this letter.';

    // Conservative fallback: never mark correct without a vision model
    return {
        isCorrect: false,
        confidence: 30,
        detectedLetter: 'Unknown',
        analysis: 'Vision model unavailable. Providing guidance only.',
        feedback: `Target ISL letter "${extractLetter(expectedLetter) || expectedLetter}": ${description}`
    };
}

// Export functions for internal use
export { analyzeImageWithGemini, getFallbackAnalysis };
