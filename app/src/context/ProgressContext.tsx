import { createContext, useContext, useEffect, useCallback, type ReactNode } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAuth } from '@/context/AuthContext';
import { topics } from '@/data/topics';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface ProgressContextType {
  reviewedTopics: string[];
  checkedItems: Record<string, string[]>;
  timelineData: any;
  markTopicReviewed: (topicId: string) => void;
  unmarkTopicReviewed: (topicId: string) => void;
  isTopicReviewed: (topicId: string) => boolean;
  toggleChecklistItem: (topicId: string, item: string) => void;
  isItemChecked: (topicId: string, item: string) => boolean;
  setTimelineData: (data: any) => void;
  getProgressPercentage: () => number;
  resetProgress: () => void;
}

const ProgressContext = createContext<ProgressContextType | null>(null);

export function useProgress() {
  const context = useContext(ProgressContext);
  if (!context) throw new Error('useProgress must be used within ProgressProvider');
  return context;
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [reviewedTopics, setReviewedTopics] = useLocalStorage<string[]>('interview-reviewed-topics-v2', []);
  const [checkedItems, setCheckedItems] = useLocalStorage<Record<string, string[]>>('interview-checklist-items-v2', {});
  const [timelineData, setTimelineDataLocal] = useLocalStorage<any>('interview-timeline-v2', null);
  const { user, token } = useAuth();

  const syncToServer = useCallback(async (rt: string[], ci: Record<string, string[]>, td: any) => {
    if (!token) return;
    try {
      await fetch(`${API_URL}/progress`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reviewedTopics: rt, checkedItems: ci, timelineData: td }),
      });
    } catch {}
  }, [token]);

  const loadFromServer = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/progress`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        if (data.reviewedTopics?.length) setReviewedTopics(data.reviewedTopics);
        if (data.checkedItems && Object.keys(data.checkedItems).length) setCheckedItems(data.checkedItems);
        if (data.timelineData) setTimelineDataLocal(data.timelineData);
      }
    } catch {}
  }, [token]);

  useEffect(() => {
    if (user && token) loadFromServer();
  }, [user, token]);

  const markTopicReviewed = (topicId: string) => {
    setReviewedTopics(prev => {
      if (prev.includes(topicId)) return prev;
      const next = [...prev, topicId];
      syncToServer(next, checkedItems, timelineData);
      return next;
    });
  };

  const unmarkTopicReviewed = (topicId: string) => {
    setReviewedTopics(prev => {
      const next = prev.filter(id => id !== topicId);
      syncToServer(next, checkedItems, timelineData);
      return next;
    });
  };

  const isTopicReviewed = (topicId: string) => reviewedTopics.includes(topicId);

  const toggleChecklistItem = (topicId: string, item: string) => {
    setCheckedItems(prev => {
      const topicChecks = prev[topicId] || [];
      const newChecks = topicChecks.includes(item) ? topicChecks.filter(i => i !== item) : [...topicChecks, item];
      const next = { ...prev, [topicId]: newChecks };
      syncToServer(reviewedTopics, next, timelineData);
      return next;
    });
  };

  const isItemChecked = (topicId: string, item: string) => (checkedItems[topicId] || []).includes(item);

  const setTimelineData = (data: any) => {
    setTimelineDataLocal(data);
    syncToServer(reviewedTopics, checkedItems, data);
  };

  const getProgressPercentage = () => Math.round((reviewedTopics.length / topics.length) * 100);

  const resetProgress = () => {
    setReviewedTopics([]);
    setCheckedItems({});
    setTimelineDataLocal(null);
    syncToServer([], {}, null);
  };

  return (
    <ProgressContext.Provider value={{ reviewedTopics, checkedItems, timelineData, markTopicReviewed, unmarkTopicReviewed, isTopicReviewed, toggleChecklistItem, isItemChecked, setTimelineData, getProgressPercentage, resetProgress }}>
      {children}
    </ProgressContext.Provider>
  );
}
