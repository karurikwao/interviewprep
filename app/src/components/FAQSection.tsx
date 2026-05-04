import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function FAQSection() {
  const faqs = [
    { question: "Are these the actual questions I'll be asked?", answer: "These questions cover common topics that immigration officers may ask during marriage-based interviews. While they represent typical areas of inquiry, your actual interview questions may vary. Use these as a comprehensive study guide." },
    { question: "How should my partner and I practice together?", answer: "Take turns asking each other questions from different categories. Start with easier topics like daily routines, then move to more detailed questions about your relationship history. Practice regularly and review any areas where your answers differ." },
    { question: "What if we don't remember exact dates?", answer: "It's okay to approximate (e.g., 'around March 2020' or 'summer of 2021'). What's important is that both partners give consistent timeframes. If you're truly unsure, it's better to say 'I don't remember exactly' than to guess." },
    { question: "Should we bring these practice questions to the interview?", answer: "No, do not bring practice materials to your actual interview. These are for preparation only. You should bring original documents, photos, and any evidence requested by USCIS." },
    { question: "How long should we practice?", answer: "Start practicing at least 2-3 weeks before your interview. Spend 30-60 minutes daily reviewing different topics. The more familiar you are with your shared life details, the more confident you'll be." },
    { question: "Are these resources really free?", answer: "Yes, all PDF downloads are completely free. We believe everyone deserves access to quality interview preparation resources regardless of their financial situation." }
  ];

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
          <p className="text-slate-600">Common questions about using these practice materials</p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="border-2 border-slate-200 rounded-lg mb-2 px-4">
              <AccordionTrigger className="text-left font-bold text-sm sm:text-base text-slate-800 py-4">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-slate-700 leading-relaxed text-sm sm:text-base font-medium pb-4">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
