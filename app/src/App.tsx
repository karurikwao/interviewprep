import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProgressProvider } from '@/context/ProgressContext';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Navigation } from '@/components/Navigation';
import { Hero } from '@/components/Hero';
import { StudyProgressSection } from '@/components/StudyProgressSection';
import { TopicsSection } from '@/components/TopicsSection';
import { TimelineBuilderSection } from '@/components/TimelineBuilderSection';
import { PrintableChecklistSection } from '@/components/PrintableChecklistSection';
import { TestimonialsSection } from '@/components/TestimonialsSection';
import { TipsSection } from '@/components/TipsSection';
import { FAQSection } from '@/components/FAQSection';
import { Footer } from '@/components/Footer';
import { PWAInstallPrompt } from '@/components/PWAInstallPrompt';
import { AdminPanel } from '@/components/AdminPanel';
import { InterstitialAd } from '@/components/InterstitialAd';
import { CookieConsent } from '@/components/CookieConsent';
import { PrivacyPolicy } from '@/pages/PrivacyPolicy';
import { Terms } from '@/pages/Terms';
import { Contact } from '@/pages/Contact';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import type { Topic } from '@/data/topics';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

function HomePage() {
  const [showAdmin, setShowAdmin] = useState(false);
  const [interstitialOpen, setInterstitialOpen] = useState(false);
  const [pendingDownload, setPendingDownload] = useState<Topic | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        if (user?.role === 'admin') setShowAdmin(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user]);

  const handleDownload = async (topic: Topic) => {
    if (user) {
      try {
        const token = localStorage.getItem('ir-token');
        await fetch(`${API_URL}/download`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ topicId: topic.id }),
        });
      } catch {}
    }

    try {
      const res = await fetch(`${API_URL}/download/settings`);
      const settings = await res.json();
      if (settings.adsEnabled && settings.interstitialBeforeDownload && settings.activeNetworks?.length > 0) {
        setPendingDownload(topic);
        setInterstitialOpen(true);
        return;
      }
    } catch {}

    doDirectDownload(topic);
  };

  const doDirectDownload = (topic: Topic) => {
    const link = document.createElement('a');
    link.href = `/pdfs/${topic.pdfFileName}`;
    link.download = topic.pdfFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleInterstitialComplete = () => {
    setInterstitialOpen(false);
    if (pendingDownload) {
      doDirectDownload(pendingDownload);
      setPendingDownload(null);
    }
  };

  return (
    <>
      <Navigation />
      <Hero />
      <StudyProgressSection />
      <TopicsSection onDownload={handleDownload} />
      <TimelineBuilderSection />
      <PrintableChecklistSection />
      <TestimonialsSection />
      <TipsSection />
      <FAQSection />
      <Footer />
      <PWAInstallPrompt />
      <CookieConsent />
      <InterstitialAd isOpen={interstitialOpen} onContinue={handleInterstitialComplete} />
      {showAdmin && user?.role === 'admin' && <AdminPanel onClose={() => setShowAdmin(false)} />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <ProgressProvider>
        <div className="min-h-screen bg-white">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </div>
      </ProgressProvider>
    </AuthProvider>
  );
}

export default App;
