# Exam System Setup Guide

## Overview

The exam system provides AI-powered testing for Indian Sign Language (ISL) alphabet knowledge. It features 5 different test sets with varying difficulty levels, each containing 10 AI-generated questions by Gemini.

## Features

- 🤖 **AI-Generated Questions**: Questions created by Gemini AI for each difficulty level
- 📸 **Image-Based Answers**: Users can capture their sign language gestures
- ☁️ **Cloudinary Integration**: Images are uploaded and stored in Cloudinary
- 💾 **Answer Storage**: User answers are saved in database for evaluation
- 📊 **AI Evaluation**: Gemini AI analyzes captured gestures and provides feedback
- 🎯 **Instant Results**: Comprehensive results with correct answers and explanations

## Test Sets

1. **Basic Alphabet Set** (Beginner) - Fundamental ISL signs
2. **Intermediate Challenge** (Intermediate) - Complex combinations and variations
3. **Advanced Mastery** (Advanced) - Tricky similar-looking letters
4. **Expert Level** (Expert) - Subtle differences and advanced techniques
5. **Master Challenge** (Master) - Ultimate test for ISL mastery

## API Endpoints

### `/api/generate-questions`

**POST** - Generates 10 AI questions for a specific test set

```json
{
  "setId": 1
}
```

### `/api/save-answer`

**POST** - Saves user's answer to database

```json
{
  "setId": 1,
  "answer": {
    "questionId": 1,
    "selectedAnswer": "A",
    "imageUrl": "https://cloudinary.com/...",
    "timestamp": "2025-08-09T..."
  }
}
```

### `/api/upload-image`

**POST** - Uploads captured image to Cloudinary

```json
{
  "imageData": "data:image/jpeg;base64,...",
  "questionId": 1,
  "setId": 1
}
```

### `/api/evaluate-exam`

**POST** - Evaluates all answers with Gemini AI

```json
{
  "setId": 1,
  "questions": [...],
  "answers": [...]
}
```

## Environment Variables Required

Create a `.env.local` file in your project root:

```env
# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Database Configuration (choose one)
# MongoDB
MONGODB_URI=mongodb://localhost:27017/sign-language-app

# PostgreSQL
DATABASE_URL=postgresql://username:password@localhost:5432/sign_language_db

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install formidable @types/formidable
```

### 2. Configure Gemini AI

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create an account and get your API key
3. Add the API key to your `.env.local` file

### 3. Configure Cloudinary

1. Create a [Cloudinary account](https://cloudinary.com/)
2. Get your cloud name, API key, and API secret
3. Add them to your `.env.local` file

### 4. Set Up Database

Choose one of the following:

#### Option A: MongoDB

```bash
# Install MongoDB dependencies
npm install mongodb mongoose

# Start MongoDB locally or use MongoDB Atlas
```

#### Option B: PostgreSQL

```bash
# Install PostgreSQL dependencies
npm install pg @types/pg

# Create database and tables
```

#### Option C: Firebase

```bash
# Install Firebase dependencies
npm install firebase-admin

# Set up Firebase project and download service account key
```

### 5. Database Schema

#### User Answers Collection/Table

```sql
CREATE TABLE exam_answers (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255),
  set_id INTEGER,
  question_id INTEGER,
  selected_answer TEXT,
  image_url VARCHAR(500),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Exam Sessions Collection/Table

```sql
CREATE TABLE exam_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE,
  set_id INTEGER,
  user_id VARCHAR(255), -- optional for user tracking
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  score INTEGER,
  total_questions INTEGER
);
```

## How It Works

### 1. User Journey

1. User visits `/learn` page and clicks "Ready to Test Yourself"
2. User is redirected to `/test-sets` to choose from 5 difficulty levels
3. User selects a test set and is redirected to `/exam/[setId]`
4. System generates 10 AI questions using Gemini
5. User answers questions one by one (text or image capture)
6. Each answer is saved to database immediately
7. After all questions, Gemini AI evaluates the responses
8. User sees detailed results with feedback

### 2. Question Types

- **Multiple Choice**: Traditional A, B, C, D options
- **Image Capture**: User demonstrates sign language gesture
- **Mixed Format**: Combination of both types

### 3. AI Evaluation Process

1. Text answers are compared directly with correct answers
2. Image answers are sent to Gemini Vision API
3. Gemini analyzes hand gesture, finger positions, and overall form
4. AI provides detailed feedback on accuracy and corrections needed

## File Structure

```
pages/
├── test-sets.tsx          # Main test selection page
├── learn.tsx             # Updated with new exam button
└── exam/
    └── [setId].tsx       # Dynamic exam page for each set

pages/api/
├── generate-questions.ts  # AI question generation
├── save-answer.ts        # Save user answers
├── upload-image.ts       # Image upload to Cloudinary
└── evaluate-exam.ts      # AI evaluation with Gemini
```

## Testing the System

### 1. Access the Application

```bash
npm run dev
# Visit http://localhost:3000/learn
```

### 2. Test Flow

1. Click "Ready to Test Yourself" button
2. Select any test set (1-5)
3. Answer questions (use browser camera for image questions)
4. Complete all 10 questions
5. View detailed results

### 3. Debug Mode

Add this to your API routes for debugging:

```javascript
console.log("Debug:", { setId, questions, answers });
```

## Production Deployment

### 1. Environment Setup

- Set all environment variables in production
- Enable HTTPS for camera access
- Configure CORS for API endpoints

### 2. Database Migration

- Run database migrations for production
- Set up proper indexing for performance
- Configure backup and recovery

### 3. Monitoring

- Set up error tracking (Sentry, LogRocket)
- Monitor API rate limits for Gemini and Cloudinary
- Track exam completion rates and scores

## Troubleshooting

### Common Issues

1. **Camera Access Denied**: Ensure HTTPS in production
2. **Gemini API Errors**: Check API key and rate limits
3. **Cloudinary Upload Fails**: Verify API credentials
4. **Database Connection**: Check connection strings

### Debug Checklist

- [ ] Environment variables are set correctly
- [ ] API keys are valid and have proper permissions
- [ ] Database is running and accessible
- [ ] Cloudinary account has sufficient storage
- [ ] Browser supports camera API

## Future Enhancements

- Real-time scoring during exam
- Progress tracking across multiple attempts
- Adaptive difficulty based on performance
- Video capture for motion-based signs
- Multiplayer exam challenges
- Teacher dashboard for monitoring student progress

## Support

For issues or questions about the exam system, check:

1. Browser console for client-side errors
2. API logs for server-side issues
3. Network tab for failed requests
4. Gemini AI status page for service issues
