import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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
        <div className="min-h-screen dynamic-bg">
          <Navbar />
          <div className="flex items-center justify-center min-h-screen">
            <div className="loading-spinner"></div>
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

      <div className="min-h-screen dynamic-bg">
        <Navbar />
        
        {/* Header */}
        <section className="high-contrast-bg shadow-strong relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-50/40 to-red-50/40"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl mb-6 float card-3d shadow-strong">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold high-contrast-text mb-4">
                Learn ISL Alphabet
              </h1>
              <p className="text-lg high-contrast-text max-w-2xl mx-auto leading-relaxed">
                Master all 26 letters of the Indian Sign Language alphabet with 
                interactive learning and clear hand sign demonstrations.
              </p>
            </div>
          </div>
        </section>

        {/* Search and Filter */}
        <section className="high-contrast-bg border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="max-w-md mx-auto mb-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search letters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl leading-5 bg-white/90 backdrop-blur-md placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg shadow-soft transition-all duration-200"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 nav-item-3d focus-ring ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-strong'
                      : 'high-contrast-text hover:text-orange-600 hover:bg-white/20'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Letters Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {filteredLetters.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
              </svg>
              <h3 className="mt-2 text-sm font-medium high-contrast-text">No letters found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search terms.
              </p>
            </div>
          ) : (
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {filteredLetters.map((letter) => (
                                   <div
                    key={letter.id}
                    className="bg-white/95 rounded-2xl shadow-soft hover:shadow-strong transition-all duration-500 transform hover:-translate-y-2 card-3d p-6 cursor-pointer letter-card"
                    onClick={() => handleLetterClick(letter)}
                  >
                   <div className="text-center letter-card-content">
                     <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-strong">
                       <span className="text-2xl font-bold text-white">{letter.letter}</span>
                     </div>
                     <h3 className="text-xl font-bold high-contrast-text mb-2">{letter.letter}</h3>
                                                                 <div className="flex-grow">
                        <p className="text-sm text-gray-600 mb-0">{letter.description}</p>
                      </div>
                      <div className="letter-card-button">
                        <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold py-2 px-4 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-300 transform hover:scale-105 shadow-soft hover:shadow-strong">
                          Click to see hand gesture
                        </button>
                      </div>
                   </div>
                 </div>
               ))}
             </div>
          )}
        </section>

        {/* Progress Section */}
        <section className="high-contrast-bg border-t border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold high-contrast-text mb-4">
                Your Progress
              </h2>
              <div className="flex justify-center items-center space-x-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {filteredLetters.length}
                  </div>
                  <div className="text-sm text-gray-500">Letters Available</div>
                </div>
                <div className="text-gray-300">|</div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">0</div>
                  <div className="text-sm text-gray-500">Completed</div>
                </div>
                <div className="text-gray-300">|</div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">26</div>
                  <div className="text-sm text-gray-500">Total ISL Letters</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Exam Section */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 shadow-strong">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Test Yourself?
              </h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Take our AI-powered exam with 5 different question sets. 
                Each set contains 10 unique questions generated by Gemini AI!
              </p>
              <Link 
                href="/test-sets"
                className="bg-white/95 backdrop-blur-md text-orange-600 hover:bg-white font-bold py-4 px-8 rounded-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 inline-flex items-center shadow-strong focus-ring"
              >
                Ready to Test Yourself
                <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </section>

        {/* Detailed Modal */}
        {showModal && selectedLetter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-strong">
                      <span className="text-3xl font-bold text-white">{selectedLetter.letter}</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold high-contrast-text">{selectedLetter.letter}</h2>
                      <p className="text-gray-600">{selectedLetter.description}</p>
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

                {/* Main Hand Image */}
                <div className="mb-8 bg-white rounded-xl p-6 shadow-soft">
                  <div className="flex justify-center">
                    <img 
                      src={selectedLetter.handImage} 
                      alt={`Letter ${selectedLetter.letter} hand position`}
                      className="w-64 h-64 object-contain rounded-xl shadow-strong sign-language-image"
                      onLoad={(e) => {
                        // Image loaded successfully
                        e.currentTarget.style.opacity = '1';
                      }}
                      onError={(e) => {
                        // Fallback to a simple colored div if image fails to load
                        e.currentTarget.style.display = 'none';
                        const fallbackDiv = document.createElement('div');
                        fallbackDiv.className = 'w-64 h-64 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-strong flex items-center justify-center';
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
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </>
  );
} 