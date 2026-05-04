import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Menu, X, LogIn, UserPlus, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    if (window.location.pathname !== '/') {
      window.location.href = `/#${id}`;
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  const navLinks = [
    { id: 'progress', label: 'Progress' },
    { id: 'topics', label: 'Topics' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'checklist', label: 'Checklist' },
    { id: 'testimonials', label: 'Stories' },
    { id: 'tips', label: 'Tips' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Heart className={`h-6 w-6 transition-colors duration-300 ${scrolled ? 'text-rose-500' : 'text-rose-400'}`} />
            <span className={`font-bold text-lg transition-colors duration-300 ${scrolled ? 'text-slate-800' : 'text-white'}`}>InterviewReady</span>
          </Link>

          <div className="hidden lg:flex items-center gap-2">
            {navLinks.map(link => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 font-bold text-sm border-2 ${
                  scrolled
                    ? 'text-slate-700 border-slate-300 hover:text-blue-700 hover:border-blue-500 hover:bg-blue-50'
                    : 'text-white border-white/40 hover:text-white hover:border-white hover:bg-white/20'
                }`}
              >
                {link.label}
              </button>
            ))}

            {user ? (
              <div className="flex items-center gap-2 ml-2">
                {user.role === 'admin' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'A', ctrlKey: true, shiftKey: true }))}
                    className={`font-bold text-xs ${scrolled ? 'border-slate-300' : 'border-white/40 text-white hover:bg-white/20'}`}
                  >
                    <Shield className="mr-1 h-3 w-3" />Admin
                  </Button>
                )}
                <span className={`text-sm font-medium ${scrolled ? 'text-slate-700' : 'text-white/90'}`}>
                  {user.firstName || user.email}
                </span>
                <Button size="sm" variant="ghost" onClick={logout} className={`font-bold ${scrolled ? 'text-slate-600 hover:text-red-600' : 'text-white/80 hover:text-white'}`}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link to="/login">
                  <Button size="sm" variant="ghost" className={`font-bold ${scrolled ? 'text-slate-700' : 'text-white hover:bg-white/20'}`}>
                    <LogIn className="mr-1 h-4 w-4" />Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="font-bold bg-blue-600 hover:bg-blue-700 text-white border-2 border-blue-600">
                    <UserPlus className="mr-1 h-4 w-4" />Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          <button className={`lg:hidden p-2 rounded-lg transition-colors ${scrolled ? 'hover:bg-slate-100' : 'hover:bg-white/20'}`} onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className={`h-6 w-6 ${scrolled ? 'text-slate-800' : 'text-white'}`} /> : <Menu className={`h-6 w-6 ${scrolled ? 'text-slate-800' : 'text-white'}`} />}
          </button>
        </div>

        {isOpen && (
          <div className="lg:hidden py-4 border-t bg-white">
            <div className="flex flex-col gap-1">
              {navLinks.map(link => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="text-left px-4 py-3 text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg font-semibold transition-colors"
                >
                  {link.label}
                </button>
              ))}

              {user ? (
                <>
                  <div className="px-4 py-2 text-sm text-slate-600 font-medium">Signed in as {user.firstName || user.email}</div>
                  {user.role === 'admin' && (
                    <button
                      onClick={() => { setIsOpen(false); window.dispatchEvent(new KeyboardEvent('keydown', { key: 'A', ctrlKey: true, shiftKey: true })); }}
                      className="text-left px-4 py-3 text-blue-700 hover:bg-blue-50 rounded-lg font-semibold"
                    >
                      <Shield className="mr-2 h-4 w-4 inline" />Admin Panel
                    </button>
                  )}
                  <button onClick={() => { logout(); setIsOpen(false); }} className="text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg font-semibold">
                    <LogOut className="mr-2 h-4 w-4 inline" />Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsOpen(false)} className="text-left px-4 py-3 text-slate-700 hover:bg-blue-50 rounded-lg font-semibold">
                    <LogIn className="mr-2 h-4 w-4 inline" />Sign In
                  </Link>
                  <div className="pt-2 px-4">
                    <Link to="/register" onClick={() => setIsOpen(false)}>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 font-semibold">Sign Up Free</Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
