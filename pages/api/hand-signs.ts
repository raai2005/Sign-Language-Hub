import type { NextApiRequest, NextApiResponse } from 'next';

// Hand sign image URLs - Using different placeholder images for each letter
const handSignImages = {
  // Using different placeholder images for each letter with proper descriptions
  'A': 'https://via.placeholder.com/400x400/ff6b35/ffffff?text=Letter+A%0AIndex+finger+pointing+up+with+thumb+extended',
  'B': 'https://via.placeholder.com/400x400/ff6b35/ffffff?text=Letter+B%0AFlat+hand+with+fingers+together+pointing+up',
  'C': 'https://via.placeholder.com/400x400/ff6b35/ffffff?text=Letter+C%0ACurved+hand+like+holding+a+cup',
  'D': 'https://via.placeholder.com/400x400/ff6b35/ffffff?text=Letter+D%0AIndex+finger+pointing+up+with+other+fingers+closed',
  'E': 'https://via.placeholder.com/400x400/ff6b35/ffffff?text=Letter+E%0AFingers+curled+into+fist',
  'F': 'https://via.placeholder.com/400x400/ff6b35/ffffff?text=Letter+F%0AIndex+and+middle+finger+extended',
  'G': 'https://via.placeholder.com/400x400/ff6b35/ffffff?text=Letter+G%0AIndex+finger+pointing+to+the+side',
  'H': 'https://via.placeholder.com/400x400/ff6b35/ffffff?text=Letter+H%0AIndex+and+middle+finger+pointing+up',
  'I': 'https://via.placeholder.com/400x400/ff6b35/ffffff?text=Letter+I%0APinky+finger+extended',
  'J': 'https://via.placeholder.com/400x400/ff6b35/ffffff?text=Letter+J%0AIndex+finger+making+a+J+shape',
  'K': 'https://via.placeholder.com/400x400/ff6b35/ffffff?text=Letter+K%0AIndex+and+middle+finger+pointing+up',
  'L': 'https://via.placeholder.com/400x400/ff6b35/ffffff?text=Letter+L%0AIndex+finger+pointing+up',
  'M': 'https://via.placeholder.com/400x400/ff6b35/ffffff?text=Letter+M%0AThree+fingers+pointing+up',
  'N': 'https://via.placeholder.com/400x400/ff6b35/ffffff?text=Letter+N%0AIndex+and+middle+finger+pointing+up',
  'O': 'https://via.placeholder.com/400x400/ff6b35/ffffff?text=Letter+O%0AFingers+curled+into+circle',
  'P': 'https://via.placeholder.com/400x400/ff6b35/ffffff?text=Letter+P%0AIndex+finger+pointing+up',
  'Q': 'https://via.placeholder.com/400x400/ff6b35/ffffff?text=Letter+Q%0AIndex+finger+pointing+down',
  'R': 'https://via.placeholder.com/400x400/ff6b35/ffffff?text=Letter+R%0AIndex+and+middle+finger+crossed',
  'S': 'https://via.placeholder.com/400x400/ff6b35/ffffff?text=Letter+S%0AFist+with+thumb+on+top',
  'T': 'https://via.placeholder.com/400x400/ff6b35/ffffff?text=Letter+T%0AIndex+finger+pointing+up',
  'U': 'https://via.placeholder.com/400x400/ff6b35/ffffff?text=Letter+U%0AIndex+and+middle+finger+pointing+up',
  'V': 'https://via.placeholder.com/400x400/ff6b35/ffffff?text=Letter+V%0AIndex+and+middle+finger+pointing+up',
  'W': 'https://via.placeholder.com/400x400/ff6b35/ffffff?text=Letter+W%0AThree+fingers+pointing+up',
  'X': 'https://via.placeholder.com/400x400/ff6b35/ffffff?text=Letter+X%0AIndex+finger+pointing+up',
  'Y': 'https://via.placeholder.com/400x400/ff6b35/ffffff?text=Letter+Y%0AThumb+and+pinky+extended',
  'Z': 'https://via.placeholder.com/400x400/ff6b35/ffffff?text=Letter+Z%0AIndex+finger+pointing+up'
};

// ISL Hand Sign Descriptions
const islHandSigns = {
  'A': 'Index finger pointing upward with thumb extended',
  'B': 'Flat hand with fingers together pointing up',
  'C': 'Curved hand like holding a cup',
  'D': 'Index finger pointing up with other fingers closed',
  'E': 'Fingers curled into fist',
  'F': 'Index and middle finger extended',
  'G': 'Index finger pointing to the side',
  'H': 'Index and middle finger pointing up',
  'I': 'Pinky finger extended',
  'J': 'Index finger making a J shape',
  'K': 'Index and middle finger pointing up',
  'L': 'Index finger pointing up',
  'M': 'Three fingers pointing up',
  'N': 'Index and middle finger pointing up',
  'O': 'Fingers curled into circle',
  'P': 'Index finger pointing up',
  'Q': 'Index finger pointing down',
  'R': 'Index and middle finger crossed',
  'S': 'Fist with thumb on top',
  'T': 'Index finger pointing up',
  'U': 'Index and middle finger pointing up',
  'V': 'Index and middle finger pointing up',
  'W': 'Three fingers pointing up',
  'X': 'Index finger pointing up',
  'Y': 'Thumb and pinky extended',
  'Z': 'Index finger pointing up'
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { letter } = req.query;

    if (!letter || typeof letter !== 'string') {
      return res.status(400).json({ error: 'Letter parameter is required' });
    }

    const upperLetter = letter.toUpperCase();
    
    if (!islHandSigns[upperLetter as keyof typeof islHandSigns]) {
      return res.status(400).json({ error: 'Invalid letter' });
    }

    // Get hand sign description
    const description = islHandSigns[upperLetter as keyof typeof islHandSigns];

    // Get the specific image for this letter
    const imageUrl = handSignImages[upperLetter as keyof typeof handSignImages];

    if (imageUrl) {
      return res.status(200).json({
        success: true,
        imageUrl: imageUrl,
        description: description,
        source: 'letter_specific'
      });
    }

    // Fallback to placeholder image with hand sign description
    const placeholderUrl = `https://via.placeholder.com/400x400/ff6b35/ffffff?text=Letter+${upperLetter}+Hand+Sign`;
    
    return res.status(200).json({
      success: true,
      imageUrl: placeholderUrl,
      description: description,
      source: 'placeholder'
    });

  } catch (error) {
    console.error('Error fetching hand sign image:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch hand sign image',
      fallbackUrl: `https://via.placeholder.com/400x400/ff6b35/ffffff?text=Letter+${req.query.letter}`
    });
  }
} 