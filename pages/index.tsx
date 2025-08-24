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

      <div className="min-h-screen classic-bg">
        <Navbar />
        
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8">
          {/* Classic decorative border */}
          <div className="absolute top-10 left-10 right-10 h-2 bg-repeat-x opacity-20" 
               style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width="20" height="8" viewBox="0 0 20 8" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 4l4-4 4 4 4-4 4 4 4-4v4H0z" fill="%23666"/%3E%3C/svg%3E")'}}></div>
          <div className="absolute bottom-10 left-10 right-10 h-2 bg-repeat-x opacity-20" 
               style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width="20" height="8" viewBox="0 0 20 8" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 4l4-4 4 4 4-4 4 4 4-4v4H0z" fill="%23666"/%3E%3C/svg%3E")'}}></div>
          
          <div className="relative max-w-6xl mx-auto">
            <div className="text-center">
              <div className="mb-12">
                <div className="inline-block p-4 bg-white border-4 border-gray-800 mb-8 old-school-card">
                  <svg className="w-16 h-16 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h1 className="text-5xl md:text-7xl font-bold classic-title mb-8">
                  LEARN INDIAN SIGN LANGUAGE
                  <div className="mt-4 text-3xl md:text-4xl text-gray-700 classic-subtitle">
                    The Traditional Way
                  </div>
                </h1>
              </div>
              <div className="max-w-4xl mx-auto mb-12">
                <p className="text-xl classic-subtitle text-center leading-relaxed border-l-4 border-gray-800 pl-6 italic wrap-anywhere">
                  "Master Indian Sign Language (ISL) through our time-tested, methodical approach. 
                  Designed for beginners and advanced learners who appreciate structured, comprehensive education 
                  in the art of sign language communication."
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-8 justify-center">
                <button className="btn-classic-primary inline-flex items-center justify-center">
                  BEGIN YOUR JOURNEY
                  <svg className="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
                <button className="btn-classic-secondary inline-flex items-center justify-center">
                  VIEW CURRICULUM
                  <svg className="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 classic-bg-paper relative">
          {/* Classic ornamental borders */}
          <div className="absolute top-0 left-0 w-full h-4 bg-gray-800"></div>
          <div className="absolute bottom-0 left-0 w-full h-4 bg-gray-800"></div>
          
          <div className="relative max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold classic-title mb-6 border-b-4 border-gray-800 pb-4 inline-block">
                WHY CHOOSE OUR ACADEMY?
              </h2>
              <p className="text-xl classic-subtitle max-w-3xl mx-auto mt-8">
                Established educational excellence in Indian Sign Language instruction, 
                following traditional teaching methodologies proven over decades.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <div className="old-school-card p-8 text-center">
                <div className="w-24 h-24 bg-gray-800 border-4 border-gray-600 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold classic-title mb-4 uppercase letter-spacing-wide">
                  Professional Video Library
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Comprehensive video demonstrations for every letter and essential vocabulary 
                  in Indian Sign Language, filmed by certified instructors.
                </p>
              </div>

              <div className="old-school-card p-8 text-center">
                <div className="w-24 h-24 bg-gray-800 border-4 border-gray-600 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold classic-title mb-4 uppercase letter-spacing-wide">
                  Structured Curriculum
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Time-tested progressive learning methodology with detailed instructions 
                  and systematic skill development for mastering ISL fundamentals.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 classic-bg-dark relative">
          {/* Classic frame decoration */}
          <div className="absolute inset-4 border-4 border-gray-800 opacity-30"></div>
          <div className="absolute inset-8 border-2 border-gray-600 opacity-20"></div>
          
          <div className="relative max-w-4xl mx-auto text-center">
            <div className="bg-white p-12 old-school-card">
              <h2 className="text-4xl md:text-5xl font-bold classic-title mb-6 uppercase">
                ENROLL TODAY
              </h2>
              <div className="w-24 h-1 bg-gray-800 mx-auto mb-8"></div>
              <p className="text-xl classic-subtitle mb-10 max-w-2xl mx-auto leading-relaxed">
                Join our distinguished academy and become part of a tradition of excellence 
                in Indian Sign Language education. Your journey to fluent communication begins here.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/learn">
                  <button className="btn-classic-primary">
                    START LEARNING NOW
                    <svg className="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </Link>
                <button className="btn-classic-secondary">
                  CONTACT ADMISSIONS
                  <svg className="ml-3 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
} 