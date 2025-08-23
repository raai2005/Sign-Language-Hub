import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface Word {
  id: string;
  word: string;
  category: string;
  description: string;
  islSign: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  videoPath?: string;
}

interface Sentence {
  id: string;
  sentence: string;
  category: string;
  translation: string;
  islSign: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export default function Intermediate() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('words');
  const [showAdminButton, setShowAdminButton] = useState(false);

  // ISL Words Data
  const islWords: Word[] = [
    // Basic Words
    { id: '1', word: 'Hello', category: 'Greetings', description: 'Basic greeting in ISL', islSign: 'Wave hand from forehead forward', difficulty: 'beginner' },
    { id: '2', word: 'Thank You', category: 'Greetings', description: 'Expression of gratitude', islSign: 'Flat hand from chin forward', difficulty: 'beginner' },
    { id: '3', word: 'Please', category: 'Greetings', description: 'Polite request', islSign: 'Flat hand in circular motion on chest', difficulty: 'beginner' },
    { id: '4', word: 'Sorry', category: 'Greetings', description: 'Apology expression', islSign: 'Fist making circular motion on chest', difficulty: 'beginner' },

    // Family
    { id: '5', word: 'Mother', category: 'Family', description: 'Female parent', islSign: 'Thumb touching chin, other fingers closed', difficulty: 'beginner' },
    { id: '6', word: 'Father', category: 'Family', description: 'Male parent', islSign: 'Thumb touching forehead, other fingers closed', difficulty: 'beginner' },
    { id: '7', word: 'Sister', category: 'Family', description: 'Female sibling', islSign: 'Index finger touching chin, then side of face', difficulty: 'intermediate' },
    { id: '8', word: 'Brother', category: 'Family', description: 'Male sibling', islSign: 'Index finger touching forehead, then side of face', difficulty: 'intermediate' },

    // Colors
    { id: '9', word: 'Red', category: 'Colors', description: 'Color red', islSign: 'Index finger touching lips, then pointing down', difficulty: 'beginner' },
    { id: '10', word: 'Blue', category: 'Colors', description: 'Color blue', islSign: 'Index finger pointing to side of face', difficulty: 'beginner' },
    { id: '11', word: 'Green', category: 'Colors', description: 'Color green', islSign: 'Index finger touching chin, then pointing down', difficulty: 'beginner' },
    { id: '12', word: 'Yellow', category: 'Colors', description: 'Color yellow', islSign: 'Index finger touching side of face, then pointing down', difficulty: 'beginner' },

    // Numbers
    { id: '13', word: 'One', category: 'Numbers', description: 'Number 1', islSign: 'Index finger pointing up', difficulty: 'beginner' },
    { id: '14', word: 'Two', category: 'Numbers', description: 'Number 2', islSign: 'Index and middle finger pointing up', difficulty: 'beginner' },
    { id: '15', word: 'Three', category: 'Numbers', description: 'Number 3', islSign: 'Index, middle, and ring finger pointing up', difficulty: 'beginner' },
    { id: '16', word: 'Ten', category: 'Numbers', description: 'Number 10', islSign: 'Thumb pointing up, other fingers closed', difficulty: 'intermediate' },

    // Emotions
    { id: '17', word: 'Happy', category: 'Emotions', description: 'Feeling of joy', islSign: 'Both hands moving up from chest with smile', difficulty: 'intermediate' },
    { id: '18', word: 'Sad', category: 'Emotions', description: 'Feeling of sorrow', islSign: 'Hands moving down from face', difficulty: 'intermediate' },
    { id: '19', word: 'Angry', category: 'Emotions', description: 'Feeling of anger', islSign: 'Fist shaking in front of face', difficulty: 'intermediate' },
    { id: '20', word: 'Love', category: 'Emotions', description: 'Feeling of love', islSign: 'Both hands crossed over heart', difficulty: 'intermediate' },

    // Food
    { id: '21', word: 'Food', category: 'Food', description: 'Something to eat', islSign: 'Fingers touching mouth', difficulty: 'beginner' },
    { id: '22', word: 'Water', category: 'Food', description: 'Drinking water', islSign: 'Index finger touching mouth, then pointing down', difficulty: 'beginner' },
    { id: '23', word: 'Rice', category: 'Food', description: 'Grain food', islSign: 'Fingers touching mouth, then moving in circular motion', difficulty: 'advanced' },
    { id: '24', word: 'Bread', category: 'Food', description: 'Baked food', islSign: 'Hands making cutting motion', difficulty: 'advanced' },
  ];

