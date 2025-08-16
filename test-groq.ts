// Test file to verify Groq integration
import Groq from 'groq-sdk';

async function testGroqIntegration() {
  const GROQ_API_KEY = process.env.GROQ_API_KEY || 'your-api-key-here';
  
  if (!GROQ_API_KEY || GROQ_API_KEY === 'your-api-key-here') {
    console.log('❌ GROQ_API_KEY not configured');
    console.log('Please set your Groq API key in the .env.local file');
    console.log('Get your key from: https://console.groq.com/keys');
    return;
  }

  try {
    const groq = new Groq({
      apiKey: GROQ_API_KEY,
    });

    console.log('🧪 Testing Groq API connection...');

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: "Generate a simple JSON with 2 ISL questions: {\"questions\": [{\"id\": 1, \"question\": \"Give me the hand image that expresses the alphabet 'A'\", \"options\": [\"Capture Image\"], \"correctAnswer\": \"A\", \"explanation\": \"Form a fist with thumb up\"}]}",
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 512,
    });

    const response = chatCompletion.choices[0]?.message?.content;
    
    if (response) {
      console.log('✅ Groq API is working!');
      console.log('📝 Sample response:', response.substring(0, 200) + '...');
      
      // Try to parse JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('✅ JSON parsing successful!');
        console.log('📊 Generated questions:', parsed.questions?.length || 0);
      } else {
        console.log('⚠️ Response is not in JSON format');
      }
    } else {
      console.log('❌ No response from Groq API');
    }

  } catch (error) {
    console.log('❌ Groq API test failed:', error);
  }
}

// Uncomment to run the test
// testGroqIntegration();

export { testGroqIntegration };
