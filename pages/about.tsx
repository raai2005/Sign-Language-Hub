import Head from 'next/head';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function About() {
  return (
    <>
      <Head>
        <title>About - Sign Language Learning</title>
        <meta name="description" content="Learn about our mission to make sign language accessible to everyone." />
      </Head>

      <div className="min-h-screen classic-bg">
        <Navbar />

        {/* Hero Section */}
        <section className="classic-bg-paper relative border-b-4 border-gray-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <div className="inline-block p-4 bg-white border-4 border-gray-800 mb-8 old-school-card">
                <svg className="w-12 h-12 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold classic-title mb-6 uppercase">
                About Our Academy
              </h1>
              <div className="w-32 h-2 bg-gray-800 mx-auto mb-8"></div>
              <div className="max-w-4xl mx-auto border-l-4 border-gray-800 pl-8">
                <p className="text-xl classic-subtitle leading-relaxed italic">
                  "Our mission is to make Indian Sign Language (ISL) accessible to everyone
                  through traditional teaching methods, comprehensive instruction, and
                  time-tested educational principles."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 classic-bg-dark">
          <div className="max-w-6xl mx-auto">
            <div className="old-school-card bg-white p-8">
              <h2 className="text-4xl font-bold classic-title mb-8 uppercase text-center">Our Academic Mission</h2>
              <div className="w-24 h-2 bg-gray-800 mx-auto mb-8"></div>
              <div className="border-l-4 border-gray-800 pl-6">
                <p className="text-lg classic-subtitle mb-6 leading-relaxed italic">
                  We believe that communication is a fundamental human right. Our academy
                  is founded upon the principle that sign language education should be
                  methodical, comprehensive, and accessible to learners of all backgrounds.
                </p>
                <p className="text-lg classic-subtitle leading-relaxed italic">
                  Whether you are a novice student or seeking to refine your existing
                  proficiency, our traditional educational system provides the structured
                  approach necessary to master Indian Sign Language through proven pedagogical methods.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 classic-bg-paper">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div className="w-24 h-24 bg-gray-800 border-4 border-gray-600 flex items-center justify-center mx-auto mb-8">
                <span className="text-white font-bold text-lg">ISL</span>
              </div>
              <h2 className="text-4xl font-bold classic-title uppercase mb-6">
                Educational Offerings
              </h2>
              <div className="w-32 h-2 bg-gray-800 mx-auto mb-8"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="old-school-card bg-white p-8 text-center">
                <div className="w-16 h-16 bg-gray-800 border-4 border-gray-600 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold classic-title mb-4 uppercase">Visual Demonstrations</h3>
                <p className="classic-subtitle italic">
                  Comprehensive visual presentations demonstrating proper hand formations and techniques for each letter in ISL.
                </p>
              </div>

              <div className="old-school-card bg-white p-8 text-center">
                <div className="w-16 h-16 bg-gray-800 border-4 border-gray-600 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold classic-title mb-4 uppercase">Methodical Instruction</h3>
                <p className="classic-subtitle italic">
                  Detailed step-by-step guidance following traditional educational principles for mastering each sign formation.
                </p>
              </div>

              <div className="old-school-card bg-white p-8 text-center">
                <div className="w-16 h-16 bg-gray-800 border-4 border-gray-600 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold classic-title mb-4 uppercase">Academic Assessment</h3>
                <p className="classic-subtitle italic">
                  Systematic evaluation of student progress through structured examinations and comprehensive feedback.
                </p>
              </div>

              <div className="old-school-card bg-white p-8 text-center">
                <div className="w-16 h-16 bg-gray-800 border-4 border-gray-600 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold classic-title mb-4 uppercase">Scholarly Community</h3>
                <p className="classic-subtitle italic">
                  Engagement with fellow students and instructors in a structured academic environment promoting excellence.
                </p>
              </div>

              <div className="old-school-card bg-white p-8 text-center">
                <div className="w-16 h-16 bg-gray-800 border-4 border-gray-600 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold classic-title mb-4 uppercase">Secure Institution</h3>
                <p className="classic-subtitle italic">
                  Your academic records and educational data are safeguarded with the highest standards of institutional security.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 classic-bg-dark">
          <div className="max-w-6xl mx-auto">
            <div className="old-school-card bg-white p-8">
              <h2 className="text-4xl font-bold classic-title mb-8 uppercase text-center">Our Faculty</h2>
              <div className="w-24 h-2 bg-gray-800 mx-auto mb-8"></div>
              <div className="border-l-4 border-gray-800 pl-6">
                <p className="text-lg classic-subtitle mb-6 leading-relaxed italic">
                  Our faculty consists of experienced educators, sign language experts, and dedicated
                  professionals who are committed to the advancement of ISL education through
                  traditional academic excellence.
                </p>
                <p className="text-lg classic-subtitle leading-relaxed italic">
                  We collaborate closely with the deaf community and certified ISL instructors to ensure
                  our curriculum maintains the highest standards of accuracy, cultural sensitivity, and pedagogical effectiveness.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 classic-bg-paper border-t-4 border-gray-800">
          <div className="max-w-6xl mx-auto text-center">
            <div className="w-24 h-24 bg-gray-800 border-4 border-gray-600 flex items-center justify-center mx-auto mb-8">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-4xl font-bold classic-title mb-6 uppercase">Academic Correspondence</h2>
            <div className="w-32 h-2 bg-gray-800 mx-auto mb-8"></div>
            <div className="max-w-4xl mx-auto border-l-4 border-gray-800 pl-8 mb-12">
              <p className="text-lg classic-subtitle leading-relaxed italic">
                We welcome inquiries from prospective students, academic institutions, and fellow educators.
                Our faculty is available to address questions regarding our curriculum and educational methodology.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <a
                href="mailto:faculty@islacademy.edu"
                className="btn-classic-primary inline-flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                CONTACT FACULTY
              </a>
              <a
                href="/learn"
                className="btn-classic-secondary inline-flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                BEGIN STUDIES
              </a>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
} 