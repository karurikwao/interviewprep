import { useState } from 'react';
import { Search, Download, MessageSquare, Lightbulb, CheckCircle, Square, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { topics, categories, type Topic } from '@/data/topics';
import { useProgress } from '@/context/ProgressContext';
import { getIcon } from '@/lib/icons';

function TopicCard({ topic, isReviewed, onToggleReviewed, onClick }: { topic: Topic; isReviewed: boolean; onToggleReviewed: () => void; onClick: () => void }) {
  const Icon = getIcon(topic.icon);

  return (
    <Card className={`group cursor-pointer hover:shadow-lg transition-all duration-300 border-slate-200 hover:border-blue-300 ${isReviewed ? 'bg-green-50/30 border-green-200' : ''}`} onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-blue-100 transition-colors">
            <Icon className="h-5 w-5 text-slate-600 group-hover:text-blue-600" />
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {isReviewed && <Badge className="bg-green-100 text-green-700 border-0 font-semibold"><CheckCircle className="h-3 w-3 mr-1" />Done</Badge>}
            <Badge variant="secondary" className="text-xs font-semibold">{topic.questionCount} questions</Badge>
          </div>
        </div>
        <CardTitle className="text-lg mt-3 group-hover:text-blue-600 transition-colors">{topic.title}</CardTitle>
        <CardDescription className="text-sm line-clamp-2">{topic.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onToggleReviewed(); }}
            className={isReviewed ? 'text-green-600 hover:text-green-700 hover:bg-green-100 font-semibold' : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50 font-semibold'}
          >
            {isReviewed ? <><CheckCircle className="mr-1 h-4 w-4" /> Marked Done</> : <><Square className="mr-1 h-4 w-4" /> Mark as Done</>}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function TopicsSection({ onDownload }: { onDownload?: (topic: Topic) => void } = {}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const { isTopicReviewed, markTopicReviewed, unmarkTopicReviewed, toggleChecklistItem, isItemChecked } = useProgress();

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? topic.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const handleToggleReviewed = (topicId: string) => {
    if (isTopicReviewed(topicId)) {
      unmarkTopicReviewed(topicId);
    } else {
      markTopicReviewed(topicId);
    }
  };

  const handleDownload = (topic: Topic) => {
    if (onDownload) {
      onDownload(topic);
    } else {
      const link = document.createElement('a');
      link.href = `/pdfs/${topic.pdfFileName}`;
      link.download = topic.pdfFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <section id="topics" className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Practice Topics</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Browse through 28 comprehensive categories. Click any topic to view sample answers and download the full PDF.
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input placeholder="Search topics..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <button onClick={() => setSelectedCategory(null)} className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${selectedCategory === null ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'}`}>
              All Topics
            </button>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${selectedCategory === cat.id ? 'bg-blue-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-100'}`}>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTopics.map(topic => (
            <TopicCard
              key={topic.id}
              topic={topic}
              isReviewed={isTopicReviewed(topic.id)}
              onToggleReviewed={() => handleToggleReviewed(topic.id)}
              onClick={() => setSelectedTopic(topic)}
            />
          ))}
        </div>

        {filteredTopics.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No topics found matching your search.</p>
          </div>
        )}

        <Dialog open={!!selectedTopic} onOpenChange={() => setSelectedTopic(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95%] sm:w-auto p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
                {selectedTopic && (() => {
                  const IconComponent = getIcon(selectedTopic.icon);
                  return <IconComponent className="h-5 w-5" />;
                })()}
                {selectedTopic?.title}
              </DialogTitle>
              <DialogDescription>{selectedTopic?.description}</DialogDescription>
            </DialogHeader>

            {selectedTopic && (
              <Tabs defaultValue="sample" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1 h-auto">
                  <TabsTrigger value="sample" className="tab-sample text-xs sm:text-sm py-2 px-1 font-bold">
                    Sample Answers
                  </TabsTrigger>
                  <TabsTrigger value="checklist" className="tab-checklist text-xs sm:text-sm py-2 px-1 font-bold">
                    Checklist
                  </TabsTrigger>
                  <TabsTrigger value="download" className="tab-download text-xs sm:text-sm py-2 px-1 font-bold">
                    Download
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="sample" className="space-y-4 mt-4">
                  {selectedTopic.sampleQA && selectedTopic.sampleQA.length > 0 ? (
                    <div className="space-y-4">
                      {selectedTopic.sampleQA.map((qa, idx) => (
                        <Card key={idx} className="border-slate-200">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-bold text-slate-800 flex items-start gap-2">
                              <MessageSquare className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              {qa.question}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-slate-700 text-sm mb-2">"{qa.sampleAnswer}"</p>
                            {qa.tip && (
                              <p className="text-xs text-amber-600 flex items-center gap-1 font-medium">
                                <Lightbulb className="h-3 w-3" />
                                {qa.tip}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <p>Sample answers coming soon for this topic.</p>
                      <p className="text-sm">Download the PDF for the full question list.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="checklist" className="mt-4">
                  {selectedTopic.checklist && selectedTopic.checklist.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-sm text-slate-700 mb-4 font-medium">Check off items as you review them with your partner:</p>
                      {selectedTopic.checklist.map((item, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                          <Checkbox
                            id={`check-${selectedTopic.id}-${idx}`}
                            checked={isItemChecked(selectedTopic.id, item)}
                            onCheckedChange={() => toggleChecklistItem(selectedTopic.id, item)}
                            className="mt-0.5 border-2 border-slate-500 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 h-5 w-5 flex-shrink-0"
                          />
                          <Label htmlFor={`check-${selectedTopic.id}-${idx}`} className="text-sm cursor-pointer leading-relaxed text-slate-700">
                            {item}
                          </Label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <p>Checklist coming soon for this topic.</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="download" className="space-y-4 mt-4">
                  <div className="text-center py-6">
                    <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-700 mb-2 font-medium">Download the complete PDF with all questions</p>
                    <p className="text-sm text-slate-500 mb-6">{selectedTopic.questionCount} questions &bull; PDF format</p>
                    <Button onClick={() => handleDownload(selectedTopic)} className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-2 text-lg shadow-md hover:shadow-lg transition-all font-semibold">
                      <Download className="mr-2 h-5 w-5" />
                      Download PDF
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
