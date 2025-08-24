import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { getProgress, isLetterCompleted, toggleLetter, onProgressChange, markLetter } from '../lib/progress';

interface Letter {
  id: string;
  letter: string;
  description: string;
  handImage: string; // Main hand image for the letter
}

export default function Learn() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [filteredLetters, setFilteredLetters] = useState<Letter[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);
  const [videoError, setVideoError] = useState(false);

  // ISL Alphabet with local images from alphabets-images folder
  const islAlphabet: Letter[] = [
    {
      id: 'A',
      letter: 'A',
      description: 'Index finger pointing upward with thumb extended',
      handImage: "/alphabets-images/Sign_language_A.svg.png",
    },
    {
      id: 'B',
      letter: 'B',
      description: 'Flat hand with fingers together pointing up',
      handImage: "/alphabets-images/Sign_language_B.svg.png",
    },
    {
      id: 'C',
      letter: 'C',
      description: 'Curved hand with fingers together pointing up',
      handImage: "/alphabets-images/Sign_language_C.svg.png",
    },
    {
      id: 'D',
      letter: 'D',
      description: 'Index finger pointing up with other fingers closed',
      handImage: "/alphabets-images/Sign_language_D.svg.png",
    },
    {
      id: 'E',
      letter: 'E',
      description: 'Fingers curled into fist',
      handImage: "/alphabets-images/Sign_language_E.svg.png",
    },
    {
      id: 'F',
      letter: 'F',
      description: 'Index and middle finger extended',
      handImage: "/alphabets-images/Sign_language_F.svg.png",
    },
    {
      id: 'G',
      letter: 'G',
      description: 'Index finger pointing to the side',
      handImage: "/alphabets-images/Sign_language_G.svg.png",
    },
    {
      id: 'H',
      letter: 'H',
      description: 'Index and middle finger pointing up',
      handImage: "/alphabets-images/Sign_language_H.svg.png",
    },
    {
      id: 'I',
      letter: 'I',
      description: 'Pinky finger extended',
      handImage: "/alphabets-images/Sign_language_I.svg.png",
    },
    {
      id: 'J',
      letter: 'J',
      description: 'Index finger making a J shape',
      handImage: "/alphabets-images/Sign_language_J.svg.png",
    },
    {
      id: 'K',
      letter: 'K',
      description: 'Index and middle finger pointing up',
      handImage: "/alphabets-images/Sign_language_K.svg.png",
    },
    {
      id: 'L',
      letter: 'L',
      description: 'Index finger pointing up',
      handImage: "/alphabets-images/Sign_language_L.svg.png",
    },
    {
      id: 'M',
      letter: 'M',
      description: 'Three fingers pointing up',
      handImage: "/alphabets-images/Sign_language_M.svg.png",
    },
    {
      id: 'N',
      letter: 'N',
      description: 'Index and middle finger pointing up',
      handImage: "/alphabets-images/Sign_language_N.svg.png",
    },
    {
      id: 'O',
      letter: 'O',
      description: 'Fingers curled into circle',
      handImage: "/alphabets-images/Sign_language_O.svg.png",
    },
    {
      id: 'P',
      letter: 'P',
      description: 'Index finger pointing up',
      handImage: "/alphabets-images/Sign_language_P.svg.png",
    },
    {
      id: 'Q',
      letter: 'Q',
      description: 'Index finger pointing down',
      handImage: "/alphabets-images/Sign_language_Q.svg.png",
    },
    {
      id: 'R',
      letter: 'R',
      description: 'Index and middle finger crossed',
      handImage: "/alphabets-images/Sign_language_R.svg.png",
    },
    {
      id: 'S',
      letter: 'S',
      description: 'Fist with thumb on top',
      handImage: "/alphabets-images/Sign_language_S.svg.png",
    },
    {
      id: 'T',
      letter: 'T',
      description: 'Index finger pointing up',
      handImage: "/alphabets-images/Sign_language_T.svg.png",
    },
    {
      id: 'U',
      letter: 'U',
      description: 'Index and middle finger pointing up',
      handImage: "/alphabets-images/Sign_language_U.svg.png",
    },
    {
      id: 'V',
      letter: 'V',
      description: 'Index and middle finger pointing up',
      handImage: "/alphabets-images/Sign_language_V.svg.png",
    },
    {
      id: 'W',
      letter: 'W',
      description: 'Three fingers pointing up',
      handImage: "/alphabets-images/Sign_language_W.svg.png",
    },
    {
      id: 'X',
      letter: 'X',
      description: 'Index finger pointing up',
      handImage: "/alphabets-images/Sign_language_X.svg.png",
    },
    {
      id: 'Y',
      letter: 'Y',
      description: 'Thumb and pinky extended',
      handImage: "/alphabets-images/Sign_language_Y.svg.png",
    },
    {
      id: 'Z',
      letter: 'Z',
      description: 'Index finger pointing up',
      handImage: "/alphabets-images/Sign_language_Z.svg.png",
    }
  ];

  useEffect(() => {
    // Use local ISL alphabet data directly
    setLetters(islAlphabet);
    setFilteredLetters(islAlphabet);
    setLoading(false);
    // Initialize progress
    const p = getProgress();
    setCompletedCount(islAlphabet.filter(l => p.completedLetters.includes(l.id)).length);
    // Listen for cross-tab updates
    const off = onProgressChange((data) => {
      setCompletedCount(islAlphabet.filter(l => data.completedLetters.includes(l.id)).length);
    });
    return () => {
      off();
    };
  }, []);

  useEffect(() => {
    let filtered = letters;

    if (searchTerm) {
      filtered = letters.filter(letter =>
        letter.letter.toLowerCase().includes(searchTerm.toLowerCase()) ||
        letter.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(letter => {
        if (selectedCategory === 'vowels') {
          return ['A', 'E', 'I', 'O', 'U'].includes(letter.letter);
        } else if (selectedCategory === 'consonants') {
          return !['A', 'E', 'I', 'O', 'U'].includes(letter.letter);
        }
        return true;
      });
    }

    setFilteredLetters(filtered);
  }, [searchTerm, letters, selectedCategory]);

  const handleLetterClick = (letter: Letter) => {
    console.log('Selected letter:', letter);
    setSelectedLetter(letter);
    setShowModal(true);
  setVideoError(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedLetter(null);
  };

  const categories = [
    { id: 'all', name: 'All Letters', count: letters.length },
    { id: 'vowels', name: 'Vowels (A, E, I, O, U)', count: letters.filter(l => ['A', 'E', 'I', 'O', 'U'].includes(l.letter)).length },
    { id: 'consonants', name: 'Consonants', count: letters.filter(l => !['A', 'E', 'I', 'O', 'U'].includes(l.letter)).length },
  ];

  if (loading) {
    return (
      <>
        <Head>
          <title>Learn ISL A-Z - Indian Sign Language Learning</title>
          <meta name="description" content="Learn all letters A-Z in Indian Sign Language with video demonstrations." />
        </Head>
        <div className="min-h-screen classic-bg">
          <Navbar />
          <div className="flex items-center justify-center min-h-screen">
            <div className="classic-loading"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Learn ISL A-Z - Indian Sign Language Learning</title>
        <meta name="description" content="Learn all letters A-Z in Indian Sign Language with video demonstrations." />
      </Head>

      <div className="min-h-screen classic-bg">
        <Navbar />

        {/* Header */}
        <section className="classic-bg-paper relative border-b-4 border-gray-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <div className="inline-block p-4 bg-white border-4 border-gray-800 mb-8 old-school-card">
                <svg className="w-12 h-12 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold classic-title mb-6 uppercase">
                ISL ALPHABET COURSE
              </h1>
              <div className="w-32 h-2 bg-gray-800 mx-auto mb-8"></div>
              <div className="max-w-4xl mx-auto border-l-4 border-gray-800 pl-8">
                <p className="text-xl classic-subtitle leading-relaxed italic">
                  "A comprehensive study of the twenty-six letters comprising the Indian Sign Language alphabet.
                  Each character presented with methodical instruction and proper hand positioning techniques
                  essential for accurate communication."
                </p>
              </div>
            </div>
          </div>
        </section>

  {/* Search area removed by request */}

        {/* Letters Grid */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {filteredLetters.length === 0 ? (
            <div className="text-center py-16 old-school-card p-12">
              <div className="w-16 h-16 bg-gray-800 border-4 border-gray-600 flex items-center justify-center mx-auto mb-6">
                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold classic-title mb-4 uppercase">No Letters Found</h3>
              <p className="classic-subtitle">
                Please adjust your search criteria and try again.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredLetters.map((letter) => (
                <div
                  key={letter.id}
                  className="classic-letter-card bg-white p-6 cursor-pointer text-center h-full flex flex-col"
                  onClick={() => handleLetterClick(letter)}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex-1">
                      <div className="w-20 h-20 bg-gray-800 border-4 border-gray-600 flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl font-bold text-white" style={{ fontFamily: 'Georgia, serif' }}>{letter.letter}</span>
                      </div>
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <h3 className="text-2xl font-bold classic-title uppercase">Letter {letter.letter}</h3>
                        {isLetterCompleted(letter.id) && (
                          <span className="inline-flex items-center text-xs font-semibold px-2 py-1 border-2 border-green-700 bg-green-200 text-green-900">COMPLETED</span>
                        )}
                      </div>
                      <div className="border-l-4 border-gray-800 pl-4 mb-6 text-left">
                        <p className="text-sm classic-subtitle leading-relaxed wrap-anywhere">{letter.description}</p>
                      </div>
                    </div>
                    <button className="btn-classic-primary w-full mt-2 justify-center">
                      VIEW DEMONSTRATION
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Progress Section */}
        <section className="classic-bg-dark border-t-4 border-gray-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <h2 className="text-3xl font-bold classic-title mb-8 uppercase">
                Academic Progress
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="old-school-card p-6 text-center">
                  <div className="text-5xl font-bold classic-title mb-2">
                    {filteredLetters.length}
                  </div>
                  <div className="classic-subtitle uppercase tracking-wide">Letters Available</div>
                </div>
                <div className="old-school-card p-6 text-center">
                  <div className="text-5xl font-bold classic-title mb-2">{completedCount}</div>
                  <div className="classic-subtitle uppercase tracking-wide">Completed</div>
                </div>
                <div className="old-school-card p-6 text-center">
                  <div className="text-5xl font-bold classic-title mb-2">26</div>
                  <div className="classic-subtitle uppercase tracking-wide">Total ISL Letters</div>
                </div>
              </div>
              <div className="mt-8 w-full flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  className="btn-classic-secondary w-full sm:w-auto"
                  onClick={() => {
                    // mark all as complete
                    try {
                      const all = islAlphabet.map(l => l.id);
                      window.localStorage.setItem('isl_progress_v1', JSON.stringify({ completedLetters: all, updatedAt: Date.now() }));
                      setCompletedCount(all.length);
                    } catch {}
                  }}
                >
                  MARK ALL COMPLETE
                </button>
                <button
                  className="btn-classic-secondary w-full sm:w-auto"
                  onClick={() => {
                    try {
                      window.localStorage.setItem('isl_progress_v1', JSON.stringify({ completedLetters: [], updatedAt: Date.now() }));
                      setCompletedCount(0);
                    } catch {}
                  }}
                >
                  RESET PROGRESS
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Exam Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 classic-bg-paper">
          <div className="max-w-4xl mx-auto text-center">
            <div className="old-school-card p-12">
              <div className="w-24 h-24 bg-gray-800 border-4 border-gray-600 flex items-center justify-center mx-auto mb-8">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-4xl font-bold classic-title mb-6 uppercase">
                Examination Preparation
              </h2>
              <div className="w-32 h-2 bg-gray-800 mx-auto mb-8"></div>
              <div className="border-l-4 border-gray-800 pl-8 mb-10">
                <p className="text-xl classic-subtitle leading-relaxed italic">
                  "Assess your knowledge through our comprehensive examination system featuring
                  five distinct test sets, each containing ten carefully crafted questions powered
                  by advanced artificial intelligence technology."
                </p>
              </div>
              <Link href="/test-sets">
                <button className="btn-classic-primary inline-flex items-center">
                  PROCEED TO EXAMINATIONS
                  <svg className="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Detailed Modal */}
        {showModal && selectedLetter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="classic-bg old-school-card max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 classic-primary-bg border-4 border-gray-800 flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">{selectedLetter.letter}</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold high-contrast-text">{selectedLetter.letter}</h2>
                      <p className="text-gray-600 wrap-anywhere">{selectedLetter.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Side-by-side: Hand Image (left) and Demonstration Video (right) */}
                <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="classic-bg old-school-card p-6">
                    <h3 className="text-xl font-bold classic-title mb-4 uppercase">Hand Position</h3>
                    <div className="flex justify-center">
                      <img
                        src={selectedLetter.handImage}
                        alt={`Letter ${selectedLetter.letter} hand position`}
                        className="w-64 h-64 object-contain border-4 border-gray-800 sign-language-image"
                        onLoad={(e) => {
                          e.currentTarget.style.opacity = '1';
                        }}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallbackDiv = document.createElement('div');
                          fallbackDiv.className = 'w-64 h-64 classic-primary-bg border-4 border-gray-800 flex items-center justify-center';
                          fallbackDiv.innerHTML = `
                            <div class="text-center text-white">
                              <div class="text-6xl font-bold mb-2">${selectedLetter.letter}</div>
                              <div class="text-sm">Hand Position</div>
                            </div>
                          `;
                          e.currentTarget.parentNode?.appendChild(fallbackDiv);
                        }}
                        style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
                        loading="eager"
                        decoding="async"
                      />
                    </div>
                  </div>
                  <div className="classic-bg old-school-card p-6">
                    <h3 className="text-xl font-bold classic-title mb-4 uppercase">Demonstration Video</h3>
                    {videoError ? (
                      <div className="text-center">
                        <div className="w-full border-4 border-yellow-700 bg-yellow-100 text-yellow-900 p-4">
                          <div className="flex items-start gap-3">
                            <svg className="w-6 h-6 text-yellow-800 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                            <p className="text-sm">
                              Demo video not available yet for letter {selectedLetter.letter}. Place a file at
                              <span className="font-semibold"> /public/videos/letters/{selectedLetter.letter.toUpperCase()}.mp4</span> to enable playback.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-center">
                        <video
                          key={selectedLetter.id}
                          className="w-full max-w-2xl border-4 border-gray-800 classic-video-player"
                          controls
                          preload="metadata"
                          poster={selectedLetter.handImage}
                          playsInline
                          disablePictureInPicture
                          controlsList="nodownload noplaybackrate noremoteplayback"
                          disableRemotePlayback
                          onError={() => setVideoError(true)}
                          onEnded={() => {
                            // Auto-mark complete on successful watch
                            if (!isLetterCompleted(selectedLetter.id)) {
                              markLetter(selectedLetter.id, true);
                              setCompletedCount((prev) => prev + 1);
                            }
                          }}
                        >
                          <source src={`/videos/letters/${selectedLetter.letter.toUpperCase()}.mp4`} type="video/mp4" />
                          <source src={`/videos/letters/${selectedLetter.letter.toUpperCase()}.webm`} type="video/webm" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6">
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    {selectedLetter && isLetterCompleted(selectedLetter.id) ? (
                      <span className="inline-flex items-center text-xs font-semibold px-2 py-1 border-2 border-green-700 bg-green-200 text-green-900">MARKED AS COMPLETED</span>
                    ) : (
                      <span className="inline-flex items-center text-xs font-semibold px-2 py-1 border-2 border-yellow-700 bg-yellow-200 text-yellow-900">NOT COMPLETED</span>
                    )}
                  </div>
                  <button
                    className="btn-classic-primary"
                    onClick={() => {
                      if (!selectedLetter) return;
                      const nowCompleted = toggleLetter(selectedLetter.id);
                      setCompletedCount((prev) => prev + (nowCompleted ? 1 : -1));
                    }}
                  >
                    {selectedLetter && isLetterCompleted(selectedLetter.id) ? 'UNDO COMPLETE' : 'MARK COMPLETE'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </>
  );
} 