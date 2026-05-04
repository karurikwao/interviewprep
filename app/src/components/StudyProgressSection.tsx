import { TrendingUp, RotateCcw, X, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { topics } from '@/data/topics';
import { useProgress } from '@/context/ProgressContext';
import { getIcon } from '@/lib/icons';

export function StudyProgressSection() {
  const { reviewedTopics, getProgressPercentage, resetProgress, unmarkTopicReviewed } = useProgress();
  const percentage = getProgressPercentage();

  return (
    <section id="progress" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Your Study Progress</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Track which topics you've reviewed. Aim to go through all 28 topics before your interview.
          </p>
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Progress Overview
                </CardTitle>
                <CardDescription>{reviewedTopics.length} of {topics.length} topics reviewed</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={resetProgress} className="text-slate-500 font-semibold">
                <RotateCcw className="mr-1 h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 font-medium">Overall Progress</span>
                <span className="font-bold text-slate-900">{percentage}%</span>
              </div>
              <Progress value={percentage} className="h-3" />
            </div>

            {reviewedTopics.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-3">Reviewed Topics:</h4>
                <div className="flex flex-wrap gap-2">
                  {reviewedTopics.map(topicId => {
                    const topic = topics.find(t => t.id === topicId);
                    if (!topic) return null;
                    const Icon = getIcon(topic.icon);
                    return (
                      <Badge key={topicId} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                        <Icon className="h-3 w-3" />
                        {topic.title}
                        <button onClick={() => unmarkTopicReviewed(topicId)} className="ml-1 hover:text-red-500">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {percentage === 100 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="text-green-800 font-bold">Congratulations! You've reviewed all topics.</p>
                <p className="text-green-600 text-sm">You're well prepared for your interview!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
