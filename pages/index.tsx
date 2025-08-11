import Head from 'next/head';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <>
      <Head>
        <title>Indian Sign Language Learning - Learn ISL Online</title>
        <meta name="description" content="Learn Indian Sign Language (ISL) through interactive videos and quizzes. Perfect for beginners and those looking to improve their signing skills in India." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen dynamic-bg">
        <Navbar />
        
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Enhanced Background decoration with Indian colors */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-orange-200 to-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-soft"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-green-200 to-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-soft" style={{animationDelay: '1s'}}></div>
            <div className="absolute top-40 left-40 w-60 h-60 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-soft" style={{animationDelay: '2s'}}></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto">
            <div className="text-center">
              <div className="mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl mb-6 float card-3d shadow-strong">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold high-contrast-text mb-6 animate-fade-in">
                  Learn Indian Sign Language
                  <span className="block text-gradient bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    Made Easy
                  </span>
                </h1>
              </div>
              <p className="text-xl high-contrast-text mb-8 max-w-3xl mx-auto animate-slide-up">
                Master Indian Sign Language (ISL) through interactive videos, 
                step-by-step instructions. Perfect for beginners 
                and those looking to improve their signing skills in India.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center animate-slide-up">
                <Link 
                  href="/learn"
                  className="btn-primary inline-flex items-center justify-center group focus-ring"
                >
                  Start Learning A-Z
                  <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>

              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 high-contrast-bg relative overflow-hidden">
          {/* Enhanced Background decoration */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-50/40 to-red-50/40"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold high-contrast-text mb-4">
                Why Choose Our ISL Platform?
              </h2>
              <p className="text-lg high-contrast-text max-w-2xl mx-auto">
                Our comprehensive learning platform makes Indian Sign Language accessible to everyone across India.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-center p-8 bg-white/90 backdrop-blur-md rounded-2xl shadow-soft hover:shadow-strong transition-all duration-500 transform hover:-translate-y-2 card-3d">
                <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-strong">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold high-contrast-text mb-4">ISL Video Tutorials</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  High-quality video demonstrations for every letter and common word in Indian Sign Language.
                </p>
              </div>



              <div className="text-center p-8 bg-white/90 backdrop-blur-md rounded-2xl shadow-soft hover:shadow-strong transition-all duration-500 transform hover:-translate-y-2 card-3d">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-strong">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold high-contrast-text mb-4">Step-by-Step Guides</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  Detailed descriptions and instructions for perfecting each ISL sign.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 gradient-bg relative overflow-hidden">
          {/* Enhanced Background decoration */}
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse-soft"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse-soft" style={{animationDelay: '1s'}}></div>
          </div>
          
          <div className="relative max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Start Your ISL Journey?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Join thousands of learners who have already mastered Indian Sign Language with our platform.
            </p>
            <Link 
              href="/learn"
              className="bg-white/95 backdrop-blur-md text-orange-600 hover:bg-white font-bold py-4 px-8 rounded-xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-1 inline-flex items-center shadow-strong focus-ring"
            >
              Begin Learning Now
              <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
} 