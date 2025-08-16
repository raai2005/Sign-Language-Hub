import type { NextApiRequest, NextApiResponse } from 'next';
import Groq from 'groq-sdk';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const key = process.env.GROQ_API_KEY;
  if (!key) return res.status(200).json({ ok: false, configured: false, reason: 'Missing GROQ_API_KEY' });

  const groq = new Groq({
    apiKey: key,
  });

  const prompt = `Return valid JSON only with a questions array of 2 objects for ISL image capture tasks.
{
  "questions": [
    {"id": 1, "question": "Give me the hand image that expresses the alphabet 'A'", "options": ["Capture Image"], "correctAnswer": "A", "explanation": "Form a fist with your thumb pointing upward along the side of your index finger."},
    {"id": 2, "question": "Give me the hand image that expresses the alphabet 'B'", "options": ["Capture Image"], "correctAnswer": "B", "explanation": "Hold your hand upright with all four fingers extended and pressed together, thumb folded across your palm."}
  ]
}`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 1024,
    });

    const response = chatCompletion.choices[0]?.message?.content;
    
    if (!response) {
      return res.status(200).json({ 
        ok: false, 
        configured: true, 
        reason: 'No response from Groq API',
        model: 'llama-3.3-70b-versatile'
      });
    }

    // Try to parse JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return res.status(200).json({ 
        ok: false, 
        configured: true, 
        reason: 'Invalid JSON response from Groq',
        model: 'llama-3.3-70b-versatile',
        rawResponse: response.substring(0, 200)
      });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    
    if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length < 2) {
      return res.status(200).json({ 
        ok: false, 
        configured: true, 
        reason: 'Invalid question format from Groq',
        model: 'llama-3.3-70b-versatile',
        response: parsed
      });
    }

    return res.status(200).json({ 
      ok: true, 
      configured: true, 
      model: 'llama-3.3-70b-versatile',
      testResponse: parsed,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Groq health check error:', error);
    return res.status(200).json({ 
      ok: false, 
      configured: true, 
      reason: error instanceof Error ? error.message : 'Unknown error',
      model: 'llama-3.3-70b-versatile'
    });
  }
}