  // ISL Sentences Data
  const islSentences: Sentence[] = [
    // Basic Sentences
    { id: '1', sentence: 'Hello, how are you?', category: 'Greetings', translation: 'Namaste, aap kaise hain?', islSign: 'Wave + question gesture + point to person', difficulty: 'beginner' },
    { id: '2', sentence: 'Thank you very much', category: 'Greetings', translation: 'Bahut dhanyavaad', islSign: 'Thank you sign + emphasis gesture', difficulty: 'beginner' },
    { id: '3', sentence: 'What is your name?', category: 'Questions', translation: 'Aapka naam kya hai?', islSign: 'Question gesture + name sign + point to person', difficulty: 'intermediate' },
    { id: '4', sentence: 'My name is...', category: 'Questions', translation: 'Mera naam hai...', islSign: 'Point to self + name sign + fingerspell', difficulty: 'intermediate' },

    // Family Sentences
    { id: '5', sentence: 'This is my mother', category: 'Family', translation: 'Yeh meri maa hai', islSign: 'Point to person + mother sign + point to self', difficulty: 'intermediate' },
    { id: '6', sentence: 'I have a brother', category: 'Family', translation: 'Mera ek bhai hai', islSign: 'Point to self + have sign + brother sign', difficulty: 'intermediate' },
    { id: '7', sentence: 'Where is your family?', category: 'Family', translation: 'Aapka parivar kahan hai?', islSign: 'Question gesture + family sign + point to person', difficulty: 'advanced' },

    // Daily Life
    { id: '8', sentence: 'I want to eat', category: 'Daily Life', translation: 'Mujhe khana chahiye', islSign: 'Point to self + want sign + eat sign', difficulty: 'intermediate' },
    { id: '9', sentence: 'I am thirsty', category: 'Daily Life', translation: 'Mujhe pyaas lagi hai', islSign: 'Point to self + thirsty sign', difficulty: 'intermediate' },
    { id: '10', sentence: 'What time is it?', category: 'Daily Life', translation: 'Kya samay hua hai?', islSign: 'Question gesture + time sign', difficulty: 'advanced' },

    // Emotions
    { id: '11', sentence: 'I am happy', category: 'Emotions', translation: 'Main khush hun', islSign: 'Point to self + happy sign', difficulty: 'intermediate' },
    { id: '12', sentence: 'I love you', category: 'Emotions', translation: 'Main aapse pyaar karta hun', islSign: 'Point to self + love sign + point to person', difficulty: 'intermediate' },
    { id: '13', sentence: 'I am sorry', category: 'Emotions', translation: 'Mujhe maaf kijiye', islSign: 'Point to self + sorry sign', difficulty: 'beginner' },
  ];

  const categories = [
    { id: 'all', name: 'All Categories', count: islWords.length },
    { id: 'Greetings', name: 'Greetings', count: islWords.filter(w => w.category === 'Greetings').length },
    { id: 'Family', name: 'Family', count: islWords.filter(w => w.category === 'Family').length },
    { id: 'Colors', name: 'Colors', count: islWords.filter(w => w.category === 'Colors').length },
    { id: 'Numbers', name: 'Numbers', count: islWords.filter(w => w.category === 'Numbers').length },
    { id: 'Emotions', name: 'Emotions', count: islWords.filter(w => w.category === 'Emotions').length },
    { id: 'Food', name: 'Food', count: islWords.filter(w => w.category === 'Food').length },
  ];

  const difficulties = [
    { id: 'all', name: 'All Levels', color: 'gray' },
    { id: 'beginner', name: 'Beginner', color: 'green' },
    { id: 'intermediate', name: 'Intermediate', color: 'orange' },
    { id: 'advanced', name: 'Advanced', color: 'red' },
  ];

  // Admin access keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ctrl + Shift + A to show admin button
      if (event.ctrlKey && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        setShowAdminButton(true);
        // Hide admin button after 5 seconds
        setTimeout(() => setShowAdminButton(false), 5000);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);

