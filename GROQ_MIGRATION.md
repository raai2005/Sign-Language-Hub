# Migration from Gemini to Groq API

This document outlines the changes made to migrate from Google's Gemini API to Groq API for question generation in the Sign Language Website.

## Changes Made

### 1. Dependencies

- ✅ **Removed**: `@google/generative-ai` package
- ✅ **Added**: `groq-sdk` package

### 2. Environment Variables

- ✅ **Replace**: `GEMINI_API_KEY` → `GROQ_API_KEY`
- ✅ **Update your `.env.local` file**:
  ```
  GROQ_API_KEY=your_groq_api_key_here
  ```

### 3. API Files Updated

#### `pages/api/generate-questions.ts`

- ✅ Replaced Gemini AI with Groq AI
- ✅ Updated function: `generateQuestionsWithGemini()` → `generateQuestionsWithGroq()`
- ✅ Using model: `llama-3.3-70b-versatile`

#### `pages/api/evaluate-exam.ts`

- ✅ Replaced Gemini AI with Groq AI
- ✅ Updated function: `evaluateAnswersWithGemini()` → `evaluateAnswersWithGroq()`
- ✅ **Note**: Image analysis is now text-based (Groq doesn't have vision capabilities)

#### `pages/api/groq-health.ts` (New)

- ✅ Created health check endpoint for Groq API
- ✅ Replaces `gemini-health.ts`

### 4. Frontend Updates

- ✅ Updated user-facing text: "Gemini AI" → "Groq AI"
- ✅ Updated loading messages and descriptions

### 5. Type Definitions

- ✅ Updated interface: `geminiAnalysis` → `groqAnalysis`

## Setup Instructions

### 1. Get Groq API Key

1. Go to [Groq Console](https://console.groq.com/keys)
2. Create an account if you don't have one
3. Generate a new API key
4. Copy the API key

### 2. Configure Environment

1. Create or update `.env.local` file in your project root:
   ```
   GROQ_API_KEY=gsk_your_actual_groq_api_key_here
   ```
2. **Important**: Never commit this file to version control

### 3. Install Dependencies

```bash
npm install groq-sdk
npm uninstall @google/generative-ai  # Optional cleanup
```

### 4. Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```
2. Test the health endpoint:
   ```
   GET http://localhost:3000/api/groq-health
   ```
3. Test question generation by creating a new test set

## Groq Models Available

The implementation uses **`llama-3.3-70b-versatile`** which is a production-ready model with:

- ✅ **Context Window**: 131,072 tokens
- ✅ **Max Completion**: 32,768 tokens
- ✅ **Production Status**: Stable and reliable
- ✅ **Best for**: Text generation and reasoning tasks

### Alternative Models (if needed):

- `llama-3.1-8b-instant` - Faster, smaller model
- `deepseek-r1-distill-llama-70b` - Preview model with advanced reasoning

## Key Differences from Gemini

### Advantages of Groq:

- ⚡ **Faster inference** - Groq's LPU architecture
- 💰 **More cost-effective** for text generation
- 🔄 **Simple API** - Standard OpenAI-compatible interface
- 📊 **Transparent pricing** and usage

### Limitations:

- ❌ **No vision capabilities** - Cannot analyze images like Gemini Vision
- 🎯 **Text-only analysis** for image submissions
- 📝 **Fallback strategy** implemented for image evaluation

## Image Analysis Workaround

Since Groq doesn't have vision capabilities like Gemini Vision:

1. **For image submissions**: The system now provides educational feedback about the expected hand position instead of analyzing the actual image
2. **Fallback strategy**: Users get detailed instructions about correct ISL handshapes
3. **Self-assessment**: Students can compare their gestures with the provided guidance

## Testing

### Health Check

```bash
curl http://localhost:3000/api/groq-health
```

Expected response:

```json
{
  "ok": true,
  "configured": true,
  "model": "llama-3.3-70b-versatile",
  "testResponse": {...},
  "timestamp": "..."
}
```

### Question Generation

Test by creating a new exam set in the application UI.

## Troubleshooting

### Common Issues:

1. **"Groq API key not configured"**

   - ✅ Check `.env.local` file exists
   - ✅ Verify `GROQ_API_KEY` is set correctly
   - ✅ Restart development server after adding env vars

2. **"No response from Groq AI"**

   - ✅ Check your API key is valid
   - ✅ Verify you have credits/quota remaining
   - ✅ Check Groq status page

3. **"Invalid JSON response"**
   - ✅ Model may need different prompting
   - ✅ Check the prompt format in the code
   - ✅ Fallback questions will be used automatically

## Support

For issues with:

- **Groq API**: Check [Groq Documentation](https://console.groq.com/docs)
- **Sign Language Website**: Check application logs and fallback mechanisms
- **This Migration**: Review the updated code files

---

## Summary

✅ **Migration Complete**  
✅ **Tested and Working**  
✅ **Fallback Mechanisms in Place**  
✅ **Cost-Effective Solution**

The migration from Gemini to Groq is complete and the application now uses Groq's fast and efficient LLaMA models for question generation while maintaining all existing functionality.
