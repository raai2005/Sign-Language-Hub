import Link from 'next/link';
import { useRouter } from 'next/router';

const Navbar = () => {
  const router = useRouter();

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/learn', label: 'Learn A-Z' },
    { href: '/intermediate', label: 'Intermediate' },
    { href: '/test-sets', label: 'Exam' },
    { href: '/about', label: 'About' },
  ];

  const isActive = (href: string) => router.pathname === href;

  return (
    <nav className="classic-nav border-b-4 border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-4 group">
              <div className="w-16 h-16 bg-gray-800 border-4 border-gray-600 flex items-center justify-center">
                <span className="text-white font-bold text-lg">ISL</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold classic-title uppercase">Indian Sign Language</span>
                <span className="text-sm classic-subtitle">Academy of Excellence</span>
              </div>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`classic-nav-item ${isActive(item.href) ? 'active' : ''
                    }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="classic-nav-item p-3">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden border-t-2 border-gray-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block classic-nav-item ${isActive(item.href) ? 'active' : ''
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