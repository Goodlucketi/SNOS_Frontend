import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Sun, Moon, Menu, X, LogIn, LayoutDashboard } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, isClient, clientData } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  React.useEffect(() => {
    const handleScrollEvent = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScrollEvent);
    // trigger once on mount
    handleScrollEvent();
    return () => window.removeEventListener('scroll', handleScrollEvent);
  }, []);

  const handleScroll = (elementId: string) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      // If we are not on landing page, let the router handle navigation or wait
      return;
    }
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getNavClass = (path: string) => {
    const isActive = location.pathname === path || (path === '/admin' && location.pathname.startsWith('/admin'));
    const isDarkBg = !isScrolled && location.pathname === '/';

    if (isActive) {
      return `text-sm font-bold transition-colors ${isDarkBg ? 'text-blue-400 drop-shadow-md' : 'text-blue-600 dark:text-blue-400'
        }`;
    }

    return `text-sm font-medium transition-colors ${isDarkBg
      ? 'text-slate-300 hover:text-white drop-shadow-sm'
      : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
      }`;
  };

  const getMobileNavClass = (path: string) => {
    const isActive = location.pathname === path || (path === '/admin' && location.pathname.startsWith('/admin'));

    return `relative overflow-hidden text-left py-3 px-4 text-sm transition-all duration-300 rounded-xl border ${isActive
      ? 'font-bold bg-gradient-to-r from-blue-500/10 to-transparent border-blue-500/20 text-blue-600 dark:text-blue-400 shadow-inner'
      : 'font-medium border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'
      }`;
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'What We Offer', path: '/what-we-offer' },
    { name: 'About', path: '/about' },
    { name: 'Contact & Support', path: '/support' },
  ];
  if (user?.role === 'admin') {
    navItems.push({ name: 'Admin', path: '/admin' });
  }

  return (
    <>
      <header
        className={`fixed top-0 z-40 w-full transition-all duration-300 ${isScrolled || location.pathname !== '/'
          ? 'bg-white/80 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-900/50 py-0 shadow-sm'
          : 'bg-transparent border-transparent py-2'
          }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-600/10 dark:shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Shield className="w-5.5 h-5.5 fill-white/10" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                SNOS
              </span>
            </Link>
          </div>

          {/* Desktop Menu (Premium Animated Pill) */}
          <div className="hidden md:flex items-center gap-1 bg-black/5 dark:bg-white/5 backdrop-blur-md p-1 rounded-full border border-black/5 dark:border-white/10">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || (item.path === '/admin' && location.pathname.startsWith('/admin'));
              const isDarkBg = !isScrolled && location.pathname === '/';

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-5 py-2 rounded-full text-sm font-medium transition-colors ${isActive
                    ? isDarkBg ? 'text-white' : 'text-blue-700 dark:text-blue-300'
                    : isDarkBg ? 'text-white/70 hover:text-white' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="desktop-nav-pill"
                      className={`absolute inset-0 rounded-full z-0 ${isDarkBg
                        ? 'bg-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/20'
                        : 'bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700'
                        }`}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-lg border transition-colors ${isScrolled || location.pathname !== '/' ? 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900' : 'border-white/20 text-white hover:bg-white/10 backdrop-blur-sm'}`}
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-amber-500" /> : <Moon className={`w-4.5 h-4.5 ${isScrolled || location.pathname !== '/' ? 'text-blue-600' : 'text-white'}`} />}
            </button>

            {/* User Console Access */}
            {user && isClient && clientData ? (
              <Link to="/dashboard">
                <Button
                  text="Dashboard"
                  variant="primary"
                  size="sm"
                  className="gap-1.5"
                />
              </Link>
            ) : (
              <div className="grid grid-cols-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    text="Login"
                    variant="secondary"
                    size="sm"
                  />
                </Link>
                <Link to="/register" className="flex items-center gap-1.5">
                  <Button
                    text="Register"
                    variant="primary"
                    size="sm"
                  />
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Hamburger & Mode */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-lg border transition-colors ${isScrolled || location.pathname !== '/' ? 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900' : 'border-white/20 text-white hover:bg-white/10 backdrop-blur-sm'}`}
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-amber-500" /> : <Moon className={`w-4.5 h-4.5 ${isScrolled || location.pathname !== '/' ? 'text-blue-600' : 'text-white'}`} />}
            </button>

            {/* Toggle Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2.5 rounded-lg border transition-colors ${isScrolled || location.pathname !== '/' ? 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900' : 'border-white/20 text-white hover:bg-white/10 backdrop-blur-sm'}`}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Overlay & Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
            />

            {/* Offcanvas Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed top-0 left-0 h-full w-[85%] max-w-sm bg-white dark:bg-slate-950 z-[70] p-6 shadow-2xl flex flex-col md:hidden"
            >
              {/* Header with Close Icon */}
              <div className="flex items-center justify-between mb-8">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                    <Shield className="w-5.5 h-5.5 fill-white/10" />
                  </div>
                  <span className="font-display font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                    SNOS
                  </span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Links */}
              <div className="flex-1 flex flex-col gap-3 overflow-y-auto">
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className={getMobileNavClass('/')}>Home</Link>
                <Link to="/what-we-offer" onClick={() => setMobileMenuOpen(false)} className={getMobileNavClass('/what-we-offer')}>What We Offer</Link>
                <Link to="/about" onClick={() => setMobileMenuOpen(false)} className={getMobileNavClass('/about')}>About SNOS</Link>
                <Link to="/support" onClick={() => setMobileMenuOpen(false)} className={getMobileNavClass('/support')}>Contact & Support</Link>
              </div>

              {/* Footer */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 mt-auto">
                {user && isClient && clientData ? (
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button text="Dashboard" variant="primary" size="md" className="w-full justify-center" />
                  </Link>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button text="Login" variant="outline" size="md" className="w-full justify-center" />
                    </Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button text="Register" variant="primary" size="md" className="w-full justify-center" />
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
