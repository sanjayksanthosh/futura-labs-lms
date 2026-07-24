import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Target, AlertTriangle, CheckCircle, TrendingUp, BrainCircuit,
  Sparkles, BookOpen, ArrowRight, RefreshCw
} from 'lucide-react';
import { useFetch, useMutate } from '../../hooks/useQuery';
import { aiService } from '../../services/endpoints';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const AiWeakTopics = () => {
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useFetch('weak-topics-analysis', () => aiService.getWeakTopics());
  const generateMut = useMutate((d) => aiService.generateRevision(d));

  const topics = data?.data || [];

  const handleGenerateRevision = async (topic) => {
    try {
      await generateMut.mutateAsync({ topic, weakTopics: [topic], count: 5 });
      navigate('/ai/adaptive-quiz');
    } catch {}
  };

  if (isLoading) return <LoadingSpinner className="py-20" />;

  const weakTopics = topics.filter(t => t.isWeak);
  const strongTopics = topics.filter(t => !t.isWeak);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-purple-500" /> Weak Topic Analysis
          </h1>
          <p className="text-slate-500">AI identifies areas where you need improvement based on quiz performance</p>
        </div>
        <button onClick={() => refetch()} className="btn-secondary text-sm flex items-center gap-1"><RefreshCw className="h-4 w-4" /> Refresh</button>
      </div>

      {topics.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <BrainCircuit className="h-12 w-12 mx-auto mb-3 text-slate-300" />
          <p className="text-lg font-medium mb-1">No performance data yet</p>
          <p className="text-sm text-slate-500 mb-4">Take some quizzes to get personalized topic analysis</p>
          <button onClick={() => navigate('/ai/adaptive-quiz')} className="btn-primary">Take Your First Quiz</button>
        </div>
      ) : (
        <>
          {/* Weak Topics Warning */}
          {weakTopics.length > 0 && (
            <div className="glass rounded-2xl p-6 border-l-4 border-red-500">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-red-500 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-1">Topics Needing Attention ({weakTopics.length})</h3>
                  <p className="text-sm text-slate-500 mb-4">These topics scored below 60%. Focus your revision here.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {weakTopics.map((t, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-xl">
                        <div>
                          <p className="text-sm font-medium capitalize">{t.topic}</p>
                          <p className="text-xs text-slate-500">{t.attempts} attempts</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-red-500">{t.score}%</span>
                          <button onClick={() => handleGenerateRevision(t.topic)} className="p-1.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
                            <Sparkles className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Performance Chart */}
          <div className="glass rounded-2xl p-6">
            <h3 className="section-title flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Topic Performance Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="topic" stroke="#94a3b8" tickFormatter={(v) => v.substring(0, 10)} />
                <YAxis stroke="#94a3b8" domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                  {topics.map((entry, idx) => (
                    <Cell key={idx} fill={entry.isWeak ? '#ef4444' : '#22c55e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Strong Topics */}
          {strongTopics.length > 0 && (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-4"><CheckCircle className="h-5 w-5 text-green-500" /> Strong Areas ({strongTopics.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {strongTopics.map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/10 rounded-xl">
                    <span className="text-sm font-medium capitalize">{t.topic}</span>
                    <span className="text-sm font-bold text-green-500">{t.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="glass rounded-2xl p-6 bg-gradient-to-br from-primary-50 to-purple-50 dark:from-primary-900/10 dark:to-purple-900/10">
            <h3 className="font-semibold flex items-center gap-2 mb-3"><BrainCircuit className="h-5 w-5 text-purple-500" /> AI Recommendations</h3>
            <div className="space-y-3">
              {weakTopics.length > 0 ? (
                <>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Based on your performance, we recommend focusing on: <strong>{weakTopics.map(t => t.topic).join(', ')}</strong></p>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => handleGenerateRevision(weakTopics[0]?.topic)} className="btn-primary text-sm flex items-center gap-1">
                      <Sparkles className="h-4 w-4" /> Generate Revision Quiz
                    </button>
                    <button onClick={() => navigate('/student/courses')} className="btn-secondary text-sm flex items-center gap-1">
                      <BookOpen className="h-4 w-4" /> Review Course Content
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-600 dark:text-slate-400">Great job! You're performing well across all topics. Consider exploring advanced content.</p>
              )}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};
