import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(200).json({ ok: false, configured: false, reason: 'Missing GEMINI_API_KEY' });

  const genAI = new GoogleGenerativeAI(key);
  const models = ["gemini-2.5-pro", "gemini-1.5-pro", "gemini-pro"] as const;
  const prompt = `Return valid JSON only with a questions array of 2 objects for ISL image capture tasks.
{
  "questions": [
    {"id": 1, "question": "Give me the hand image that expresses the alphabet 'A'", "options": ["Capture Image"], "correctAnswer": "A", "explanation": "..."},
    {"id": 2, "question": "Give me the hand image that expresses the alphabet 'B'", "options": ["Capture Image"], "correctAnswer": "B", "explanation": "..."}
  ]
}`;

  let modelUsed: string | null = null;
  let parsed: any = null;
  let text = '';

  try {
    for (const m of models) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        const result = await model.generateContent(prompt);
        const resp = await result.response;
        text = resp.text();
        const match = text.match(/\{[\s\S]*\}/);
        if (!match) throw new Error('No JSON');
        parsed = JSON.parse(match[0]);
        if (!Array.isArray(parsed.questions) || parsed.questions.length < 2) {
          throw new Error('Bad schema');
        }
        modelUsed = m;
        break;
      } catch (err) {
        continue;
      }
    }

    if (!parsed) {
      return res.status(200).json({ ok: false, configured: true, modelUsed, error: 'Generation failed', raw: text?.slice(0, 500) });
    }

    // Normalize and lightly validate
    const normalized = parsed.questions.slice(0, 2).map((q: any, i: number) => ({
      id: i + 1,
      question: typeof q.question === 'string' ? q.question : `Give me the hand image that expresses the alphabet '${String.fromCharCode(65 + i)}'` ,
      options: ["Capture Image"],
      correctAnswer: typeof q.correctAnswer === 'string' && q.correctAnswer.length === 1 ? q.correctAnswer.toUpperCase() : String.fromCharCode(65 + i),
      explanation: typeof q.explanation === 'string' && q.explanation ? q.explanation : 'Capture a clear image of the correct ISL handshape.'
    }));

    return res.status(200).json({ ok: true, configured: true, modelUsed, sample: normalized });
  } catch (error: any) {
    return res.status(200).json({ ok: false, configured: true, modelUsed, error: error?.message || 'Unknown error', raw: text?.slice(0, 500) });
  }
}
