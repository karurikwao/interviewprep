import { ArrowLeft, Mail, MessageSquare, Send, HelpCircle, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function Contact() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-slate-700 hover:text-blue-600 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-semibold">Back to Home</span>
            </Link>
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-rose-500" />
              <span className="font-bold text-slate-900">InterviewReady</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <MessageSquare className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Contact Us</h1>
          <p className="text-slate-600 max-w-lg mx-auto">
            Have questions, feedback, or need assistance? Reach out to us via email and we&apos;ll get back to you as soon as possible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="border-2 border-slate-200">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3 mx-auto">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">General Inquiries</CardTitle>
              <CardDescription className="text-sm">
                <a href="mailto:hello@interviewready.app" className="text-blue-600 hover:underline font-medium">
                  hello@interviewready.app
                </a>
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-slate-200">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3 mx-auto">
                <HelpCircle className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Support</CardTitle>
              <CardDescription className="text-sm">
                <a href="mailto:support@interviewready.app" className="text-blue-600 hover:underline font-medium">
                  support@interviewready.app
                </a>
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 border-slate-200">
            <CardHeader className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mb-3 mx-auto">
                <Send className="h-6 w-6 text-amber-600" />
              </div>
              <CardTitle className="text-lg">Feedback</CardTitle>
              <CardDescription className="text-sm">
                <a href="mailto:feedback@interviewready.app" className="text-blue-600 hover:underline font-medium">
                  feedback@interviewready.app
                </a>
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="border-2 border-slate-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Send us an Email</CardTitle>
            <CardDescription>Click the button below to open your email client. We typically respond within 24-48 hours.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <a href="mailto:support@interviewready.app?subject=InterviewReady%20Inquiry">
                <Button className="bg-blue-600 hover:bg-blue-700 font-semibold py-3 px-8">
                  <Mail className="mr-2 h-5 w-5" />
                  Email Us
                </Button>
              </a>
              <p className="text-sm text-slate-500 mt-4">
                Your email client will open with a pre-filled recipient.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-6">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-2 border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-900">Is InterviewReady really free?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 text-sm font-medium">
                  Yes! All our practice questions, sample answers, and tools are completely free. We believe everyone deserves access to quality interview preparation resources.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-900">Do I need to create an account?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 text-sm font-medium">
                  No account needed! Your progress is saved locally in your browser. You can use all features immediately without signing up.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-900">Can I use this on my phone?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 text-sm font-medium">
                  Absolutely! InterviewReady is fully responsive and works great on mobile devices. You can even install it as an app on your home screen.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-slate-200">
              <CardHeader>
                <CardTitle className="text-base font-bold text-slate-900">How do I report a problem?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 text-sm font-medium">
                  If you encounter any issues, please email us at support@interviewready.app with details about the problem and we&apos;ll help you resolve it.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} InterviewReady. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
