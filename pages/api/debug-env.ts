import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const groqKey = process.env.GROQ_API_KEY;
  
  res.status(200).json({
    hasGroqKey: !!groqKey,
    keyLength: groqKey ? groqKey.length : 0,
    keyPrefix: groqKey ? groqKey.substring(0, 8) + '...' : 'Not found',
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('GROQ')),
    nodeEnv: process.env.NODE_ENV
  });
}
