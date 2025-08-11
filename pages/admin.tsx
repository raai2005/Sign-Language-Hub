import { useState, useEffect } from 'react';
import Head from 'next/head';
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

export default function Admin() {
  const [activeTab, setActiveTab] = useState('words');
  const [words, setWords] = useState<Word[]>([]);
  const [sentences, setSentences] = useState<Sentence[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Form states for adding new content
  const [newWord, setNewWord] = useState({
    word: '',
    category: '',
    description: '',
    islSign: '',
    difficulty: 'beginner' as const,
    videoPath: ''
  });

  const [newSentence, setNewSentence] = useState({
    sentence: '',
    category: '',
    translation: '',
    islSign: '',
    difficulty: 'beginner' as const
  });

  const categories = [
    'Greetings', 'Family', 'Colors', 'Numbers', 'Emotions', 'Food', 
    'Daily Life', 'Questions', 'Weather', 'Transport', 'Education', 'Work'
  ];

  const difficulties = ['beginner', 'intermediate', 'advanced'];

  // Sample data (in real app, this would come from a database)
  const sampleWords: Word[] = [
    { id: '1', word: 'Hello', category: 'Greetings', description: 'Basic greeting in ISL', islSign: 'Wave hand from forehead forward', difficulty: 'beginner' },
    { id: '2', word: 'Thank You', category: 'Greetings', description: 'Expression of gratitude', islSign: 'Flat hand from chin forward', difficulty: 'beginner' },
  ];

  const sampleSentences: Sentence[] = [
    { id: '1', sentence: 'Hello, how are you?', category: 'Greetings', translation: 'Namaste, aap kaise hain?', islSign: 'Wave + question gesture + point to person', difficulty: 'beginner' },
    { id: '2', sentence: 'Thank you very much', category: 'Greetings', translation: 'Bahut dhanyavaad', islSign: 'Thank you sign + emphasis gesture', difficulty: 'beginner' },
  ];

  useEffect(() => {
    // Load sample data
    setWords(sampleWords);
    setSentences(sampleSentences);
  }, []);

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    const newWordItem: Word = {
      id: Date.now().toString(),
      ...newWord
    };
    setWords([...words, newWordItem]);
    setNewWord({
      word: '',
      category: '',
      description: '',
      islSign: '',
      difficulty: 'beginner',
      videoPath: ''
    });
  };

  const handleAddSentence = (e: React.FormEvent) => {
    e.preventDefault();
    const newSentenceItem: Sentence = {
      id: Date.now().toString(),
      ...newSentence
    };
    setSentences([...sentences, newSentenceItem]);
    setNewSentence({
      sentence: '',
      category: '',
      translation: '',
      islSign: '',
      difficulty: 'beginner'
    });
  };

  const handleEdit = (item: any) => {
    setIsEditing(true);
    setEditingItem(item);
    if (activeTab === 'words') {
      setNewWord({
        word: item.word,
        category: item.category,
        description: item.description,
        islSign: item.islSign,
        difficulty: item.difficulty,
        videoPath: item.videoPath || ''
      });
    } else {
      setNewSentence({
        sentence: item.sentence,
        category: item.category,
        translation: item.translation,
        islSign: item.islSign,
        difficulty: item.difficulty
      });
    }
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'words') {
      const updatedWords = words.map(word => 
        word.id === editingItem.id ? { ...word, ...newWord } : word
      );
      setWords(updatedWords);
    } else {
      const updatedSentences = sentences.map(sentence => 
        sentence.id === editingItem.id ? { ...sentence, ...newSentence } : sentence
      );
      setSentences(updatedSentences);
    }
    setIsEditing(false);
    setEditingItem(null);
    setNewWord({
      word: '',
      category: '',
      description: '',
      islSign: '',
      difficulty: 'beginner',
      videoPath: ''
    });
    setNewSentence({
      sentence: '',
      category: '',
      translation: '',
      islSign: '',
      difficulty: 'beginner'
    });
  };

  const handleDelete = (id: string) => {
    if (activeTab === 'words') {
      setWords(words.filter(word => word.id !== id));
    } else {
      setSentences(sentences.filter(sentence => sentence.id !== id));
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingItem(null);
    setNewWord({
      word: '',
      category: '',
      description: '',
      islSign: '',
      difficulty: 'beginner',
      videoPath: ''
    });
    setNewSentence({
      sentence: '',
      category: '',
      translation: '',
      islSign: '',
      difficulty: 'beginner'
    });
  };

  return (
    <>
      <Head>
        <title>Admin Panel - ISL Content Management</title>
        <meta name="description" content="Admin panel for managing Indian Sign Language content" />
      </Head>

      <div className="min-h-screen dynamic-bg">
        <Navbar />
        
        {/* Header */}
        <section className="high-contrast-bg shadow-strong relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-50/40 to-orange-50/40"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl mb-6 float card-3d shadow-strong">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold high-contrast-text mb-4">
                Admin Panel
              </h1>
              <p className="text-lg high-contrast-text max-w-2xl mx-auto leading-relaxed">
                Manage and update Indian Sign Language content including words, sentences, and learning materials.
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
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 nav-item-3d focus-ring ${
                  activeTab === 'words'
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-strong'
                    : 'high-contrast-text hover:text-red-600 hover:bg-white/20'
                }`}
              >
                Manage Words ({words.length})
              </button>
              <button
                onClick={() => setActiveTab('sentences')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 nav-item-3d focus-ring ${
                  activeTab === 'sentences'
                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-strong'
                    : 'high-contrast-text hover:text-red-600 hover:bg-white/20'
                }`}
              >
                Manage Sentences ({sentences.length})
              </button>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Add/Edit Form */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-strong p-6">
              <h2 className="text-2xl font-bold high-contrast-text mb-6">
                {isEditing ? `Edit ${activeTab === 'words' ? 'Word' : 'Sentence'}` : `Add New ${activeTab === 'words' ? 'Word' : 'Sentence'}`}
              </h2>
              
              <form onSubmit={isEditing ? handleUpdate : (activeTab === 'words' ? handleAddWord : handleAddSentence)} className="space-y-4">
                {activeTab === 'words' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium high-contrast-text mb-2">Word</label>
                      <input
                        type="text"
                        value={newWord.word}
                        onChange={(e) => setNewWord({...newWord, word: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium high-contrast-text mb-2">Category</label>
                      <select
                        value={newWord.category}
                        onChange={(e) => setNewWord({...newWord, category: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium high-contrast-text mb-2">Description</label>
                      <textarea
                        value={newWord.description}
                        onChange={(e) => setNewWord({...newWord, description: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        rows={3}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium high-contrast-text mb-2">ISL Sign Description</label>
                      <textarea
                        value={newWord.islSign}
                        onChange={(e) => setNewWord({...newWord, islSign: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        rows={3}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium high-contrast-text mb-2">Difficulty</label>
                      <select
                        value={newWord.difficulty}
                        onChange={(e) => setNewWord({...newWord, difficulty: e.target.value as any})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        required
                      >
                        {difficulties.map(diff => (
                          <option key={diff} value={diff}>{diff.charAt(0).toUpperCase() + diff.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium high-contrast-text mb-2">Video Path (Optional)</label>
                      <input
                        type="text"
                        value={newWord.videoPath}
                        onChange={(e) => setNewWord({...newWord, videoPath: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="/videos/hello.mp4"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium high-contrast-text mb-2">Sentence</label>
                      <input
                        type="text"
                        value={newSentence.sentence}
                        onChange={(e) => setNewSentence({...newSentence, sentence: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium high-contrast-text mb-2">Hindi Translation</label>
                      <input
                        type="text"
                        value={newSentence.translation}
                        onChange={(e) => setNewSentence({...newSentence, translation: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium high-contrast-text mb-2">Category</label>
                      <select
                        value={newSentence.category}
                        onChange={(e) => setNewSentence({...newSentence, category: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        required
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium high-contrast-text mb-2">ISL Sign Description</label>
                      <textarea
                        value={newSentence.islSign}
                        onChange={(e) => setNewSentence({...newSentence, islSign: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        rows={3}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium high-contrast-text mb-2">Difficulty</label>
                      <select
                        value={newSentence.difficulty}
                        onChange={(e) => setNewSentence({...newSentence, difficulty: e.target.value as any})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        required
                      >
                        {difficulties.map(diff => (
                          <option key={diff} value={diff}>{diff.charAt(0).toUpperCase() + diff.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}
                
                <div className="flex space-x-4 pt-4">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-6 py-2 rounded-lg hover:from-red-600 hover:to-orange-600 transition-all duration-300 focus-ring"
                  >
                    {isEditing ? 'Update' : 'Add'}
                  </button>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-all duration-300 focus-ring"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Content List */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-strong p-6">
              <h2 className="text-2xl font-bold high-contrast-text mb-6">
                Current {activeTab === 'words' ? 'Words' : 'Sentences'}
              </h2>
              
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {(activeTab === 'words' ? words : sentences).map((item) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold high-contrast-text">
                        {activeTab === 'words' ? item.word : item.sentence}
                      </h3>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      Category: {item.category}
                    </p>
                    <p className="text-sm text-gray-600 mb-1">
                      Difficulty: {item.difficulty}
                    </p>
                    {activeTab === 'sentences' && (
                      <p className="text-sm text-gray-600 mb-1 italic">
                        "{item.translation}"
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      {activeTab === 'words' ? item.description : item.islSign}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
} 