import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import { CameraCapture, isCameraSupported, compressImage } from '../../lib/camera';
import { detectHandInRealTime } from '../../lib/handDetection';

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
  immediateAnalysis?: {
    isCorrect: boolean;
    confidence: number;
    feedback: string;
    analysis: string;
  };
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
  const [immediateAnalysis, setImmediateAnalysis] = useState<{
    isCorrect: boolean;
    confidence: number;
    feedback: string;
    analysis: string;
  } | null>(null);
  const [showImmediateFeedback, setShowImmediateFeedback] = useState(false);
  const [evaluatingImage, setEvaluatingImage] = useState(false);
  const [cameraRetryCount, setCameraRetryCount] = useState(0);
  const [showCameraFallback, setShowCameraFallback] = useState(false);
  const [autoAdvanceTimer, setAutoAdvanceTimer] = useState<NodeJS.Timeout | null>(null);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState<number | null>(null);
  const [handDetectionStatus, setHandDetectionStatus] = useState<{
    detecting: boolean;
    stableFrames: number;
    confidence: number;
  }>({ detecting: false, stableFrames: 0, confidence: 0 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraCapture = useRef<CameraCapture | null>(null);
  const handDetectionCleanup = useRef<(() => void) | null>(null);

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

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showCamera || showImmediateFeedback || showAnswerConfirm) {
      // Disable scroll on body and add modal-open class to disable hover effects
      const originalOverflow = document.body.style.overflow;
      const originalPosition = document.body.style.position;

      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      document.body.classList.add('modal-open');

      return () => {
        // Restore original scroll behavior
        document.body.style.overflow = originalOverflow;
        document.body.style.position = originalPosition;
        document.body.style.width = '';
        document.body.style.height = '';
        document.body.classList.remove('modal-open');
      };
    }
  }, [showCamera, showImmediateFeedback, showAnswerConfirm]);

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
      setShowCameraFallback(true);
      return;
    }

    // Reset states and open camera modal
    setCameraError(null);
    setCameraRetryCount(0);
    setShowCamera(true);
  };

  // Start/stop camera when modal opens/closes and refs are ready
  useEffect(() => {
    const start = async () => {
      if (!showCamera || !videoRef.current || !canvasRef.current) return;
      try {
        setIsStartingCamera(true);
        setCameraError(null);
        cameraCapture.current = new CameraCapture(videoRef.current, canvasRef.current);
        await cameraCapture.current.startCamera({ width: 640, height: 480, facingMode: 'user' });
        setIsStartingCamera(false);
        setCameraRetryCount(0); // Reset retry count on success

        // Start hand detection for auto-capture instead of countdown
        if (videoRef.current && canvasRef.current) {
          setHandDetectionStatus({ detecting: true, stableFrames: 0, confidence: 0 });

          handDetectionCleanup.current = detectHandInRealTime(
            videoRef.current,
            canvasRef.current,
            () => {
              // Auto capture when stable hand is detected
              console.log('🎯 Hand detected - auto capturing!');
              setHandDetectionStatus(prev => ({ ...prev, detecting: false }));
              takePicture();
            },
            () => {
              // Optional: callback when hand is lost
              console.log('👋 Hand detection lost, waiting for stable positioning...');
            },
            {
              requiredStableFrames: 6, // Even more responsive
              confidenceThreshold: 35,  // Slightly higher to avoid face detection
              checkInterval: 250,       // Check every 250ms for better performance
              onStatusUpdate: (status) => {
                setHandDetectionStatus(status);
              }
            }
          );
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setIsStartingCamera(false);

        // Determine error type and message
        let errorMessage = 'Unable to access camera. ';
        let canRetry = true;

        if (err instanceof Error) {
          if (err.name === 'NotAllowedError') {
            errorMessage = 'Camera permission denied. Please allow camera access and try again.';
            canRetry = false;
          } else if (err.name === 'NotFoundError') {
            errorMessage = 'No camera found on this device.';
            canRetry = false;
          } else if (err.name === 'NotReadableError') {
            errorMessage = 'Camera is being used by another application.';
          } else {
            errorMessage = 'Camera access failed. Please check your settings.';
          }
        }

        setCameraError(errorMessage);

        // Auto-retry once for temporary issues
        if (canRetry && cameraRetryCount < 1) {
          console.log('Retrying camera access...');
          setCameraRetryCount(prev => prev + 1);
          setTimeout(() => {
            if (showCamera) {
              start(); // Retry
            }
          }, 2000);
        } else {
          // If retry fails or not allowed, show fallback after a brief delay
          setTimeout(() => {
            if (showCamera) {
              setShowCamera(false);
              setShowCameraFallback(true);
            }
          }, 3000);
        }
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
        if (handDetectionCleanup.current) {
          handDetectionCleanup.current();
          handDetectionCleanup.current = null;
        }
        setHandDetectionStatus({ detecting: false, stableFrames: 0, confidence: 0 });
        setCountdown(null);
        setIsStartingCamera(false);
        setCameraError(null);
      }
    };
  }, [showCamera, cameraRetryCount]);

  // Auto-advance after showing immediate feedback
  useEffect(() => {
    if (showImmediateFeedback && immediateAnalysis) {
      // Clear any existing timer
      if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer);
      }

      // Start countdown from 4 seconds
      setAutoAdvanceCountdown(4);

      // Set new timer for auto-advance (4 seconds to give user time to read)
      const timer = setTimeout(() => {
        setShowImmediateFeedback(false);
        setImmediateAnalysis(null);
        setAutoAdvanceCountdown(null);
        submitAnswer();
      }, 4000);

      setAutoAdvanceTimer(timer);

      // Cleanup function
      return () => {
        if (timer) {
          clearTimeout(timer);
        }
        setAutoAdvanceCountdown(null);
      };
    }
  }, [showImmediateFeedback, immediateAnalysis]);

  // Countdown timer for auto-advance
  useEffect(() => {
    if (autoAdvanceCountdown !== null && autoAdvanceCountdown > 0) {
      const countdownTimer = setTimeout(() => {
        setAutoAdvanceCountdown(autoAdvanceCountdown - 1);
      }, 1000);

      return () => clearTimeout(countdownTimer);
    }
  }, [autoAdvanceCountdown]);

  // Cleanup timer on component unmount
  useEffect(() => {
    return () => {
      if (autoAdvanceTimer) {
        clearTimeout(autoAdvanceTimer);
      }
    };
  }, []);

  const takePicture = async () => {
    if (!cameraCapture.current) return;

    try {
      const captureResult = cameraCapture.current.captureImage(0.8);
      if (captureResult.image) {
        // Show hand detection feedback if available
        if (captureResult.validation && !captureResult.validation.isValid) {
          console.warn('Hand positioning warning:', captureResult.validation.feedback);
        }

        // Compress the image
        const compressedImage = await compressImage(captureResult.image, 800, 0.7);

        // Upload to Cloudinary
        const imageUrl = await cameraCapture.current.uploadImage(
          compressedImage,
          currentQuestion.id,
          parseInt(setId as string)
        );

        setCapturedImage(imageUrl);
        setSelectedAnswer(imageUrl);
        stopCamera();

        // Immediately evaluate the captured image with AI
        setEvaluatingImage(true);

        try {
          console.log(`Immediately analyzing captured image for question ${currentQuestion.id}`);
          console.log(`Hand detection result: ${captureResult.handDetected ? 'Hand detected' : 'Center crop used'}`);

          const analysisResponse = await fetch('/api/analyze-image', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageUrl: imageUrl,
              expectedLetter: currentQuestion.correctAnswer,
              questionText: currentQuestion.question
            }),
          });

          if (analysisResponse.ok) {
            const analysisData = await analysisResponse.json();

            if (analysisData.success && analysisData.result) {
              setImmediateAnalysis({
                isCorrect: analysisData.result.isCorrect,
                confidence: analysisData.result.confidence,
                feedback: analysisData.result.feedback,
                analysis: analysisData.result.analysis
              });

              console.log(`AI Analysis: ${analysisData.result.isCorrect ? 'CORRECT' : 'INCORRECT'} (${analysisData.result.confidence}% confidence)`);
            } else {
              // Fallback analysis result
              setImmediateAnalysis({
                isCorrect: analysisData.result?.isCorrect || false,
                confidence: analysisData.result?.confidence || 50,
                feedback: analysisData.result?.feedback || 'Image analyzed with basic evaluation.',
                analysis: analysisData.result?.analysis || 'Keep practicing!'
              });
            }
          } else {
            throw new Error('Analysis request failed');
          }
        } catch (analysisError) {
          console.error('Error analyzing image:', analysisError);
          // Provide basic feedback if analysis fails
          setImmediateAnalysis({
            isCorrect: false,
            confidence: 0,
            feedback: `For letter "${currentQuestion.correctAnswer}": ${currentQuestion.explanation}`,
            analysis: 'Could not analyze image automatically. Please verify your gesture matches ISL standards.'
          });
        }

        setEvaluatingImage(false);

        // Show immediate feedback modal (auto-advance handled by useEffect)
        setShowImmediateFeedback(true);
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      setCameraError('Failed to capture image. Please try again.');
      setEvaluatingImage(false);
    }
  };

  const stopCamera = () => {
    if (cameraCapture.current) {
      cameraCapture.current.stopCamera();
      cameraCapture.current = null;
    }
    if (handDetectionCleanup.current) {
      handDetectionCleanup.current();
      handDetectionCleanup.current = null;
    }
    setHandDetectionStatus({ detecting: false, stableFrames: 0, confidence: 0 });
    setShowCamera(false);
    setCameraError(null);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image file too large. Please select an image under 5MB.');
      return;
    }

    try {
      setEvaluatingImage(true);

      // Convert to base64 for upload
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;

        // Create a canvas to resize if needed
        const img = new Image();
        img.onload = async () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Resize to reasonable dimensions
          const maxSize = 800;
          let { width, height } = img;

          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }

          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);

          const compressedImage = canvas.toDataURL('image/jpeg', 0.8);

          // Create a temporary canvas element for CameraCapture
          const tempCanvas = document.createElement('canvas');
          const tempVideo = document.createElement('video');

          try {
            // Create a temporary CameraCapture instance just for uploading
            const tempCameraCapture = new CameraCapture(tempVideo, tempCanvas);

            const imageUrl = await tempCameraCapture.uploadImage(
              compressedImage,
              currentQuestion.id,
              parseInt(setId as string)
            );

            setCapturedImage(imageUrl);
            setSelectedAnswer(imageUrl);
            setShowCameraFallback(false);

            // Immediately evaluate the uploaded image
            const analysisResponse = await fetch('/api/analyze-image', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                imageUrl: imageUrl,
                expectedLetter: currentQuestion.correctAnswer,
                questionText: currentQuestion.question
              }),
            });

            if (analysisResponse.ok) {
              const analysisData = await analysisResponse.json();
              setImmediateAnalysis({
                isCorrect: analysisData.result?.isCorrect || false,
                confidence: analysisData.result?.confidence || 50,
                feedback: analysisData.result?.feedback || 'Image uploaded successfully.',
                analysis: analysisData.result?.analysis || 'Keep practicing!'
              });
            } else {
              setImmediateAnalysis({
                isCorrect: false,
                confidence: 50,
                feedback: 'Image uploaded but could not be analyzed automatically. Please verify your gesture matches ISL standards.',
                analysis: 'Upload successful - manual verification recommended.'
              });
            }

            setEvaluatingImage(false);
            setShowImmediateFeedback(true);

          } catch (error) {
            console.error('Error uploading image:', error);
            setEvaluatingImage(false);
            alert('Failed to upload image. Please try again.');
          }
        };
        img.src = imageData;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error processing file:', error);
      setEvaluatingImage(false);
      alert('Error processing image file.');
    }
  };

  const skipQuestion = () => {
    setShowCameraFallback(false);
    // Set a default answer to allow proceeding
    setSelectedAnswer('Skipped - Camera unavailable');

    // Add a skipped answer without image
    setImmediateAnalysis({
      isCorrect: false,
      confidence: 0,
      feedback: `Question skipped due to camera issues. The correct sign for "${currentQuestion.correctAnswer}" is: ${currentQuestion.explanation}`,
      analysis: 'Question was skipped. Please practice this sign using ISL reference materials.'
    });

    setShowImmediateFeedback(true);
  }; const submitAnswer = async () => {
    if (!selectedAnswer) return;

    setSubmitting(true);
    const currentQuestion = questions[currentQuestionIndex];

    // Create user answer object with immediate analysis
    const userAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer: selectedAnswer,
      imageUrl: capturedImage || undefined,
      timestamp: new Date(),
      immediateAnalysis: immediateAnalysis || undefined
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
      setImmediateAnalysis(null);
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
      <div className="min-h-screen classic-bg flex items-center justify-center">
        <div className="text-center old-school-card bg-white p-12">
          <div className="classic-loading mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold classic-title mb-4 uppercase">Generating Examination Questions...</h2>
          <p className="classic-subtitle italic">Please wait while our AI system creates your personalized test questions.</p>
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
        <div className="min-h-screen classic-bg">
          <Navbar />

          <div className="pt-24 pb-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Results Header */}
              <div className="text-center mb-16">
                <div className={`w-32 h-32 mx-auto mb-8 border-4 border-gray-800 flex items-center justify-center old-school-card shadow-lg ${examResult.score >= 8 ? 'bg-green-600' : examResult.score >= 6 ? 'bg-yellow-600' : 'bg-red-600'
                  }`}>
                  <span className="text-4xl score-percentage">
                    {Math.round((examResult.score / examResult.totalQuestions) * 100)}%
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold classic-title mb-8 uppercase px-4">
                  {testSetTitles[setId as string]} - Examination Complete!
                </h1>
                <div className="w-32 h-2 bg-gray-800 mx-auto mb-10"></div>
                <div className="max-w-4xl mx-auto border-l-4 border-gray-800 pl-8 bg-white p-6 old-school-card">
                  <p className="text-xl sm:text-2xl classic-subtitle italic">
                    Final Score: <span className="font-bold">{examResult.score}</span> out of <span className="font-bold">{examResult.totalQuestions}</span> questions answered correctly.
                  </p>
                </div>
              </div>

              {/* Detailed Feedback */}
              <div className="space-y-8 mb-16">
                <h2 className="text-2xl font-bold classic-title text-center mb-12 uppercase">
                  Detailed Question Review
                </h2>
                {examResult.feedback.map((feedback, index) => {
                  const question = questions.find(q => q.id === feedback.questionId);
                  const userAnswer = examResult.answers.find(a => a.questionId === feedback.questionId);

                  return (
                    <div key={feedback.questionId} className="old-school-card bg-white p-8 shadow-lg">
                      <div className="flex items-start space-x-6">
                        <div className={`w-12 h-12 border-2 border-gray-800 flex items-center justify-center flex-shrink-0 ${feedback.isCorrect ? 'bg-green-600' : 'bg-red-600'
                          }`}>
                          {feedback.isCorrect ? (
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20" strokeWidth={3}>
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20" strokeWidth={3}>
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold classic-title mb-6 uppercase">
                            Question {index + 1}: {question?.question}
                          </h3>

                          {userAnswer?.imageUrl && (
                            <div className="mb-6">
                              <p className="text-base classic-subtitle mb-3 italic uppercase font-semibold">Your Submitted Image:</p>
                              <img src={userAnswer.imageUrl} alt="Your answer" className="retro-image w-40 h-40 object-cover border-4 border-gray-800" />
                            </div>
                          )}

                          {!feedback.isCorrect && (
                            <div className="mb-6 border-l-4 border-red-600 pl-6 bg-red-50 p-4">
                              <p className="text-base text-red-700 mb-2 font-bold">Your Answer: {userAnswer?.selectedAnswer}</p>
                              <p className="text-base text-green-700 mb-2 font-bold">Correct Answer: {feedback.correctAnswer}</p>
                            </div>
                          )}

                          <div className="border-l-4 border-gray-800 pl-6 bg-gray-50 p-4">
                            <p className="classic-subtitle text-base italic leading-relaxed">{feedback.explanation}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="text-center mt-12 space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => window.location.reload()}
                    className="btn-classic-primary"
                  >
                    RETAKE EXAMINATION
                  </button>
                  <Link
                    href="/test-sets"
                    className="btn-classic-secondary"
                  >
                    CHOOSE ANOTHER SET
                  </Link>
                </div>
                <Link
                  href="/learn"
                  className="btn-classic-secondary inline-block"
                >
                  RETURN TO STUDIES
                </Link>
              </div>
            </div>
          </div>
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

      <div className="min-h-screen classic-bg">
        <Navbar />

        <div className="pt-24 pb-16">
          <div className="max-w-6xl mx-auto px-4">
            {/* Progress Header */}
            <div className="text-center mb-8 classic-bg-paper p-8 border-4 border-gray-800">
              <h1 className="text-4xl font-bold classic-title mb-6 uppercase">
                {testSetTitles[setId as string]}
              </h1>
              <div className="flex items-center justify-center space-x-6 mb-6">
                <span className="text-lg font-bold classic-title uppercase">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <div className="w-64 bg-gray-300 border-2 border-gray-800 h-4">
                  <div
                    className="bg-gray-800 h-full transition-all duration-500"
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Question Card */}
            <div className="old-school-card bg-white p-8 mb-8">
              <h2 className="text-2xl font-bold classic-title mb-8 text-center uppercase">
                {currentQuestion?.question}
              </h2>

              {/* Question Image (if any) */}
              {currentQuestion?.question.includes('hand sign') && (
                <div className="text-center mb-8">
                  <img
                    src="/alphabets-images/Sign_language_A.svg.png"
                    alt="Sign language gesture"
                    className="retro-image w-48 h-48 object-contain mx-auto"
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
                      className={`w-full p-4 text-left border-3 border-gray-800 transition-all duration-300 classic-focus ${selectedAnswer === option
                        ? 'bg-gray-800 text-white font-bold'
                        : 'bg-white hover:bg-gray-100 classic-subtitle'
                        }`}
                    >
                      {option === 'Capture Image' ? (
                        <div className="flex items-center justify-center">
                          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          CAPTURE YOUR SIGN
                        </div>
                      ) : (
                        option.toUpperCase()
                      )}
                    </button>
                  )
                ))}
              </div>

              {/* Captured Image Preview */}
              {capturedImage && (
                <div className="mt-8 text-center classic-bg-paper p-6 border-4 border-gray-800">
                  <p className="text-sm classic-subtitle mb-4 italic uppercase">Your Captured Sign:</p>
                  <img src={capturedImage} alt="Captured sign" className="retro-image w-32 h-32 object-cover mx-auto" />
                </div>
              )}

              {/* Camera Modal */}
              {showCamera && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999]"
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    overflowY: 'hidden',
                    pointerEvents: 'auto'
                  }}
                  onClick={(e) => {
                    // Allow closing only if clicking the backdrop directly
                    if (e.target === e.currentTarget) {
                      stopCamera();
                    }
                  }}
                >
                  <div
                    className="old-school-card modal-card bg-white p-8 max-w-2xl w-full mx-4 relative"
                    style={{
                      maxHeight: '90vh',
                      overflowY: 'auto',
                      pointerEvents: 'auto',
                      zIndex: 10000
                    }}
                    onClick={(e) => {
                      // Prevent modal content clicks from bubbling
                      e.stopPropagation();
                    }}
                  >
                    <h3 className="text-xl font-bold classic-title text-center mb-6 uppercase">Capture Your Sign</h3>

                    {cameraError ? (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 border-4 border-red-600 rounded-full flex items-center justify-center bg-red-100">
                          <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-bold classic-title mb-4 uppercase text-red-700">Camera Access Issue</h4>
                        <div className="classic-subtitle mb-6 italic text-red-700">{cameraError}</div>

                        {cameraRetryCount < 1 ? (
                          <div className="mb-6">
                            <div className="classic-loading mx-auto mb-3"></div>
                            <p className="classic-subtitle italic text-sm">Retrying camera access...</p>
                          </div>
                        ) : (
                          <div className="mb-6">
                            <p className="classic-subtitle italic text-sm mb-2">Automatically switching to alternative options...</p>
                            <div className="w-32 h-2 bg-gray-300 mx-auto">
                              <div className="w-full h-full bg-red-600 animate-pulse"></div>
                            </div>
                          </div>
                        )}

                        <button
                          onClick={stopCamera}
                          className="btn-classic-secondary"
                        >
                          CLOSE NOW
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="relative mb-6">
                          <video
                            ref={videoRef}
                            className="w-full h-64 classic-video-player classic-video-player-mirrored object-cover"
                            autoPlay
                            playsInline
                            muted
                          />
                          <canvas
                            ref={canvasRef}
                            className="hidden"
                          />

                          {/* Hand detection zone with face exclusion */}
                          <div className="absolute inset-0 pointer-events-none">
                            {/* Face exclusion zone (top 30%) */}
                            <div className="absolute top-0 left-0 right-0 h-[30%] bg-red-500 bg-opacity-10 border-2 border-red-400 border-dashed">
                              <div className="absolute top-2 left-2 text-red-400 text-xs font-semibold">
                                😊 Face area - hands not detected here
                              </div>
                            </div>

                            {/* Hand detection zone (bottom 70%) */}
                            <div className="absolute top-[30%] left-0 right-0 bottom-0 border-2 border-green-400 border-dashed bg-green-400 bg-opacity-5">
                              <div className="absolute top-2 left-2 text-green-400 text-xs font-semibold">
                                ✋ Hand detection zone
                              </div>

                              {/* Corner indicators for hand zone */}
                              <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-green-500"></div>
                              <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-green-500"></div>
                              <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-green-500"></div>
                              <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-green-500"></div>
                            </div>

                            {/* Hand positioning instructions */}
                            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm font-semibold">
                              ✋ Show your hand below face level
                            </div>

                            {/* Detection feedback indicator */}
                            {handDetectionStatus.detecting && handDetectionStatus.stableFrames > 0 && (
                              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 bg-opacity-90 text-white px-4 py-2 rounded-lg text-sm font-semibold animate-pulse">
                                🎯 Hand detected! Keep steady... ({handDetectionStatus.stableFrames}/6)
                              </div>
                            )}
                          </div>

                          {/* Hand detection status overlay */}
                          {isStartingCamera && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-xl">
                              <div className="text-white text-lg">Starting camera...</div>
                            </div>
                          )}
                          {!isStartingCamera && !cameraError && (
                            <div className="absolute top-4 left-4 bg-black bg-opacity-90 text-white px-4 py-3 rounded-lg text-sm min-w-[200px]">
                              {handDetectionStatus.detecting ? (
                                <>
                                  <div className="flex items-center space-x-2 mb-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span>🤚 Detecting hand...</span>
                                  </div>
                                  <div className="text-xs opacity-75 mb-1">
                                    Stability: {handDetectionStatus.stableFrames}/8 frames
                                  </div>
                                  <div className="text-xs opacity-75">
                                    Confidence: {handDetectionStatus.confidence}%
                                  </div>
                                  {handDetectionStatus.stableFrames > 0 && (
                                    <div className="text-xs text-green-400 mt-1">
                                      ✓ Hand detected! Keep steady...
                                    </div>
                                  )}
                                </>
                              ) : (
                                <>
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                                    <span>👋 Ready to detect</span>
                                  </div>
                                  <div className="text-xs mt-1 opacity-75">
                                    Show your hand in the lower area (not your face)
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="text-center classic-subtitle mb-6 italic">
                          Position your hand in the lower part of the camera view (below your face). The AI will automatically detect your hand gesture and capture when stable.
                        </div>                    <div className="flex space-x-4">
                          <button
                            onClick={takePicture}
                            disabled={isStartingCamera || evaluatingImage}
                            className={`flex-1 ${isStartingCamera || evaluatingImage
                              ? 'btn-classic-secondary opacity-50 cursor-not-allowed'
                              : 'btn-classic-primary'
                              }`}
                          >
                            {evaluatingImage ? (
                              <div className="flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                                ANALYZING...
                              </div>
                            ) : (
                              '📸 CAPTURE'
                            )}
                          </button>
                          <button
                            onClick={stopCamera}
                            disabled={evaluatingImage}
                            className={`flex-1 ${evaluatingImage ? 'opacity-50 cursor-not-allowed' : ''} btn-classic-secondary`}
                          >
                            CANCEL
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Answer confirmation popup */}
              {showAnswerConfirm && answerConfirmImage && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-75 flex items-end justify-center z-[9999]"
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    overflowY: 'hidden',
                    pointerEvents: 'auto'
                  }}
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      setShowAnswerConfirm(false);
                      setAnswerConfirmImage(null);
                    }
                  }}
                >
                  <div
                    className="mb-10 old-school-card modal-card bg-white px-8 py-6 flex items-center space-x-6"
                    style={{
                      pointerEvents: 'auto',
                      zIndex: 10000
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="w-14 h-14 border-4 border-gray-800 overflow-hidden">
                      <img src={answerConfirmImage} alt="Your answer" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="classic-title font-bold uppercase">Your Answer</p>
                      <p className="classic-subtitle text-sm italic">Submitting and proceeding to the next question...</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Immediate AI Feedback Modal */}
              {showImmediateFeedback && immediateAnalysis && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999]"
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    overflowY: 'hidden',
                    pointerEvents: 'auto'
                  }}
                  onClick={(e) => {
                    // Prevent any backdrop clicks from closing - auto-advance only
                    if (e.target === e.currentTarget) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                >
                  <div
                    className="old-school-card modal-card bg-white p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                    style={{
                      pointerEvents: 'auto',
                      zIndex: 10000
                    }}
                    onClick={(e) => {
                      // Prevent clicks inside modal from bubbling up
                      e.stopPropagation();
                    }}
                  >
                    {evaluatingImage ? (
                      <div className="text-center py-12">
                        <div className="classic-loading mx-auto mb-8"></div>
                        <h3 className="text-2xl font-bold classic-title mb-6 uppercase">Analyzing Your Sign...</h3>
                        <p className="classic-subtitle italic text-lg">AI is evaluating your gesture</p>
                      </div>
                    ) : (
                      <>
                        <div className="text-center mb-8">
                          <div className={`w-20 h-20 mx-auto mb-6 border-4 border-gray-800 rounded-full flex items-center justify-center ${immediateAnalysis.isCorrect ? 'bg-green-600' : 'bg-red-600'
                            }`}>
                            {immediateAnalysis.isCorrect ? (
                              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <h3 className={`text-2xl font-bold classic-title mb-3 uppercase ${immediateAnalysis.isCorrect ? 'text-green-700' : 'text-red-700'
                            }`}>
                            {immediateAnalysis.isCorrect ? 'Well Done!' : 'Keep Practicing!'}
                          </h3>
                          <p className="classic-subtitle text-base italic">
                            AI Confidence: {immediateAnalysis.confidence}%
                          </p>
                        </div>

                        {capturedImage && (
                          <div className="text-center mb-8">
                            <p className="text-sm classic-subtitle mb-3 italic uppercase">Your Captured Sign:</p>
                            <img src={capturedImage} alt="Your sign" className="retro-image w-40 h-40 object-cover mx-auto border-4 border-gray-800" />
                          </div>
                        )}

                        <div className="mb-8 border-l-4 border-gray-800 pl-6">
                          <h4 className="font-bold classic-title text-base uppercase mb-3">AI Analysis:</h4>
                          <p className="classic-subtitle text-base italic mb-6">{immediateAnalysis.analysis}</p>

                          <h4 className="font-bold classic-title text-base uppercase mb-3">Feedback & Tips:</h4>
                          <p className="classic-subtitle text-base italic whitespace-pre-line leading-relaxed">{immediateAnalysis.feedback}</p>
                        </div>

                        {/* Auto-advance countdown */}
                        {autoAdvanceCountdown !== null && autoAdvanceCountdown > 0 && (
                          <div className="text-center mb-6 p-4 bg-gray-100 border-2 border-gray-400 rounded">
                            <p className="classic-subtitle text-base italic">
                              ⏱️ Auto-advancing in <span className="font-bold text-orange-600 text-lg">{autoAdvanceCountdown}</span> seconds...
                            </p>
                            <div className="w-full bg-gray-300 rounded-full h-3 mt-3">
                              <div
                                className="bg-orange-500 h-3 rounded-full transition-all duration-1000"
                                style={{ width: `${((4 - autoAdvanceCountdown) / 4) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}              {/* Camera Fallback Modal */}
              {showCameraFallback && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[70]">
                  <div className="old-school-card bg-white p-8 max-w-lg w-full mx-4">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 mx-auto mb-4 border-4 border-orange-600 rounded-full flex items-center justify-center bg-orange-100">
                        <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.5 6.5l.01 0" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold classic-title mb-4 uppercase">Camera Unavailable</h3>
                      <p className="classic-subtitle italic mb-6">
                        We couldn't access your camera. Choose an alternative method to continue:
                      </p>
                    </div>

                    <div className="space-y-4">
                      {/* File Upload Option */}
                      <div className="border-2 border-gray-800 p-4">
                        <h4 className="font-bold classic-title text-sm uppercase mb-3">📁 Upload Image File</h4>
                        <p className="classic-subtitle text-sm italic mb-4">
                          Take a photo with another device or app, then upload it here:
                        </p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="w-full mb-2 text-sm classic-subtitle"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="btn-classic-primary cursor-pointer inline-block text-center w-full"
                        >
                          CHOOSE IMAGE FILE
                        </label>
                      </div>

                      {/* Skip Option */}
                      <div className="border-2 border-gray-400 p-4 bg-gray-50">
                        <h4 className="font-bold classic-title text-sm uppercase mb-3">⏭️ Skip This Question</h4>
                        <p className="classic-subtitle text-sm italic mb-4">
                          Skip this question and continue with the exam. You'll receive educational guidance instead.
                        </p>
                        <button
                          onClick={skipQuestion}
                          className="btn-classic-secondary w-full"
                        >
                          SKIP QUESTION
                        </button>
                      </div>
                    </div>

                    <div className="mt-6 text-center">
                      <button
                        onClick={() => setShowCameraFallback(false)}
                        className="btn-classic-secondary"
                      >
                        CANCEL
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-start items-center">
              <Link
                href="/test-sets"
                className="btn-classic-secondary flex items-center"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                BACK TO SETS
              </Link>
            </div>
          </div>
        </div>
      </div >
    </>
  );
}
