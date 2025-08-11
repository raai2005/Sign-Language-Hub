import Link from 'next/link';
import { useRouter } from 'next/router';

const Navbar = () => {
  const router = useRouter();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/learn', label: 'Learn A-Z' },
    { href: '/intermediate', label: 'Intermediate' },
    { href: '/exam', label: 'Exam' },
    { href: '/about', label: 'About' },
  ];

  const isActive = (href: string) => router.pathname === href;

  return (
    <nav className="glass shadow-strong border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-strong group-hover:shadow-strong transition-all duration-300 card-3d">
                <span className="text-white font-bold text-sm">ISL</span>
              </div>
              <span className="text-xl font-bold high-contrast-text group-hover:text-orange-600 transition-colors duration-200">Indian Sign Language</span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 nav-item-3d focus-ring ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-strong'
                      : 'high-contrast-text hover:text-orange-600 hover:bg-white/20'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="high-contrast-text hover:text-orange-600 focus:outline-none focus:text-orange-600 p-2 rounded-lg hover:bg-white/20 transition-colors duration-200 focus-ring">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-3 rounded-xl text-base font-semibold transition-all duration-200 nav-item-3d focus-ring ${
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-strong'
                    : 'high-contrast-text hover:text-orange-600 hover:bg-white/20'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 