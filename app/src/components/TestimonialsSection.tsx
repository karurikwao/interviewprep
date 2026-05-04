import { CheckCircle, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { testimonials, type Testimonial } from '@/data/topics';

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Success Stories</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Read about couples who used these resources to prepare for their interviews.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t: Testimonial) => (
            <Card key={t.id} className="border-2 border-slate-200 shadow-md">
              <CardHeader>
                <Quote className="h-8 w-8 text-blue-300 mb-2" />
                <CardDescription className="text-slate-700 italic leading-relaxed font-medium">
                  "{t.quote}"
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-bold text-slate-900">{t.names}</p>
                    <p className="text-sm text-slate-600 font-medium">{t.location}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-700 border-0 font-semibold">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {t.result}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500 mt-2 font-medium">{t.date}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Card className="inline-block bg-gradient-to-r from-blue-600 to-rose-500 text-white border-0 mx-4">
            <CardContent className="py-6 px-8">
              <p className="text-lg font-bold mb-2">Ready to start your preparation?</p>
              <p className="text-white/90 mb-4 font-medium">Join thousands of couples who have successfully prepared for their interviews.</p>
              <Button onClick={() => document.getElementById('topics')?.scrollIntoView({ behavior: 'smooth' })} variant="secondary" className="bg-white text-slate-900 hover:bg-white/90 font-semibold">
                Start Practicing Now
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
