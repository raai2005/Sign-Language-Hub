import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const dataPath = path.join(process.cwd(), 'data', 'signs.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    res.status(200).json(data.letters);
  } catch (error) {
    console.error('Error reading signs data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
} 