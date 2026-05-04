import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-rose-500" />
            <span className="text-2xl font-bold text-slate-900">InterviewReady</span>
          </Link>
        </div>

        <Card className="border-2 border-slate-200 shadow-lg">
          <CardHeader className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3 mx-auto">
              <LogIn className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to track your progress and download resources</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700 text-sm font-medium">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="pl-10 border-2 border-slate-300 focus:border-blue-500" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-semibold">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Enter your password" className="pl-10 border-2 border-slate-300 focus:border-blue-500" />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 font-semibold py-3">
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
              <div className="flex justify-between text-sm">
                <Link to="/forgot-password" className="text-blue-600 hover:underline font-medium">Forgot password?</Link>
                <Link to="/register" className="text-blue-600 hover:underline font-medium">Create account</Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
