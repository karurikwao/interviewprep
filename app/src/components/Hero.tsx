import { BookOpen, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Hero() {
  const scrollToTopics = () => document.getElementById('topics')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/couple-hero.jpg"
          alt="Happy couple prepared for their interview"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/70 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 pb-16">
        <div className="max-w-2xl">
          <Badge className="mb-6 bg-blue-500/90 text-white hover:bg-blue-500 border-0 backdrop-blur-sm font-semibold">
            Free Interview Practice Resources
          </Badge>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Prepare for Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-rose-300">
              Marriage-Based{' '}
            </span>{' '}
            Immigration Interview
          </h1>

          <p className="text-lg sm:text-xl text-slate-200 mb-8 leading-relaxed">
            Comprehensive practice questions, progress tracking, timeline builder, and free PDF downloads.
            Study with your partner and approach your interview with confidence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button
              onClick={scrollToTopics}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 shadow-lg hover:shadow-xl transition-all font-semibold"
            >
              <BookOpen className="mr-2 h-5 w-5" />
              Browse All Topics
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => document.getElementById('progress')?.scrollIntoView({ behavior: 'smooth' })}
              className="border-white/40 text-white hover:bg-white/15 hover:text-white hover:border-white/60 backdrop-blur-sm font-semibold bg-white/5"
            >
              <TrendingUp className="mr-2 h-5 w-5" />
              Track Progress
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="text-3xl font-bold text-white">28</div>
              <div className="text-sm text-slate-300">Topics</div>
            </div>
            <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="text-3xl font-bold text-white">1,200+</div>
              <div className="text-sm text-slate-300">Questions</div>
            </div>
            <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="text-3xl font-bold text-white">100%</div>
              <div className="text-sm text-slate-300">Free</div>
            </div>
            <div className="text-center p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
              <div className="text-3xl font-bold text-white">150+</div>
              <div className="text-sm text-slate-300">Sample Answers</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
