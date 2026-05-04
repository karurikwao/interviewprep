import { useState } from 'react';
import { Calendar, Eye, EyeOff, Plus, Trash2, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { defaultMilestones } from '@/data/topics';

export function TimelineBuilderSection() {
  const [milestones, setMilestones] = useLocalStorage('interview-timeline-v2', defaultMilestones.map((m, i) => ({ ...m, id: `m-${i}` })));
  const [showPreview, setShowPreview] = useState(false);

  const updateMilestone = (id: string, field: keyof typeof defaultMilestones[0], value: string | boolean) => {
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const addMilestone = () => {
    const newId = `m-${Date.now()}`;
    setMilestones(prev => [...prev, { id: newId, title: 'New Milestone', date: '', location: '', notes: '', hasEvidence: false }]);
  };

  const removeMilestone = (id: string) => {
    setMilestones(prev => prev.filter(m => m.id !== id));
  };

  const filledCount = milestones.filter(m => m.date && m.location).length;

  return (
    <section id="timeline" className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Relationship Timeline Builder</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Document your relationship milestones. Having a clear timeline helps ensure you and your partner give consistent answers.
          </p>
        </div>

        <Card className="mb-6 border-2 border-slate-200 shadow-lg">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Your Timeline
                </CardTitle>
                <CardDescription className="font-medium">{filledCount} of {milestones.length} milestones documented</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)} className="font-semibold border-slate-300">
                  {showPreview ? <><EyeOff className="mr-1 h-4 w-4" /> Hide</> : <><Eye className="mr-1 h-4 w-4" /> Preview</>}
                </Button>
                <Button variant="outline" size="sm" onClick={addMilestone} className="font-semibold border-slate-300">
                  <Plus className="mr-1 h-4 w-4" /> Add
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {!showPreview ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {milestones.map((milestone) => (
                  <div key={milestone.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-4 bg-white border-2 border-slate-200 rounded-lg hover:border-blue-300 transition-colors shadow-sm">
                    <div className="sm:col-span-3">
                      <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Milestone</Label>
                      <Input
                        value={milestone.title}
                        onChange={(e) => updateMilestone(milestone.id, 'title', e.target.value)}
                        className="mt-1 font-semibold text-slate-900 border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Date</Label>
                      <Input
                        type="date"
                        value={milestone.date}
                        onChange={(e) => updateMilestone(milestone.id, 'date', e.target.value)}
                        className="mt-1 font-semibold text-slate-900 border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Location</Label>
                      <Input
                        value={milestone.location}
                        onChange={(e) => updateMilestone(milestone.id, 'location', e.target.value)}
                        className="mt-1 font-semibold text-slate-900 border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        placeholder="City, Venue"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <Label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Notes</Label>
                      <Input
                        value={milestone.notes}
                        onChange={(e) => updateMilestone(milestone.id, 'notes', e.target.value)}
                        className="mt-1 font-semibold text-slate-900 border-2 border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                        placeholder="Details..."
                      />
                    </div>
                    <div className="sm:col-span-1 flex items-end justify-end gap-2">
                      <Checkbox
                        checked={milestone.hasEvidence}
                        onCheckedChange={(checked) => updateMilestone(milestone.id, 'hasEvidence', checked as boolean)}
                        className="mb-3 border-2 border-slate-500 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600 h-5 w-5"
                        title="Has evidence/photos"
                      />
                      <button onClick={() => removeMilestone(milestone.id)} className="mb-2 text-slate-500 hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 rounded-lg p-6 border-2 border-slate-200">
                <h3 className="font-bold text-slate-900 mb-4 text-center text-lg">Your Relationship Timeline</h3>
                <div className="space-y-4">
                  {milestones.filter(m => m.date).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((milestone, index) => (
                    <div key={milestone.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        {index < milestones.filter(m => m.date).length - 1 && <div className="w-0.5 h-full bg-blue-200 mt-2" />}
                      </div>
                      <div className="pb-6">
                        <p className="font-bold text-slate-900">{milestone.title}</p>
                        <p className="text-sm text-slate-600 font-medium">{new Date(milestone.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                        {milestone.location && <p className="text-sm text-slate-700">{milestone.location}</p>}
                        {milestone.notes && <p className="text-sm text-slate-600 mt-1">{milestone.notes}</p>}
                        {milestone.hasEvidence && <Badge variant="secondary" className="mt-2 text-xs font-semibold"><Camera className="h-3 w-3 mr-1" />Has Photos</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
                {milestones.filter(m => m.date).length === 0 && (
                  <p className="text-center text-slate-600 py-8 font-medium">Add dates to your milestones to see your timeline.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
