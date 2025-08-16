import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { CameraCapture, isCameraSupported, compressImage } from '../../lib/camera';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface UserAnswer {
  questionId: number;
  selectedAnswer: string;
  imageUrl?: string;
  timestamp: Date;
}

interface ExamResult {
  score: number;
  totalQuestions: number;
  answers: UserAnswer[];
  feedback: {
    questionId: number;
    isCorrect: boolean;
    correctAnswer: string;
    explanation: string;
  }[];
}

export default function ExamPage() {
  const router = useRouter();
  const { setId } = router.query;
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [examComplete, setExamComplete] = useState(false);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showAnswerConfirm, setShowAnswerConfirm] = useState(false);
  const [answerConfirmImage, setAnswerConfirmImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraCapture = useRef<CameraCapture | null>(null);

  const testSetTitles: { [key: string]: string } = {
    '1': 'Basic Alphabet Set',
    '2': 'Intermediate Challenge',
    '3': 'Advanced Mastery',
    '4': 'Expert Level',
    '5': 'Master Challenge'
  };

  useEffect(() => {
    if (setId) {
      generateQuestions();
    }
  }, [setId]);

  const generateQuestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ setId: parseInt(setId as string) }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate questions');
      }

      const data = await response.json();
      setQuestions(data.questions);
    } catch (error) {
      console.error('Error generating questions:', error);
      // Fallback to sample questions for demonstration
      setQuestions(getSampleQuestions());
    } finally {
      setLoading(false);
    }
  };

  const getSampleQuestions = (): Question[] => {
    const sampleQuestions = [
      {
        id: 1,
        question: "Which letter does this hand sign represent?",
        options: ["A", "B", "C", "D"],
        correctAnswer: "A",
        explanation: "This is the sign for letter A - index finger pointing up with thumb extended."
      },
      {
        id: 2,
        question: "Show the hand sign for letter 'B'",
        options: ["Capture Image", "", "", ""],
        correctAnswer: "Flat hand with fingers together pointing up",
        explanation: "Letter B is formed with a flat hand, fingers together, pointing upward."
      },
      // Add more sample questions...
    ];
    return sampleQuestions.slice(0, 10);
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const captureImage = async () => {
    if (!isCameraSupported()) {
      alert('Camera is not supported on this device/browser.');
      return;
    }

    // Open modal; camera will start in the effect once refs are mounted
    setCameraError(null);
    setShowCamera(true);
  };

  // Start/stop camera when modal opens/closes and refs are ready
  useEffect(() => {
    const start = async () => {
      if (!showCamera || !videoRef.current || !canvasRef.current) return;
      try {
        setIsStartingCamera(true);
        cameraCapture.current = new CameraCapture(videoRef.current, canvasRef.current);
        await cameraCapture.current.startCamera({ width: 640, height: 480, facingMode: 'user' });
        setIsStartingCamera(false);
        // Begin countdown for auto-capture
        setCountdown(5);
      } catch (err) {
        console.error('Error accessing camera:', err);
        setCameraError('Unable to access camera. Please check permissions.');
        setIsStartingCamera(false);
        setShowCamera(false);
      }
    };

    start();

    return () => {
      // Cleanup when modal closes
      if (!showCamera) {
        if (cameraCapture.current) {
          cameraCapture.current.stopCamera();
          cameraCapture.current = null;
        }
        setCountdown(null);
        setIsStartingCamera(false);
      }
    };
  }, [showCamera]);

  // Countdown effect to auto-capture
  useEffect(() => {
    if (!showCamera) return;
    if (countdown === null) return;
    if (countdown <= 0) {
      // Auto capture
      takePicture();
      setCountdown(null);
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => (c ?? 0) - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, showCamera]);

  const takePicture = async () => {
    if (!cameraCapture.current) return;

    try {
      const imageData = cameraCapture.current.captureImage(0.8);
      if (imageData) {
        // Compress the image
        const compressedImage = await compressImage(imageData, 800, 0.7);
        
        // Upload to Cloudinary
        const imageUrl = await cameraCapture.current.uploadImage(
          compressedImage, 
          currentQuestion.id, 
          parseInt(setId as string)
        );
        
        setCapturedImage(imageUrl);
        setSelectedAnswer(imageUrl);
  stopCamera();

        // Show quick confirmation popup, then auto-advance
        setAnswerConfirmImage(imageUrl);
        setShowAnswerConfirm(true);
        setTimeout(() => {
          setShowAnswerConfirm(false);
          // Proceed to next question automatically
          submitAnswer();
        }, 1200);
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      setCameraError('Failed to capture image. Please try again.');
    }
  };

  const stopCamera = () => {
    if (cameraCapture.current) {
      cameraCapture.current.stopCamera();
      cameraCapture.current = null;
    }
    setShowCamera(false);
    setCameraError(null);
  };

  const submitAnswer = async () => {
    if (!selectedAnswer) return;

    setSubmitting(true);
    const currentQuestion = questions[currentQuestionIndex];
    
    // Create user answer object
    const userAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer: selectedAnswer,
      imageUrl: capturedImage || undefined,
      timestamp: new Date()
    };

    // Save answer to database
    try {
      await fetch('/api/save-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          setId: setId,
          answer: userAnswer
        }),
      });
    } catch (error) {
      console.error('Error saving answer:', error);
    }

    // Add to local answers array
    const newAnswers = [...userAnswers, userAnswer];
    setUserAnswers(newAnswers);

    // Move to next question or complete exam
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer('');
      setCapturedImage(null);
    } else {
      // Complete exam and get results
      await completeExam(newAnswers);
    }

    setSubmitting(false);
  };

  const completeExam = async (answers: UserAnswer[]) => {
    try {
      const response = await fetch('/api/evaluate-exam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          setId: setId,
          questions: questions,
          answers: answers
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to evaluate exam');
      }

      const result = await response.json();
      setExamResult(result);
      setExamComplete(true);
    } catch (error) {
      console.error('Error evaluating exam:', error);
      // Fallback evaluation
      const score = answers.filter(answer => 
        questions.find(q => q.id === answer.questionId)?.correctAnswer === answer.selectedAnswer
      ).length;
      
      setExamResult({
        score,
        totalQuestions: questions.length,
        answers,
        feedback: questions.map(q => ({
          questionId: q.id,
          isCorrect: answers.find(a => a.questionId === q.id)?.selectedAnswer === q.correctAnswer,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation
        }))
      });
      setExamComplete(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Generating AI Questions...</h2>
          <p className="text-gray-600">Please wait while Groq AI creates your personalized test questions.</p>
        </div>
      </div>
    );
  }

  if (examComplete && examResult) {
    return (
      <>
        <Head>
          <title>Exam Results - ISL Learning Platform</title>
        </Head>
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
          <Navbar />
          
          <div className="pt-24 pb-16">
            <div className="container mx-auto px-4 max-w-4xl">
              {/* Results Header */}
              <div className="text-center mb-12">
                <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${
                  examResult.score >= 8 ? 'bg-green-500' : examResult.score >= 6 ? 'bg-yellow-500' : 'bg-red-500'
                }`}>
                  <span className="text-3xl text-white font-bold">
                    {Math.round((examResult.score / examResult.totalQuestions) * 100)}%
                  </span>
                </div>
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                  {testSetTitles[setId as string]} - Complete!
                </h1>
                <p className="text-xl text-gray-600">
                  You scored {examResult.score} out of {examResult.totalQuestions} questions correctly.
                </p>
              </div>

              {/* Detailed Feedback */}
              <div className="space-y-6">
                {examResult.feedback.map((feedback, index) => {
                  const question = questions.find(q => q.id === feedback.questionId);
                  const userAnswer = examResult.answers.find(a => a.questionId === feedback.questionId);
                  
                  return (
                    <div key={feedback.questionId} className="bg-white rounded-2xl p-6 shadow-soft">
                      <div className="flex items-start space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          feedback.isCorrect ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          {feedback.isCorrect ? (
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            Question {index + 1}: {question?.question}
                          </h3>
                          
                          {userAnswer?.imageUrl && (
                            <div className="mb-4">
                              <p className="text-sm text-gray-600 mb-2">Your Answer (Image):</p>
                              <img src={userAnswer.imageUrl} alt="Your answer" className="w-32 h-32 object-cover rounded-lg" />
                            </div>
                          )}
                          
                          {!feedback.isCorrect && (
                            <div className="mb-4">
                              <p className="text-sm text-red-600 mb-1">Your Answer: {userAnswer?.selectedAnswer}</p>
                              <p className="text-sm text-green-600 mb-1">Correct Answer: {feedback.correctAnswer}</p>
                            </div>
                          )}
                          
                          <p className="text-gray-600 text-sm">{feedback.explanation}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="text-center mt-12 space-y-4">
                <div className="space-x-4">
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                  >
                    Try Again
                  </button>
                  <Link
                    href="/test-sets"
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-colors inline-block"
                  >
                    Choose Another Set
                  </Link>
                </div>
                <Link
                  href="/learn"
                  className="text-orange-600 hover:text-orange-700 font-medium inline-block"
                >
                  Back to Learning
                </Link>
              </div>
            </div>
          </div>
          
          <Footer />
        </div>
      </>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <>
      <Head>
        <title>{testSetTitles[setId as string]} - ISL Learning Platform</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
        <Navbar />
        
        <div className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* Progress Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                {testSetTitles[setId as string]}
              </h1>
              <div className="flex items-center justify-center space-x-4 mb-6">
                <span className="text-lg font-medium text-gray-600">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <div className="w-64 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-2xl shadow-strong p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                {currentQuestion?.question}
              </h2>

              {/* Question Image (if any) */}
              {currentQuestion?.question.includes('hand sign') && (
                <div className="text-center mb-6">
                  <img 
                    src="/alphabets-images/Sign_language_A.svg.png" 
                    alt="Sign language gesture"
                    className="w-48 h-48 object-contain mx-auto rounded-xl shadow-soft"
                  />
                </div>
              )}

              {/* Answer Options */}
              <div className="space-y-4">
                {currentQuestion?.options.map((option, index) => (
                  option && (
                    <button
                      key={index}
                      onClick={() => option === 'Capture Image' ? captureImage() : handleAnswerSelect(option)}
                      className={`w-full p-4 text-left border-2 rounded-xl transition-all duration-300 ${
                        selectedAnswer === option
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 hover:border-orange-300 hover:bg-orange-25'
                      }`}
                    >
                      {option === 'Capture Image' ? (
                        <div className="flex items-center justify-center">
                          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Capture Your Sign
                        </div>
                      ) : (
                        option
                      )}
                    </button>
                  )
                ))}
              </div>

              {/* Captured Image Preview */}
              {capturedImage && (
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 mb-2">Your captured sign:</p>
                  <img src={capturedImage} alt="Captured sign" className="w-32 h-32 object-cover rounded-lg mx-auto" />
                </div>
              )}

              {/* Camera Modal */}
              {showCamera && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                  <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4">
                    <h3 className="text-xl font-bold text-center mb-4">Capture Your Sign</h3>
                    
                    {cameraError ? (
                      <div className="text-center py-8">
                        <div className="text-red-500 mb-4">{cameraError}</div>
                        <button
                          onClick={stopCamera}
                          className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-xl transition-colors"
                        >
                          Close
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="relative mb-4">
                          <video 
                            ref={videoRef}
                            className="w-full h-64 bg-gray-200 rounded-xl object-cover"
                            autoPlay 
                            playsInline 
                            muted
                          />
                          <canvas 
                            ref={canvasRef}
                            className="hidden"
                          />
                          <div className="absolute inset-0 border-2 border-dashed border-orange-300 rounded-xl pointer-events-none"></div>

                          {/* Countdown overlay */}
                          {isStartingCamera && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-xl">
                              <div className="text-white text-lg">Starting camera...</div>
                            </div>
                          )}
                          {countdown !== null && !isStartingCamera && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-20 h-20 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                                <span className="text-white text-3xl font-bold">{countdown}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="text-center text-sm text-gray-600 mb-4">
                          Position your hand in the frame and make the sign for the letter. {countdown !== null ? `Auto capture in ${countdown}s...` : ''}
                        </div>
                        
                        <div className="flex space-x-4">
                          <button
                            onClick={takePicture}
                            disabled={isStartingCamera}
                            className={`flex-1 font-bold py-3 px-6 rounded-xl transition-colors ${
                              isStartingCamera
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-orange-500 hover:bg-orange-600 text-white'
                            }`}
                          >
                            📸 Capture
                          </button>
                          <button
                            onClick={stopCamera}
                            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Answer confirmation popup */}
              {showAnswerConfirm && answerConfirmImage && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex items-end justify-center z-[60]">
                  <div className="mb-10 bg-white shadow-strong rounded-2xl px-6 py-4 flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-lg overflow-hidden border">
                      <img src={answerConfirmImage} alt="Your answer" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-gray-800 font-semibold">Your answer</p>
                      <p className="text-gray-600 text-sm">Submitting and moving to the next question…</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center">
              <Link
                href="/test-sets"
                className="text-gray-600 hover:text-gray-800 font-medium flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Sets
              </Link>

              <button
                onClick={submitAnswer}
                disabled={!selectedAnswer || submitting}
                className={`font-bold py-3 px-6 rounded-xl transition-all duration-300 ${
                  selectedAnswer && !submitting
                    ? 'bg-orange-500 hover:bg-orange-600 text-white transform hover:scale-105'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {submitting ? (
                  <div className="flex items-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Saving...
                  </div>
                ) : currentQuestionIndex === questions.length - 1 ? (
                  'Complete Exam'
                ) : (
                  'Next Question'
                )}
              </button>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
}
