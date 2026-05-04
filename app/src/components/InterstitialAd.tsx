import { useState, useEffect, useCallback } from 'react';
import { Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface InterstitialAdProps {
  isOpen: boolean;
  onContinue: () => void;
}

export function InterstitialAd({ isOpen, onContinue }: InterstitialAdProps) {
  const [countdown, setCountdown] = useState(5);
  const [settings, setSettings] = useState<any>(null);
  const [activeNetwork, setActiveNetwork] = useState<any>(null);

  const loadSettings = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/download/settings`);
      const data = await res.json();
      setSettings(data);
      if (data.activeNetworks?.length > 0) {
        setActiveNetwork(data.activeNetworks[0]);
        setCountdown(data.interstitialDurationSec || 5);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (isOpen) loadSettings();
  }, [isOpen, loadSettings]);

  useEffect(() => {
    if (!isOpen || !settings?.adsEnabled) {
      if (isOpen && (!settings?.adsEnabled || !activeNetwork)) onContinue();
      return;
    }

    setCountdown(settings.interstitialDurationSec || 5);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, settings, activeNetwork]);

  if (!isOpen || !settings?.adsEnabled || !activeNetwork) return null;

  return (
    <div className="fixed inset-0 z-[90] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="bg-slate-100 px-4 py-3 flex items-center justify-between border-b">
          <p className="text-sm text-slate-600 font-medium">Sponsored Content</p>
          {countdown > 0 ? (
            <div className="flex items-center gap-1 text-sm font-bold text-slate-700">
              <Clock className="h-4 w-4" />
              Continue in {countdown}s
            </div>
          ) : (
            <Button size="sm" onClick={onContinue} className="bg-blue-600 hover:bg-blue-700 font-semibold text-sm">
              Continue to Download
            </Button>
          )}
        </div>

        <div className="p-6 min-h-[250px] flex items-center justify-center">
          {activeNetwork.adCode ? (
            <div className="w-full" dangerouslySetInnerHTML={{ __html: activeNetwork.adCode }} />
          ) : (
            <div className="text-center text-slate-400">
              <p className="text-lg font-bold">{activeNetwork.label}</p>
              <p className="text-sm">Ad code not configured yet. Add it in the Admin Panel.</p>
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t bg-slate-50 text-center">
          {countdown <= 0 && (
            <Button onClick={onContinue} className="bg-blue-600 hover:bg-blue-700 font-semibold">
              Continue to Download
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
