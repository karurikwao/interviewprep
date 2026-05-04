import { useState, useEffect } from 'react';
import { X, Users, Settings, Megaphone, BarChart3, Shield, Save, Trash2, Plus, Code, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || '/api';

function authHeaders(token: string) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

export function AdminPanel({ onClose }: { onClose: () => void }) {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState('settings');

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-bold">Admin Panel</h2>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-1 rounded"><X className="h-5 w-5" /></button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid grid-cols-4 bg-slate-100 rounded-none border-b p-0 h-auto">
            <TabsTrigger value="settings" className="py-3 font-bold text-xs sm:text-sm data-[state=active]:bg-white"><Settings className="mr-1 h-4 w-4" />Settings</TabsTrigger>
            <TabsTrigger value="ads" className="py-3 font-bold text-xs sm:text-sm data-[state=active]:bg-white"><Megaphone className="mr-1 h-4 w-4" />Ad Networks</TabsTrigger>
            <TabsTrigger value="users" className="py-3 font-bold text-xs sm:text-sm data-[state=active]:bg-white"><Users className="mr-1 h-4 w-4" />Users</TabsTrigger>
            <TabsTrigger value="stats" className="py-3 font-bold text-xs sm:text-sm data-[state=active]:bg-white"><BarChart3 className="mr-1 h-4 w-4" />Stats</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <TabsContent value="settings"><SettingsTab token={token!} /></TabsContent>
            <TabsContent value="ads"><AdsTab token={token!} /></TabsContent>
            <TabsContent value="users"><UsersTab token={token!} /></TabsContent>
            <TabsContent value="stats"><StatsTab token={token!} /></TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function SettingsTab({ token }: { token: string }) {
  const [settings, setSettings] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/admin/settings`, { headers: authHeaders(token) })
      .then(r => r.json())
      .then(setSettings);
  }, [token]);

  const save = async () => {
    setSaving(true);
    await fetch(`${API_URL}/admin/settings`, { method: 'PUT', headers: authHeaders(token), body: JSON.stringify(settings) });
    setSaving(false);
  };

  if (!settings) return <p className="text-slate-500">Loading...</p>;

  const snippets = settings.siteVerificationSnippets || {};

  return (
    <div className="space-y-6">
      <Card className="border-2 border-slate-200">
        <CardHeader><CardTitle>General Settings</CardTitle><CardDescription>Control core features of the application</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div><p className="font-bold text-slate-900">Ads Enabled</p><p className="text-sm text-slate-600">Show advertisements across the site</p></div>
            <button onClick={() => setSettings({ ...settings, adsEnabled: !settings.adsEnabled })}>
              {settings.adsEnabled ? <ToggleRight className="h-8 w-8 text-green-600" /> : <ToggleLeft className="h-8 w-8 text-slate-400" />}
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div><p className="font-bold text-slate-900">Interstitial Before Download</p><p className="text-sm text-slate-600">Show ad overlay before PDF downloads</p></div>
            <button onClick={() => setSettings({ ...settings, interstitialBeforeDownload: !settings.interstitialBeforeDownload })}>
              {settings.interstitialBeforeDownload ? <ToggleRight className="h-8 w-8 text-green-600" /> : <ToggleLeft className="h-8 w-8 text-slate-400" />}
            </button>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg">
            <Label className="font-bold text-slate-900">Interstitial Duration (seconds)</Label>
            <Input type="number" min={3} max={30} value={settings.interstitialDurationSec || 5} onChange={e => setSettings({ ...settings, interstitialDurationSec: parseInt(e.target.value) || 5 })} className="mt-1 w-32" />
          </div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
            <div><p className="font-bold text-slate-900">Cookie Consent Banner</p><p className="text-sm text-slate-600">Show GDPR cookie consent banner</p></div>
            <button onClick={() => setSettings({ ...settings, cookieConsentEnabled: !settings.cookieConsentEnabled })}>
              {settings.cookieConsentEnabled ? <ToggleRight className="h-8 w-8 text-green-600" /> : <ToggleLeft className="h-8 w-8 text-slate-400" />}
            </button>
          </div>
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
            <div><p className="font-bold text-red-900">Maintenance Mode</p><p className="text-sm text-red-600">Temporarily disable site for users</p></div>
            <button onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}>
              {settings.maintenanceMode ? <ToggleRight className="h-8 w-8 text-red-600" /> : <ToggleLeft className="h-8 w-8 text-slate-400" />}
            </button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-slate-200">
        <CardHeader><CardTitle className="flex items-center gap-2"><Code className="h-5 w-5" /> Site Verification Snippets</CardTitle><CardDescription>Insert meta tags or verification codes from ad platforms and search engines</CardDescription></CardHeader>
        <CardContent className="space-y-3">
          {['google', 'bing', 'amazon', 'ezoic', 'propellerads', 'other'].map(key => (
            <div key={key}>
              <Label className="text-sm font-bold capitalize">{key} Verification</Label>
              <Input
                value={snippets[key] || ''}
                onChange={e => setSettings({ ...settings, siteVerificationSnippets: { ...snippets, [key]: e.target.value } })}
                placeholder={`Paste ${key} verification meta tag or code...`}
                className="mt-1 font-mono text-xs"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={save} disabled={saving} className="bg-blue-600 hover:bg-blue-700 font-semibold">
        <Save className="mr-2 h-4 w-4" />{saving ? 'Saving...' : 'Save Settings'}
      </Button>
    </div>
  );
}

function AdsTab({ token }: { token: string }) {
  const [networks, setNetworks] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);

  const load = () => fetch(`${API_URL}/admin/ad-networks`, { headers: authHeaders(token) }).then(r => r.json()).then(setNetworks);

  useEffect(() => { load(); }, [token]);

  const save = async (net: any) => {
    if (net.id) {
      await fetch(`${API_URL}/admin/ad-networks/${net.id}`, { method: 'PUT', headers: authHeaders(token), body: JSON.stringify(net) });
    } else {
      await fetch(`${API_URL}/admin/ad-networks`, { method: 'POST', headers: authHeaders(token), body: JSON.stringify(net) });
    }
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    await fetch(`${API_URL}/admin/ad-networks/${id}`, { method: 'DELETE', headers: authHeaders(token) });
    load();
  };

  const toggleActive = async (net: any) => {
    await fetch(`${API_URL}/admin/ad-networks/${net.id}`, { method: 'PUT', headers: authHeaders(token), body: JSON.stringify({ ...net, isActive: !net.isActive }) });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-slate-900">Ad Networks</h3>
        <Button size="sm" onClick={() => setEditing({ name: '', label: '', adCode: '', isActive: false, priority: 0, settings: {} })} className="font-semibold"><Plus className="mr-1 h-4 w-4" />Add Network</Button>
      </div>

      {editing && (
        <Card className="border-2 border-blue-300 bg-blue-50/30">
          <CardHeader><CardTitle className="text-base">{editing.id ? 'Edit' : 'New'} Ad Network</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="font-bold text-xs">Name (slug)</Label><Input value={editing.name} onChange={e => setEditing({ ...editing, name: e.target.value })} placeholder="google-adsense" className="font-mono text-sm" /></div>
              <div><Label className="font-bold text-xs">Display Label</Label><Input value={editing.label} onChange={e => setEditing({ ...editing, label: e.target.value })} placeholder="Google AdSense" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="font-bold text-xs">Priority (higher = shown first)</Label><Input type="number" value={editing.priority} onChange={e => setEditing({ ...editing, priority: parseInt(e.target.value) || 0 })} /></div>
              <div className="flex items-end gap-2 pb-1">
                <Checkbox checked={editing.isActive} onCheckedChange={c => setEditing({ ...editing, isActive: !!c })} className="h-5 w-5 border-2 border-slate-500" />
                <Label className="font-bold text-sm">Active</Label>
              </div>
            </div>
            <div><Label className="font-bold text-xs">Ad Code (HTML/JS)</Label><textarea value={editing.adCode || ''} onChange={e => setEditing({ ...editing, adCode: e.target.value })} rows={6} className="w-full mt-1 p-3 border-2 border-slate-300 rounded-lg font-mono text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-200" placeholder="Paste ad code snippet here..." /></div>
            <div className="flex gap-2">
              <Button onClick={() => save(editing)} className="bg-blue-600 hover:bg-blue-700 font-semibold"><Save className="mr-1 h-4 w-4" />Save</Button>
              <Button variant="outline" onClick={() => setEditing(null)} className="font-semibold">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {networks.map(net => (
        <Card key={net.id} className={`border-2 ${net.isActive ? 'border-green-200 bg-green-50/20' : 'border-slate-200'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <button onClick={() => toggleActive(net)}>
                  {net.isActive ? <ToggleRight className="h-7 w-7 text-green-600" /> : <ToggleLeft className="h-7 w-7 text-slate-400" />}
                </button>
                <div>
                  <p className="font-bold text-slate-900">{net.label}</p>
                  <p className="text-xs text-slate-500 font-mono">{net.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs font-semibold">Priority: {net.priority}</Badge>
                {net.adCode && <Badge className="bg-blue-100 text-blue-700 border-0 text-xs font-semibold"><Code className="h-3 w-3 mr-1" />Has Code</Badge>}
                <Button size="sm" variant="outline" onClick={() => setEditing({ ...net })} className="font-semibold">Edit</Button>
                <button onClick={() => remove(net.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function UsersTab({ token }: { token: string }) {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/admin/users`, { headers: authHeaders(token) }).then(r => r.json()).then(setUsers);
  }, [token]);

  const toggleActive = async (u: any) => {
    const res = await fetch(`${API_URL}/admin/users/${u.id}`, { method: 'PUT', headers: authHeaders(token), body: JSON.stringify({ isActive: !u.isActive, role: u.role }) });
    const updated = await res.json();
    setUsers(prev => prev.map(x => x.id === u.id ? { ...x, ...updated } : x));
  };

  const remove = async (id: string) => {
    await fetch(`${API_URL}/admin/users/${id}`, { method: 'DELETE', headers: authHeaders(token) });
    setUsers(prev => prev.filter(x => x.id !== id));
  };

  return (
    <div className="space-y-3">
      <h3 className="font-bold text-slate-900">Registered Users ({users.length})</h3>
      {users.map(u => (
        <Card key={u.id} className={`border-2 ${u.role === 'admin' ? 'border-blue-200 bg-blue-50/20' : 'border-slate-200'}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-bold text-slate-900">{u.firstName} {u.lastName} <span className="text-slate-500 font-normal text-sm">({u.email})</span></p>
                <p className="text-xs text-slate-500">Joined: {new Date(u.createdAt).toLocaleDateString()}</p>
                {u.progress && <p className="text-xs text-slate-600 mt-1">Topics reviewed: {u.progress.reviewedTopics?.length || 0}</p>}
              </div>
              <div className="flex items-center gap-2">
                {u.role === 'admin' && <Badge className="bg-blue-100 text-blue-700 border-0 font-semibold">Admin</Badge>}
                <Badge className={u.isActive ? 'bg-green-100 text-green-700 border-0 font-semibold' : 'bg-red-100 text-red-700 border-0 font-semibold'}>
                  {u.isActive ? 'Active' : 'Disabled'}
                </Badge>
                {u.role !== 'admin' && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => toggleActive(u)} className="font-semibold text-xs">
                      {u.isActive ? 'Disable' : 'Enable'}
                    </Button>
                    <button onClick={() => remove(u.id)} className="text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function StatsTab({ token }: { token: string }) {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_URL}/admin/stats`, { headers: authHeaders(token) }).then(r => r.json()).then(setStats);
  }, [token]);

  if (!stats) return <p className="text-slate-500">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-2 border-slate-200"><CardContent className="p-6 text-center"><p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p><p className="text-slate-600 font-medium">Total Users</p></CardContent></Card>
        <Card className="border-2 border-slate-200"><CardContent className="p-6 text-center"><p className="text-3xl font-bold text-green-600">{stats.totalDownloads}</p><p className="text-slate-600 font-medium">Total Downloads</p></CardContent></Card>
        <Card className="border-2 border-slate-200"><CardContent className="p-6 text-center"><p className="text-3xl font-bold text-amber-600">{stats.activeNetworks}</p><p className="text-slate-600 font-medium">Active Ad Networks</p></CardContent></Card>
      </div>

      <h3 className="font-bold text-slate-900">Recent Downloads</h3>
      <div className="space-y-2">
        {stats.recentDownloads?.map((d: any) => (
          <div key={d.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div><p className="font-medium text-slate-900">{d.topicId}</p><p className="text-xs text-slate-500">{d.user?.email || 'Anonymous'}</p></div>
            <p className="text-xs text-slate-500">{new Date(d.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
