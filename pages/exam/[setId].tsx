import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navbar from '../../components/Navbar';
import { CameraCapture, compressImage, isCameraSupported } from '../../lib/camera';
import { detectHandInRealTime } from '../../lib/handDetection';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string; // for capture questions this is expectedLetter
  explanation: string;
}

interface UserAnswer {
  questionId: number;
  selectedAnswer: string; // image url or text
  imageUrl?: string;
  timestamp: string;
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

  // Data
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  // Progress
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<UserAnswer[]>([]);

  // Capture state
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [immediateAnalysis, setImmediateAnalysis] = useState<UserAnswer['immediateAnalysis'] | null>(null);
  const [showScoreCard, setShowScoreCard] = useState(false); // minimal per-question modal
  const [evaluatingImage, setEvaluatingImage] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [recorderError, setRecorderError] = useState<string | null>(null);
  const [showCameraFallback, setShowCameraFallback] = useState(false);

  // Finalization
  const [showSetCompleteMessage, setShowSetCompleteMessage] = useState(false);
  const [examComplete, setExamComplete] = useState(false);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);

  // Camera refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cameraCapture = useRef<CameraCapture | null>(null);
  const handDetectionCleanup = useRef<(() => void) | null>(null);

  // Device selection
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>();
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [handStatus, setHandStatus] = useState({ detecting: false, stableFrames: 0, confidence: 0 });
  const [preRecordCountdown, setPreRecordCountdown] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const autoStartedRef = useRef(false);

  // Helpers
  const testSetTitles: Record<string, string> = {
    '1': 'Basic Alphabet Set',
    '2': 'Intermediate Challenge',
    '3': 'Advanced Mastery',
    '4': 'Expert Level',
    '5': 'Master Challenge',
  };

  useEffect(() => {
    if (!setId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/generate-questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ setId: Number(setId) })
        });
        if (!res.ok) throw new Error('Failed to generate questions');
        const data = await res.json();
        setQuestions(data.questions);
      } catch (e) {
        // fallback sample
        setQuestions([
          {
            id: 1,
            question: "Show the hand sign for letter 'A'",
            options: ['Capture Image'],
            correctAnswer: 'A',
            explanation: 'Thumb alongside the fist; fingers curled to make a fist.'
          },
          {
            id: 2,
            question: "Show the hand sign for letter 'B'",
            options: ['Capture Image'],
            correctAnswer: 'B',
            explanation: 'Palm out, fingers together straight up, thumb across palm.'
          },
          {
            id: 3,
            question: "Show the hand sign for letter 'C'",
            options: ['Capture Image'],
            correctAnswer: 'C',
            explanation: 'Curve fingers and thumb to form a C shape.'
          },
          {
            id: 4,
            question: "Show the hand sign for letter 'D'",
            options: ['Capture Image'],
            correctAnswer: 'D',
            explanation: 'Index up, other fingers touching thumb to form a circle.'
          },
          {
            id: 5,
            question: "Show the hand sign for letter 'E'",
            options: ['Capture Image'],
            correctAnswer: 'E',
            explanation: 'Fingers bent to touch thumb, forming a small closed shape.'
          },
        ]);
      } finally {
        setLoading(false);
      }
    })();
  }, [setId]);

  // Camera modal lifecycle
  useEffect(() => {
    const start = async () => {
      if (!showCamera || !videoRef.current || !canvasRef.current) return;
      try {
        setIsStartingCamera(true);
        setCameraError(null);
        const devices = await navigator.mediaDevices.enumerateDevices();
        setVideoDevices(devices.filter(d => d.kind === 'videoinput'));
        cameraCapture.current = new CameraCapture(videoRef.current, canvasRef.current);
        await cameraCapture.current.startCamera({ width: 640, height: 480, facingMode: 'user', deviceId: selectedDeviceId });
        // ensure metadata
        if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
          await new Promise<void>(resolve => {
            const onMeta = () => { videoRef.current?.removeEventListener('loadedmetadata', onMeta); resolve(); };
            videoRef.current?.addEventListener('loadedmetadata', onMeta, { once: true });
          });
        }
        setIsStartingCamera(false);
        handDetectionCleanup.current = detectHandInRealTime(
          videoRef.current,
          canvasRef.current,
          () => {}, // no auto-snapshot in video-only flow
          undefined,
          {
            requiredStableFrames: 6,
            confidenceThreshold: 35,
            checkInterval: 250,
            onStatusUpdate: (s) => setHandStatus(s)
          }
        );
        // Auto-start countdown and recording when camera is ready
        if (!autoStartedRef.current) {
          autoStartedRef.current = true;
          startRecordingWithCountdown();
        }
      } catch (err: any) {
        setIsStartingCamera(false);
        setCameraError(err?.message || 'Unable to access camera');
        // switch to fallback quickly
        setShowCamera(false);
        setShowCameraFallback(true);
      }
    };
    start();
    return () => {
      if (!showCamera) {
        if (cameraCapture.current) { cameraCapture.current.stopCamera(); cameraCapture.current = null; }
        if (handDetectionCleanup.current) { handDetectionCleanup.current(); handDetectionCleanup.current = null; }
        setHandStatus({ detecting: false, stableFrames: 0, confidence: 0 });
      }
    };
  }, [showCamera, selectedDeviceId]);

  const openCamera = () => {
    if (!isCameraSupported()) {
      setShowCameraFallback(true);
      return;
    }
    setCapturedImage(null);
    setImmediateAnalysis(null);
    setShowCamera(true);
    setPreRecordCountdown(null);
    setIsRecording(false);
  };

  const stopCamera = () => {
    if (cameraCapture.current) { cameraCapture.current.stopCamera(); cameraCapture.current = null; }
    if (handDetectionCleanup.current) { handDetectionCleanup.current(); handDetectionCleanup.current = null; }
    setShowCamera(false);
  autoStartedRef.current = false;
  };

  const currentQuestion = questions[currentIndex];

  // Helper: map letter to reference image in /public/alphabets-images
  const getLetterImage = (letter?: string) => {
    if (!letter) return undefined;
    const L = String(letter).trim().toUpperCase();
    if (!/^[A-Z]$/.test(L)) return undefined;
    return `/alphabets-images/Sign_language_${L}.svg.png`;
  };

  const takePicture = async () => {
    // Disabled: snapshot capture not used in video-only flow
    return;
  };

  // Start a 4-3-2-1 countdown then record 7 seconds
  const startRecordingWithCountdown = async () => {
    if (!cameraCapture.current || !currentQuestion || isRecording || preRecordCountdown !== null) return;
    setPreRecordCountdown(4);
    let count = 4;
    const timer = setInterval(async () => {
      count -= 1;
      if (count > 0) {
        setPreRecordCountdown(count);
      } else {
        clearInterval(timer);
        setPreRecordCountdown(null);
        await recordFiveSecondVideo();
      }
    }, 1000);
  };

  // New: record a 5-second video answer
  const recordFiveSecondVideo = async () => {
    if (!cameraCapture.current || !currentQuestion) return;
    try {
      setIsRecording(true);
  const recordPromise = cameraCapture.current.recordVideo(7000, 'video/webm');
      // Allow early stop via DONE button
      const doneButton = document.getElementById('record-done-button');
      const onDoneClick = () => cameraCapture.current?.stopRecordingNow();
      if (doneButton) doneButton.addEventListener('click', onDoneClick, { once: true });
      let blob: Blob;
      try {
        blob = await recordPromise;
      } catch (err: any) {
        setIsRecording(false);
        setRecorderError(err?.message || 'Failed to record video');
        throw err;
      }
      setIsRecording(false);

      // Create a local object URL for instant preview
      const objectUrl = URL.createObjectURL(blob);
      pendingVideoUrlRef.current = objectUrl;

      // Grab a thumbnail frame from current video for analysis
      const cap = cameraCapture.current.captureImage(0.8);
      const thumb = cap.image ? await compressImage(cap.image, 800, 0.7) : undefined;

      // Show the score card immediately
      setCapturedImage(thumb || null);
      setShowScoreCard(true);
      setEvaluatingImage(true);

      // Start upload in background (do not block UI)
      (async () => {
        try {
          const dataUrl: string = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
          const uploadedUrl = await cameraCapture.current!.uploadVideo(dataUrl, currentQuestion.id, Number(setId));
          // Optionally switch to uploaded URL for persistence
          pendingVideoUrlRef.current = uploadedUrl;
        } catch {
          // Keep object URL if upload fails; user still sees preview
        }
      })();

      // Close camera quickly
      stopCamera();

      // Analyze using the thumbnail image (async)
      try {
        const res = await fetch('/api/analyze-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl: thumb || '', expectedLetter: currentQuestion.correctAnswer, questionText: currentQuestion.question })
        });
        if (res.ok) {
          const data = await res.json();
          const result: UserAnswer['immediateAnalysis'] = data.result || { isCorrect: false, confidence: 40, feedback: 'Analyzed from a frame.', analysis: 'Consider reviewing the whole motion.' };
          setImmediateAnalysis(result);
        } else {
          setImmediateAnalysis({ isCorrect: false, confidence: 0, feedback: `For "${currentQuestion.correctAnswer}": ${currentQuestion.explanation}`, analysis: 'Motion may not be captured in a single frame.' });
        }
      } catch {
        setImmediateAnalysis({ isCorrect: false, confidence: 0, feedback: `For "${currentQuestion.correctAnswer}": ${currentQuestion.explanation}`, analysis: 'Motion may not be captured in a single frame.' });
      } finally {
        setEvaluatingImage(false);
      }
    } catch (e) {
      setIsRecording(false);
      setCameraError('Failed to record video');
    }
  };

  // Track a pending video URL until submit
  const pendingVideoUrlRef = useRef<string | null>(null);

  const submitCurrentAnswer = async () => {
    if (!currentQuestion || (!capturedImage && !pendingVideoUrlRef.current) || !immediateAnalysis) return;
    const ua: UserAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer: pendingVideoUrlRef.current || capturedImage!,
      imageUrl: capturedImage || undefined,
      timestamp: new Date().toISOString(),
      immediateAnalysis
    };
    const newAnswers = [...answers, ua];
    setAnswers(newAnswers);
    setShowScoreCard(false);

    // If last question, evaluate entire exam and show completion message
    if (newAnswers.length === questions.length) {
      await evaluateExam(newAnswers);
      setShowSetCompleteMessage(true);
      return;
    }

    // next question
    setCurrentIndex((i) => i + 1);
    setCapturedImage(null);
    setImmediateAnalysis(null);
  };

  const evaluateExam = async (ans: UserAnswer[]) => {
    try {
      const res = await fetch('/api/evaluate-exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setId: Number(setId), answers: ans })
      });
      if (!res.ok) throw new Error('Evaluation failed');
      const data = await res.json();
      setExamResult(data as ExamResult);
    } catch (e) {
      // fallback evaluation: score from immediateAnalysis
      const score = ans.reduce((acc, a) => acc + (a.immediateAnalysis?.isCorrect ? 1 : 0), 0);
      setExamResult({
        score,
        totalQuestions: questions.length,
        answers: ans,
        feedback: questions.map(q => ({
          questionId: q.id,
          isCorrect: !!ans.find(a => a.questionId === q.id)?.immediateAnalysis?.isCorrect,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation
        }))
      });
    }
  };

  const handleFileUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file || !currentQuestion) return;
    try {
      // convert to data URL
      const reader = new FileReader();
      const dataUrl: string = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Read failed'));
        reader.readAsDataURL(file);
      });
      // Upload using camera helper (it accepts data URLs too via backend echo)
      const cam = new CameraCapture(document.createElement('video') as HTMLVideoElement, document.createElement('canvas') as HTMLCanvasElement);
      const imageUrl = await cam.uploadImage(dataUrl, currentQuestion.id, Number(setId));
      setCapturedImage(imageUrl);

      setShowCameraFallback(false);
      // analyze
      setEvaluatingImage(true);
      try {
        const res = await fetch('/api/analyze-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageUrl, expectedLetter: currentQuestion.correctAnswer, questionText: currentQuestion.question })
        });
        let result: UserAnswer['immediateAnalysis'];
        if (res.ok) {
          const data = await res.json();
          result = data.result || { isCorrect: false, confidence: 50, feedback: 'Analyzed.', analysis: 'Review gesture.' };
        } else {
          result = { isCorrect: false, confidence: 0, feedback: `For "${currentQuestion.correctAnswer}": ${currentQuestion.explanation}`, analysis: 'Manual verification recommended.' };
        }
        setImmediateAnalysis(result);
      } catch {
        setImmediateAnalysis({ isCorrect: false, confidence: 0, feedback: `For "${currentQuestion.correctAnswer}": ${currentQuestion.explanation}`, analysis: 'Manual verification recommended.' });
      } finally {
        setEvaluatingImage(false);
        setShowScoreCard(true);
      }
    } catch (err) {
      setCameraError('Upload failed');
    }
  };

  const skipQuestion = () => {
    // record as incorrect without image
    if (!currentQuestion) return;
    const ua: UserAnswer = {
      questionId: currentQuestion.id,
      selectedAnswer: 'Skipped',
      timestamp: new Date().toISOString(),
      immediateAnalysis: { isCorrect: false, confidence: 0, feedback: 'Skipped', analysis: 'No attempt' }
    };
    const newAnswers = [...answers, ua];
    setAnswers(newAnswers);
    setShowCameraFallback(false);
    if (newAnswers.length === questions.length) {
      evaluateExam(newAnswers).then(() => setShowSetCompleteMessage(true));
    } else {
      setCurrentIndex(i => i + 1);
    }
  };

  if (examComplete && examResult) {
    return (
      <>
        <Head>
          <title>Exam Results - ISL Learning Platform</title>
        </Head>
        <div className="min-h-screen classic-bg">
          <Navbar />
          <div className="pt-24 pb-16">
            <div className="max-w-6xl mx-auto px-4">
              <div className="text-center mb-16">
                <div className={`w-32 h-32 mx-auto mb-8 border-4 border-gray-800 flex items-center justify-center old-school-card shadow-lg ${examResult.score >= 4 ? 'bg-green-600' : examResult.score >= 3 ? 'bg-yellow-600' : 'bg-red-600'}`}>
                  <span className="text-4xl score-percentage">{Math.round((examResult.score / examResult.totalQuestions) * 100)}%</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold classic-title mb-8 uppercase px-4">{testSetTitles[String(setId)]} - Examination Complete!</h1>
                <div className="w-32 h-2 bg-gray-800 mx-auto mb-10"></div>
                <div className="max-w-4xl mx-auto border-l-4 border-gray-800 pl-8 bg-white p-6 old-school-card">
                  <p className="text-xl sm:text-2xl classic-subtitle italic">Final Score: <span className="font-bold">{examResult.score}</span> out of <span className="font-bold">{examResult.totalQuestions}</span>.</p>
                </div>
              </div>

              <div className="space-y-8 mb-16">
                <h2 className="text-2xl font-bold classic-title text-center mb-12 uppercase">Understanding and Explanations</h2>
                {examResult.feedback.map((fb, idx) => {
                  const q = questions.find(q => q.id === fb.questionId);
                  const ua = examResult.answers.find(a => a.questionId === fb.questionId);
                  const isImageAnswer = !!ua?.imageUrl || (!!ua?.selectedAnswer && (ua.selectedAnswer.startsWith('data:image') || ua.selectedAnswer.startsWith('http')));
                  const isVideoAnswer = !!ua?.selectedAnswer && (ua.selectedAnswer.startsWith('data:video') || ua.selectedAnswer.endsWith('.webm') || ua.selectedAnswer.endsWith('.mp4'));
                  const imageSrc = ua?.imageUrl || (isImageAnswer && !isVideoAnswer ? ua?.selectedAnswer : undefined);
                  const videoSrc = isVideoAnswer ? ua?.selectedAnswer : undefined;
                  return (
                    <div key={fb.questionId} className="old-school-card bg-white p-8 shadow-lg">
                      <div className="flex items-start space-x-6">
                        <div className={`w-12 h-12 border-2 border-gray-800 flex items-center justify-center flex-shrink-0 ${fb.isCorrect ? 'bg-green-600' : 'bg-red-600'}`}>
                          {fb.isCorrect ? (
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
                          <h3 className="text-xl font-bold classic-title mb-6 uppercase">Question {idx + 1}: {q?.question}</h3>
                          {imageSrc && (
                            <div className="mb-6">
                              <p className="text-base classic-subtitle mb-3 italic uppercase font-semibold">Your Captured Image:</p>
                              <img src={imageSrc} alt="Your answer" className="retro-image w-40 h-40 object-cover border-4 border-gray-800" />
                            </div>
                          )}
                          {videoSrc && (
                            <div className="mb-6">
                              <p className="text-base classic-subtitle mb-3 italic uppercase font-semibold">Your Recorded Video:</p>
                              <video src={videoSrc} controls className="w-60 h-40 object-cover border-4 border-gray-800" />
                            </div>
                          )}
                          {!fb.isCorrect && (
                            <div className="mb-6 border-l-4 border-red-600 pl-6 bg-red-50 p-4">
                              {/* Do not print raw video/data URLs */}
                              {!imageSrc && !videoSrc && (
                                <p className="text-base text-red-700 mb-2 font-bold">Your Answer: {ua?.selectedAnswer}</p>
                              )}
                              <p className="text-base text-green-700 mb-2 font-bold">Correct Answer: {fb.correctAnswer}</p>
                              <div className="mt-3">
                                <img src={getLetterImage(fb.correctAnswer)} alt={`Correct sign ${fb.correctAnswer}`} className="w-20 h-20 object-contain border-2 border-gray-800 bg-white" />
                              </div>
                            </div>
                          )}
                          <div className="border-l-4 border-gray-800 pl-6 bg-gray-50 p-4">
                            <p className="classic-subtitle text-base italic leading-relaxed">{fb.explanation}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center mt-12 space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button onClick={() => window.location.reload()} className="btn-classic-primary">RETAKE EXAMINATION</button>
                  <Link href="/test-sets" className="btn-classic-secondary">CHOOSE ANOTHER SET</Link>
                </div>
                <Link href="/learn" className="btn-classic-secondary inline-block">RETURN TO STUDIES</Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Exam - ISL Learning Platform</title>
      </Head>
      <div className="min-h-screen classic-bg">
        <Navbar />

        <div className="pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-4">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold classic-title uppercase">{testSetTitles[String(setId)]}</h1>
              <p className="classic-subtitle italic">Question {currentIndex + 1} of {questions.length || 5}</p>
            </div>

            {/* Question */}
            {loading ? (
              <div className="text-center py-24">
                <div className="classic-loading mx-auto mb-4"></div>
                <p className="classic-subtitle italic">Loading questions...</p>
              </div>
            ) : currentQuestion ? (
              <div className="old-school-card bg-white p-6">
                <h2 className="text-xl font-bold classic-title uppercase mb-6">{currentQuestion.question}</h2>
                <div className="text-center flex gap-3 justify-center">
                  <button className="btn-classic-primary" onClick={openCamera}>OPEN CAMERA</button>
                  {/* Optional file upload remains in fallback modal */}
                </div>
              </div>
            ) : (
              <div className="text-center classic-subtitle">No question found.</div>
            )}

            {/* Minimal per-question score card */}
            {showScoreCard && (
              <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[10010]">
                <div className="old-school-card modal-card bg-white p-8 max-w-md w-full mx-4 text-center">
                  {/* If we have the video, show it; else show the captured image thumbnail */}
                  {pendingVideoUrlRef.current ? (
                    <video src={pendingVideoUrlRef.current} controls className="w-full h-48 object-cover border-4 border-gray-800 mb-4" />
                  ) : (
                    capturedImage && (<img src={capturedImage} alt="Your sign" className="retro-image w-48 h-48 object-cover mx-auto border-4 border-gray-800 mb-6" />)
                  )}
                  {immediateAnalysis ? (
                    <div className={`text-2xl font-bold classic-title mb-6 uppercase ${immediateAnalysis.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                      {immediateAnalysis.isCorrect ? 'Correct Answer' : 'Wrong Answer'}
                    </div>
                  ) : (
                    <div className="text-base classic-subtitle italic mb-6">Processing...</div>
                  )}
                  {/* Reference correct hand image */}
                  {currentQuestion?.correctAnswer && (
                    <div className="mb-6">
                      <p className="text-sm classic-subtitle mb-2 italic uppercase font-semibold">Correct Sign Reference:</p>
                      <img src={getLetterImage(currentQuestion.correctAnswer)} alt={`Correct sign ${currentQuestion.correctAnswer}`} className="w-24 h-24 object-contain mx-auto border-2 border-gray-800 bg-white" />
                    </div>
                  )}
                  <button className="btn-classic-primary" onClick={submitCurrentAnswer} disabled={evaluatingImage || !immediateAnalysis}>CONTINUE</button>
                </div>
              </div>
            )}

            {/* Set Completed message, then go to final results */}
            {showSetCompleteMessage && (
              <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[10000]">
                <div className="old-school-card bg-white p-8 max-w-md w-full mx-4 text-center">
                  <h3 className="text-2xl font-bold classic-title uppercase mb-4">Your question set has been completed.</h3>
                  <p className="classic-subtitle italic mb-6">View your final result and explanations.</p>
                  <button className={`btn-classic-primary ${!examResult ? 'opacity-50 cursor-wait' : ''}`} onClick={() => { if (!examResult) return; setShowSetCompleteMessage(false); setExamComplete(true); }} disabled={!examResult}>VIEW FINAL RESULT</button>
                </div>
              </div>
            )}

            {/* Camera Modal */}
            {showCamera && (
              <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999]" onClick={(e) => { if (e.target === e.currentTarget) { stopCamera(); } }}>
                <div className="old-school-card modal-card bg-white p-8 max-w-2xl w-full mx-4 relative" onClick={(e) => e.stopPropagation()}>
                  <h3 className="text-xl font-bold classic-title text-center mb-6 uppercase">Record Your Sign (7s)</h3>

          {cameraError || recorderError ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 border-4 border-red-600 rounded-full flex items-center justify-center bg-red-100">
                        <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-bold classic-title mb-4 uppercase text-red-700">Camera Access Issue</h4>
            <div className="classic-subtitle mb-6 italic text-red-700">{cameraError || recorderError}</div>

                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button onClick={() => { stopCamera(); setShowCamera(false); setShowCameraFallback(true); }} className="btn-classic-primary">USE FILE UPLOAD INSTEAD</button>
                        <button onClick={stopCamera} className="btn-classic-secondary">CLOSE NOW</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="relative mb-6">
                        {/* Camera selection */}
                        {videoDevices.length > 1 && (
                          <div className="mb-3 flex items-center gap-2">
                            <label className="text-sm font-semibold">Camera:</label>
                            <select value={selectedDeviceId || ''} onChange={async (e) => {
                              setSelectedDeviceId((e.target as HTMLSelectElement).value || undefined);
                              try {
                                setIsStartingCamera(true);
                                if (cameraCapture.current) { cameraCapture.current.stopCamera(); }
                                cameraCapture.current = new CameraCapture(videoRef.current!, canvasRef.current!);
                                await cameraCapture.current.startCamera({ width: 640, height: 480, deviceId: (e.target as HTMLSelectElement).value || undefined });
                              } finally { setIsStartingCamera(false); }
                            }} className="border-2 border-gray-800 p-2 text-sm">
                              <option value="">Default</option>
                              {videoDevices.map(d => (<option key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0,4)}...`}</option>))}
                            </select>
                          </div>
                        )}
                        <video ref={videoRef} className="w-full h-64 classic-video-player classic-video-player-mirrored object-cover" autoPlay playsInline muted />
                        <canvas ref={canvasRef} className="hidden" />

                        {/* Hand detection overlay - kept minimal */}
                        {isStartingCamera && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-xl">
                            <div className="text-white text-lg">Starting camera...</div>
                          </div>
                        )}
                        {/* Countdown overlay */}
                        {preRecordCountdown !== null && (
                          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center z-10 rounded-xl">
                            <div className="text-white text-6xl font-extrabold">{preRecordCountdown}</div>
                          </div>
                        )}
                        {/* Recording badge (top-right) */}
                        {isRecording && (
                          <div className="absolute top-3 right-3 z-10 flex items-center gap-2 bg-red-700 text-white px-3 py-1 rounded">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                            <span className="text-sm font-bold">REC</span>
                          </div>
                        )}
                      </div>
                      <div className="text-center classic-subtitle mb-6 italic">Get ready. After 4-3-2-1, recording starts and you have 7 seconds to answer. You can finish early by pressing DONE.</div>
                      <div className="flex space-x-4 mt-2">
                        <button id="record-done-button" onClick={() => cameraCapture.current?.stopRecordingNow()} disabled={!isRecording} className={`flex-1 ${!isRecording ? 'opacity-50 cursor-not-allowed' : ''} btn-classic-primary`}>DONE</button>
                        <button onClick={stopCamera} disabled={evaluatingImage || isRecording || preRecordCountdown !== null} className={`flex-1 ${evaluatingImage || isRecording || preRecordCountdown !== null ? 'opacity-50 cursor-not-allowed' : ''} btn-classic-secondary`}>CANCEL</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Camera Fallback Modal */}
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
                    <p className="classic-subtitle italic mb-6">We couldn't access your camera. Choose an alternative method to continue:</p>
                  </div>

                  <div className="space-y-4">
                    {/* File Upload Option */}
                    <div className="border-2 border-gray-800 p-4">
                      <h4 className="font-bold classic-title text-sm uppercase mb-3">📁 Upload Image File</h4>
                      <p className="classic-subtitle text-sm italic mb-4">Take a photo with another device or app, then upload it here:</p>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="w-full mb-2 text-sm classic-subtitle" id="image-upload" />
                      <label htmlFor="image-upload" className="btn-classic-primary cursor-pointer inline-block text-center w-full">CHOOSE IMAGE FILE</label>
                    </div>

                    {/* Skip Option */}
                    <div className="border-2 border-gray-400 p-4 bg-gray-50">
                      <h4 className="font-bold classic-title text-sm uppercase mb-3">⏭️ Skip This Question</h4>
                      <p className="classic-subtitle text-sm italic mb-4">Skip this question and continue with the exam. You'll receive educational guidance instead.</p>
                      <button onClick={skipQuestion} className="btn-classic-secondary w-full">SKIP QUESTION</button>
                    </div>
                  </div>

                  <div className="mt-6 text-center">
                    <button onClick={() => setShowCameraFallback(false)} className="btn-classic-secondary">CANCEL</button>
                  </div>
                </div>
              </div>
            )}

            {/* Back */}
            <div className="flex justify-start items-center mt-8">
              <Link href="/test-sets" className="btn-classic-secondary flex items-center">
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                BACK TO SETS
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
