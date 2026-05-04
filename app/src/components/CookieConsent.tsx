import { useState, useEffect } from 'react';
import { Cookie, Settings, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const COOKIE_CATEGORIES = [
  { id: 'essential', label: 'Essential', description: 'Required for the site to function. Cannot be disabled.', required: true },
  { id: 'analytics', label: 'Analytics', description: 'Help us understand how visitors interact with the site.', required: false },
  { id: 'advertising', label: 'Advertising', description: 'Used to deliver personalized advertisements.', required: false },
  { id: 'functional', label: 'Functional', description: 'Enable enhanced functionality and personalization.', required: false },
];

function getCookieConsent(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem('ir-cookie-consent');
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function saveCookieConsent(consent: Record<string, boolean>) {
  localStorage.setItem('ir-cookie-consent', JSON.stringify(consent));
  localStorage.setItem('ir-cookie-consent-date', new Date().toISOString());
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useState<Record<string, boolean>>({ essential: true });
  const [bannerEnabled, setBannerEnabled] = useState(true);

  useEffect(() => {
    const existing = getCookieConsent();
    if (existing.essential) return;

    fetch(`${API_URL}/download/settings`).then(r => r.json()).then(data => {
      setBannerEnabled(data.cookieConsentEnabled !== false);
      if (data.cookieConsentEnabled !== false) setVisible(true);
    }).catch(() => setVisible(true));
  }, []);

  const acceptAll = () => {
    const all: Record<string, boolean> = {};
    COOKIE_CATEGORIES.forEach(c => { all[c.id] = true; });
    saveCookieConsent(all);
    setConsent(all);
    setVisible(false);
  };

  const acceptSelected = () => {
    const c = { ...consent, essential: true };
    saveCookieConsent(c);
    setConsent(c);
    setShowSettings(false);
    setVisible(false);
  };

  const rejectOptional = () => {
    const c: Record<string, boolean> = { essential: true };
    saveCookieConsent(c);
    setConsent(c);
    setVisible(false);
  };

  if (!visible || !bannerEnabled) return null;

  if (showSettings) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-[80] p-4">
        <Card className="max-w-2xl mx-auto shadow-2xl border-2 border-slate-200">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Settings className="h-5 w-5" />Cookie Preferences</h3>
              <button onClick={() => setShowSettings(false)}><X className="h-5 w-5 text-slate-400" /></button>
            </div>
            <p className="text-sm text-slate-600">Manage your cookie preferences. Essential cookies are required for the site to function.</p>
            {COOKIE_CATEGORIES.map(cat => (
              <div key={cat.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                <Checkbox
                  id={`cookie-${cat.id}`}
                  checked={consent[cat.id] || false}
                  disabled={cat.required}
                  onCheckedChange={checked => setConsent({ ...consent, [cat.id]: !!checked })}
                  className="mt-0.5 border-2 border-slate-500 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 h-5 w-5"
                />
                <Label htmlFor={`cookie-${cat.id}`} className="cursor-pointer">
                  <p className="font-bold text-slate-900 text-sm">{cat.label} {cat.required && <span className="text-xs text-slate-500">(required)</span>}</p>
                  <p className="text-xs text-slate-600">{cat.description}</p>
                </Label>
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Button onClick={acceptSelected} className="bg-blue-600 hover:bg-blue-700 font-semibold">Save Preferences</Button>
              <Button variant="outline" onClick={acceptAll} className="font-semibold">Accept All</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[80] p-4">
      <Card className="max-w-2xl mx-auto shadow-2xl border-2 border-slate-200">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <Cookie className="h-6 w-6 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-slate-700 font-medium mb-3">
                We use cookies to improve your experience, analyze site traffic, and serve relevant advertisements. By clicking "Accept All", you consent to our use of cookies.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={acceptAll} className="bg-blue-600 hover:bg-blue-700 font-semibold">Accept All</Button>
                <Button size="sm" variant="outline" onClick={rejectOptional} className="font-semibold">Reject Optional</Button>
                <Button size="sm" variant="ghost" onClick={() => setShowSettings(true)} className="font-semibold text-slate-600">Manage Preferences</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function CookieSettingsButton() {
  const openSettings = () => {
    localStorage.removeItem('ir-cookie-consent');
    localStorage.removeItem('ir-cookie-consent-date');
    window.location.reload();
  };

  return (
    <button onClick={openSettings} className="hover:text-white transition-colors font-medium text-sm flex items-center gap-1">
      <Settings className="h-3 w-3" />
      Cookie Settings
    </button>
  );
}
