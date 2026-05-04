import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CookieSettingsButton } from '@/components/CookieConsent';

export function Footer() {
  const quickLinks = [
    { id: 'progress', label: 'Progress' },
    { id: 'topics', label: 'Topics' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'checklist', label: 'Checklist' },
    { id: 'testimonials', label: 'Stories' },
    { id: 'tips', label: 'Tips' },
  ];

  const scrollToSection = (id: string) => {
    if (window.location.pathname !== '/') {
      window.location.href = `/#${id}`;
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-300 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-6 w-6 text-rose-500" />
              <span className="font-bold text-white text-lg">InterviewReady</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              Free comprehensive practice resources for couples preparing for marriage-based immigration interviews.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {quickLinks.map(link => (
                <li key={link.id}>
                  <button onClick={() => scrollToSection(link.id)} className="hover:text-white transition-colors capitalize font-medium">
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy" className="hover:text-white transition-colors font-medium">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-white transition-colors font-medium">
                  Terms of Service
                </Link>
              </li>
              <li>
                <a href="mailto:support@interviewready.app" className="hover:text-white transition-colors font-medium">
                  Contact Us
                </a>
              </li>
              <li>
                <CookieSettingsButton />
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-white mb-4">Important Notice</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-medium">
              These resources are for practice purposes only and do not constitute legal advice.
              Consult with an immigration attorney for guidance specific to your case.
            </p>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-500 font-medium">
          <p>&copy; {new Date().getFullYear()} InterviewReady. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
