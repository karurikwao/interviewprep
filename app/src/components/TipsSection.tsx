import { Heart, CheckCircle, Shield, Info, AlertCircle, Lightbulb } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function TipsSection() {
  const tips = [
    { icon: Heart, title: "Be Truthful", description: "Always answer honestly. If you don't remember something, say so rather than guessing. Consistency is key." },
    { icon: CheckCircle, title: "Practice Together", description: "Study with your partner regularly. Quiz each other on different topics to build confidence." },
    { icon: Shield, title: "Stay Calm", description: "The interview is a conversation, not an interrogation. Take your time and breathe." },
    { icon: Info, title: "Know Your Documents", description: "Review your application and supporting documents. Be familiar with dates and details you provided." },
    { icon: AlertCircle, title: "Don't Memorize Scripts", description: "Understand your answers rather than memorizing them. Natural responses are more convincing." },
    { icon: Lightbulb, title: "Use These Questions as a Guide", description: "These questions cover common topics. Your actual interview may include different or additional questions." }
  ];

  return (
    <section id="tips" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Interview Tips</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">Follow these guidelines to approach your interview with confidence and preparation.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tips.map((tip, index) => {
            const Icon = tip.icon;
            return (
              <Card key={index} className="border-2 border-slate-200 shadow-md">
                <CardHeader>
                  <div className="p-3 bg-blue-100 rounded-lg w-fit mb-4">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg font-bold text-slate-900">{tip.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed text-slate-700 font-medium">{tip.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
