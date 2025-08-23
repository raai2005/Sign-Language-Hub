const Footer = () => {
  return (
    <footer className="bg-white border-t-4 border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Decorative top border */}
        <div className="flex justify-center mb-12">
          <div className="w-64 h-2 bg-gray-800"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gray-800 border-4 border-gray-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">ISL</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold classic-title uppercase">Indian Sign Language</span>
                <span className="text-lg classic-subtitle">Academy of Excellence</span>
              </div>
            </div>
            <div className="border-l-4 border-gray-800 pl-6">
              <p className="classic-subtitle leading-relaxed">
                "Established in the tradition of educational excellence, our academy has been
                the premier institution for Indian Sign Language instruction, committed to
                fostering communication and understanding through the art of sign language."
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="old-school-card p-6">
            <h3 className="text-xl font-bold classic-title mb-6 uppercase border-b-2 border-gray-800 pb-2">
              Navigation
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="/" className="classic-subtitle hover:text-gray-800 transition-colors block py-1">
                  → Home Page
                </a>
              </li>
              <li>
                <a href="/learn" className="classic-subtitle hover:text-gray-800 transition-colors block py-1">
                  → Learn Alphabet
                </a>
              </li>
              <li>
                <a href="/exam" className="classic-subtitle hover:text-gray-800 transition-colors block py-1">
                  → Examinations
                </a>
              </li>
              <li>
                <a href="/about" className="classic-subtitle hover:text-gray-800 transition-colors block py-1">
                  → About Academy
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="old-school-card p-6">
            <h3 className="text-xl font-bold classic-title mb-6 uppercase border-b-2 border-gray-800 pb-2">
              Resources
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="classic-subtitle hover:text-gray-800 transition-colors block py-1">
                  → ISL Dictionary
                </a>
              </li>
              <li>
                <a href="#" className="classic-subtitle hover:text-gray-800 transition-colors block py-1">
                  → Practice Materials
                </a>
              </li>
              <li>
                <a href="#" className="classic-subtitle hover:text-gray-800 transition-colors block py-1">
                  → Student Forum
                </a>
              </li>
              <li>
                <a href="#" className="classic-subtitle hover:text-gray-800 transition-colors block py-1">
                  → Contact Faculty
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 