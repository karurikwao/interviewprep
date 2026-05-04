import { Heart, BookOpen, FileText, Lightbulb, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { topics } from '@/data/topics';
import { getIcon } from '@/lib/icons';

export function PrintableChecklistSection() {
  const handlePrint = () => {
    window.print();
  };

  const essentialTopics = topics.filter(t =>
    ['relationship-timeline', 'daily-routine', 'address-history', 'money-bills', 'kitchen-household', 'bedroom'].includes(t.id)
  );

  const keyQuestions = [
    "When and where did you first meet?",
    "When did you start dating?",
    "When did you move in together?",
    "When did you get engaged?",
    "When did you get married?",
    "What is your current address?",
    "What time do you usually wake up?",
    "Who cooks dinner most often?",
    "Do you have joint bank accounts?",
    "What are your work schedules?"
  ];

  return (
    <section id="checklist" className="py-20 bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Last-Minute Review Checklist</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            A printable summary of the most important topics to review before your interview.
          </p>
        </div>

        <div className="flex justify-center mb-6 no-print">
          <Button onClick={handlePrint} variant="outline" className="bg-white hover:bg-slate-100 font-semibold">
            <Printer className="mr-2 h-4 w-4" />
            Print Checklist
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border-2 border-slate-200 p-6 sm:p-8 print:shadow-none print:border-0">
          <div className="text-center mb-8 border-b pb-6">
            <h1 className="text-2xl font-bold text-slate-900">Interview Preparation Checklist</h1>
            <p className="text-slate-600 mt-2 font-medium">Review these key topics with your partner before your interview</p>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-rose-500" />
                Essential Relationship Questions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {keyQuestions.map((q, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <Checkbox id={`q-${i}`} className="mt-0.5 border-2 border-slate-500 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 h-5 w-5 flex-shrink-0" />
                    <Label htmlFor={`q-${i}`} className="text-sm cursor-pointer text-slate-700 font-medium">{q}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                Priority Topics to Review
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {essentialTopics.map(topic => {
                  const Icon = getIcon(topic.icon);
                  return (
                    <div key={topic.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <Checkbox id={`topic-${topic.id}`} className="mt-0.5 border-2 border-slate-500 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 h-5 w-5 flex-shrink-0" />
                      <Label htmlFor={`topic-${topic.id}`} className="text-sm cursor-pointer flex items-center gap-2 text-slate-700 font-medium">
                        <Icon className="h-4 w-4 text-slate-500" />
                        {topic.title}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-500" />
                Documents to Bring
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {['Marriage certificate', 'Photo ID / Passport', 'Joint bank statements', 'Lease or mortgage documents', 'Utility bills', 'Insurance cards', 'Tax returns (if applicable)', 'Photos together (organized by date)'].map((doc, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <Checkbox id={`doc-${i}`} className="mt-0.5 border-2 border-slate-500 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 h-5 w-5 flex-shrink-0" />
                    <Label htmlFor={`doc-${i}`} className="text-sm cursor-pointer text-slate-700 font-medium">{doc}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
              <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Final Reminders
              </h3>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside font-medium">
                <li>Get a good night's sleep before the interview</li>
                <li>Arrive 15-30 minutes early</li>
                <li>Dress professionally</li>
                <li>Answer truthfully - don't guess if unsure</li>
                <li>Stay calm and be yourselves</li>
                <li>Bring original documents plus copies</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t text-center text-sm text-slate-500 font-medium">
            <p>Generated from InterviewReady - Free Marriage-Based Immigration Interview Practice</p>
          </div>
        </div>
      </div>
    </section>
  );
}
