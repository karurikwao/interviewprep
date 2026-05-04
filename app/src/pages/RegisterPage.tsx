import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, UserPlus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      await register(email, password, firstName, lastName);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
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
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3 mx-auto">
              <UserPlus className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Create Free Account</CardTitle>
            <CardDescription>Sign up to save your progress across devices</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700 text-sm font-medium">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="font-semibold">First Name</Label>
                  <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="Jane" className="border-2 border-slate-300 focus:border-blue-500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="font-semibold">Last Name</Label>
                  <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" className="border-2 border-slate-300 focus:border-blue-500" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold">Email</Label>
                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="border-2 border-slate-300 focus:border-blue-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="font-semibold">Password</Label>
                <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min 8 characters" className="border-2 border-slate-300 focus:border-blue-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="font-semibold">Confirm Password</Label>
                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required placeholder="Re-enter password" className="border-2 border-slate-300 focus:border-blue-500" />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 font-semibold py-3">
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
              <p className="text-sm text-center text-slate-600">
                Already have an account? <Link to="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