  const getFilteredContent = (): (Word | Sentence)[] => {
    const content: (Word | Sentence)[] = activeTab === 'words' ? islWords : islSentences;

    let filtered = content;

    if (searchTerm) {
      filtered = content.filter(item => {
        if (activeTab === 'words') {
          const wordItem = item as Word;
          return wordItem.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
            wordItem.description.toLowerCase().includes(searchTerm.toLowerCase());
        } else {
          const sentenceItem = item as Sentence;
          return sentenceItem.sentence.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sentenceItem.translation.toLowerCase().includes(searchTerm.toLowerCase());
        }
      });
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(item => item.difficulty === selectedDifficulty);
    }

    // Sort by difficulty level: beginner -> intermediate -> advanced
    const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3 };
    filtered.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);

    return filtered;
  };

  const filteredContent = getFilteredContent();

  return (
    <>
      <Head>
        <title>Intermediate ISL Learning - Indian Sign Language</title>
        <meta name="description" content="Learn intermediate Indian Sign Language including words, sentences, and advanced concepts." />
      </Head>

      <div className="min-h-screen dynamic-bg">
        <Navbar />

        {/* Hidden Admin Button */}
        {showAdminButton && (
          <div className="fixed top-20 right-4 z-50">
            <Link
              href="/admin"
              className="btn-classic-primary flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>ADMIN PANEL</span>
            </Link>
          </div>
        )}

        {/* Header */}
        <section className="classic-bg old-school-card relative overflow-hidden">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 classic-primary-bg border-4 border-gray-800 mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h1 className="classic-title text-4xl md:text-5xl font-bold mb-4">
                INTERMEDIATE ISL LEARNING
              </h1>
              <p className="classic-subtitle text-lg max-w-2xl mx-auto leading-relaxed">
                Master words, sentences, and advanced concepts in Indian Sign Language.
                Build your vocabulary and learn to communicate effectively.
              </p>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <section className="high-contrast-bg border-b border-white/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setActiveTab('words')}
                className={`px-6 py-3 font-semibold old-school-card ${activeTab === 'words'
                  ? 'btn-classic-primary'
                  : 'classic-text hover:classic-primary-bg hover:text-white'
                  }`}
              >
                WORDS ({islWords.length})
              </button>
              <button
                onClick={() => setActiveTab('sentences')}
                className={`px-6 py-3 font-semibold old-school-card ${activeTab === 'sentences'
                  ? 'btn-classic-primary'
                  : 'classic-text hover:classic-primary-bg hover:text-white'
                  }`}
              >
                SENTENCES ({islSentences.length})
              </button>
            </div>
          </div>
        </section>

        {/* Search and Filters */}
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
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-12 pr-4 py-4 border-4 border-gray-800 leading-5 classic-bg placeholder-gray-600 text-lg classic-text"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap justify-center gap-3 mb-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 text-sm font-semibold old-school-card ${selectedCategory === category.id
                    ? 'btn-classic-primary'
                    : 'classic-text hover:classic-primary-bg hover:text-white'
                    }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {difficulties.map((difficulty) => (
                <button
                  key={difficulty.id}
                  onClick={() => setSelectedDifficulty(difficulty.id)}
                  className={`px-4 py-2 text-sm font-semibold old-school-card ${selectedDifficulty === difficulty.id
                    ? 'btn-classic-primary'
                    : 'classic-text hover:classic-primary-bg hover:text-white'
                    }`}
                >
                  {difficulty.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Content Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {filteredContent.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
              </svg>
              <h3 className="mt-2 text-sm font-medium high-contrast-text">No {activeTab} found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search terms or filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContent.map((item) => (
                <div
                  key={item.id}
                  className="classic-bg old-school-card p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold classic-title mb-2">
                        {activeTab === 'words' ? (item as Word).word : (item as Sentence).sentence}
                      </h3>
                      {activeTab === 'sentences' && (
                        <p className="text-sm classic-subtitle mb-2 italic">
                          "{(item as Sentence).translation}"
                        </p>
                      )}
                    </div>
                    <div className={`px-2 py-1 border-2 border-gray-800 text-xs font-semibold ${item.difficulty === 'beginner' ? 'bg-gray-200 text-gray-800' :
                      item.difficulty === 'intermediate' ? 'bg-gray-300 text-gray-800' :
                        'bg-gray-400 text-gray-800'
                      }`}>
                      {item.difficulty.toUpperCase()}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm classic-subtitle mb-2">
                      {activeTab === 'words' ? (item as Word).description : `Translation: ${(item as Sentence).translation}`}
                    </p>
                    <p className="text-xs classic-text font-medium">
                      ISL Sign: {item.islSign}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs classic-text border-2 border-gray-800 px-2 py-1">
                      {item.category.toUpperCase()}
                    </span>
                    <button className="classic-text hover:classic-primary-bg hover:text-white text-sm font-medium px-2 py-1 border-2 border-gray-800">
                      LEARN MORE →
                    </button>
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
                Your Learning Progress
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {filteredContent.length}
                  </div>
                  <div className="text-sm text-gray-500">Available {activeTab}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">0</div>
                  <div className="text-sm text-gray-500">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {activeTab === 'words' ? islWords.length : islSentences.length}
                  </div>
                  <div className="text-sm text-gray-500">Total {activeTab}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {Math.round((filteredContent.length / (activeTab === 'words' ? islWords.length : islSentences.length)) * 100)}%
                  </div>
                  <div className="text-sm text-gray-500">Filtered</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
} 