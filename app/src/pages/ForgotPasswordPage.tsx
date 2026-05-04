import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const msg = await forgotPassword(email);
      setSuccess(msg);
    } catch (err: any) {
      setError(err.message || 'Request failed');
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
            <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mb-3 mx-auto">
              <Mail className="h-6 w-6 text-amber-600" />
            </div>
            <CardTitle className="text-2xl">Forgot Password?</CardTitle>
            <CardDescription>Enter your email and we&apos;ll send you a reset link</CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center space-y-4">
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm font-medium">{success}</p>
                </div>
                <Link to="/login">
                  <Button variant="outline" className="font-semibold"><ArrowLeft className="mr-2 h-4 w-4" />Back to Login</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700 text-sm font-medium">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />{error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-semibold">Email Address</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="border-2 border-slate-300 focus:border-blue-500" />
                </div>
                <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 font-semibold py-3">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
                <p className="text-sm text-center text-slate-600">
                  <Link to="/login" className="text-blue-600 hover:underline font-medium">Back to Login</Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
