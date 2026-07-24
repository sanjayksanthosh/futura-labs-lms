import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, BrainCircuit, Send, History, Clock, BookOpen,
  Code2, Lightbulb, ArrowRight, MessageSquare, RefreshCw,
  ListTree, Copy, CheckCheck, ExternalLink
} from 'lucide-react';
import { useFetch, useMutate } from '../../hooks/useQuery';
import { aiService, courseService } from '../../services/endpoints';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export const AiDoubtSolver = () => {
  const [question, setQuestion] = useState('');
  const [topic, setTopic] = useState('');
  const [courseName, setCourseName] = useState('');
  const [context, setContext] = useState('');
  const [showContext, setShowContext] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('doubtHistory') || '[]'); } catch { return []; }
  });
  const [copiedIndex, setCopiedIndex] = useState(null);

  const { data: coursesData } = useFetch('courses-list-doubts', () => courseService.getAll({ limit: 50 }));
  const courses = coursesData?.data || [];

  const askMut = useMutate((d) => aiService.askDoubt(d));

  const handleAsk = async () => {
    if (!question.trim()) return toast.error('Enter your doubt/question');
    try {
      const res = await askMut.mutateAsync({
        question: question.trim(),
        topic: topic || undefined,
        context: context || undefined,
        courseName: courseName || undefined,
      });
      const entry = {
        id: Date.now(),
        question: question.trim(),
        topic: topic || courseName || 'General',
        answer: res.data,
        timestamp: new Date().toISOString(),
      };
      const updated = [entry, ...history].slice(0, 20);
      setHistory(updated);
      localStorage.setItem('doubtHistory', JSON.stringify(updated));
      setResult(entry);
      toast.success('Doubt answered!');
    } catch {
      toast.error('Failed to get answer. Try again.');
    }
  };

  const handleHistoryClick = (entry) => {
    setResult(entry);
    setQuestion(entry.question);
    setTopic(entry.topic === 'General' ? '' : entry.topic);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('doubtHistory');
    toast.success('History cleared');
  };

  const copyCode = (code, idx) => {
    navigator.clipboard.writeText(code);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const formatAnswer = (text) => {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    const safe = div.innerHTML;
    return safe
      .replace(/### (.+)/g, '<h3 class="text-lg font-bold mt-4 mb-2 text-slate-800 dark:text-slate-200">$1</h3>')
      .replace(/## (.+)/g, '<h2 class="text-xl font-bold mt-5 mb-2 text-slate-800 dark:text-slate-200">$1</h2>')
      .replace(/# (.+)/g, '<h1 class="text-2xl font-bold mt-6 mb-3 text-slate-800 dark:text-slate-200">$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-slate-800 dark:text-slate-200">$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono text-primary-600">$1</code>')
      .replace(/- (.+)/g, '<li class="ml-4 text-slate-600 dark:text-slate-400 list-disc">$1</li>')
      .replace(/\n\n/g, '</p><p class="text-slate-600 dark:text-slate-400 leading-relaxed mb-3">')
      .replace(/\n/g, '<br/>');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-purple-500" /> AI Doubt Solver
          </h1>
          <p className="text-slate-500">Ask questions about any topic and get AI-powered explanations</p>
        </div>
        <Badge variant="info" className="flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> Powered by Claude AI
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Ask Area */}
        <div className="lg:col-span-2 space-y-4">
          {/* Input Card */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <div>
              <label className="label">Topic <span className="text-slate-400 text-xs">(optional)</span></label>
              <div className="flex gap-2">
                <input value={topic} onChange={e => setTopic(e.target.value)}
                  className="input-field flex-1" placeholder="e.g., JavaScript, React, Machine Learning..." />
                <select value={courseName} onChange={e => setCourseName(e.target.value)}
                  className="input-field max-w-[200px]">
                  <option value="">From course...</option>
                  {courses.map(c => <option key={c._id} value={c.title}>{c.title}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Your Doubt / Question *</label>
              <textarea value={question} onChange={e => setQuestion(e.target.value)}
                className="input-field min-h-[120px]" placeholder="Type your doubt here... For example: 'What's the difference between let and var in JavaScript?' or 'Explain how React hooks work with a simple example'"
                onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleAsk(); }} />
            </div>
            <button onClick={() => setShowContext(!showContext)} className="text-xs text-primary-500 hover:underline flex items-center gap-1">
              <ListTree className="h-3 w-3" /> {showContext ? 'Hide' : 'Add'} additional context
            </button>
            {showContext && (
              <div>
                <label className="label">Additional Context <span className="text-slate-400 text-xs">(what you already know or tried)</span></label>
                <textarea value={context} onChange={e => setContext(e.target.value)}
                  className="input-field min-h-[80px]" placeholder="I understand the basics but I'm confused about..." />
              </div>
            )}
            <button onClick={handleAsk} disabled={askMut.isPending || !question.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-lg">
              {askMut.isPending ? (
                <><RefreshCw className="h-5 w-5 animate-spin" /> Getting Answer...</>
              ) : (
                <><Send className="h-5 w-5" /> Ask AI</>
              )}
            </button>
          </div>

          {/* Answer */}
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="glass rounded-2xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                    <BrainCircuit className="h-5 w-5 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">Answer</h3>
                      <Badge variant="info" className="text-xs">{result.topic}</Badge>
                      <span className="text-xs text-slate-400 ml-auto">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 italic">"{result.question}"</p>
                  </div>
                </div>

                <div className="prose prose-sm max-w-none text-slate-600 dark:text-slate-400 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formatAnswer(result.answer?.answer || '') }} />

                {/* Code Examples */}
                {result.answer?.codeExamples?.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h4 className="font-semibold flex items-center gap-2 text-sm">
                      <Code2 className="h-4 w-4 text-primary-500" /> Code Examples
                    </h4>
                    {result.answer.codeExamples.map((ex, i) => (
                      <div key={i} className="bg-slate-900 dark:bg-slate-950 rounded-xl overflow-hidden">
                        {ex.description && (
                          <div className="px-4 py-2 bg-slate-800 dark:bg-slate-900 border-b border-slate-700">
                            <span className="text-xs text-slate-400">{ex.description}</span>
                            <Badge variant="info" className="text-xs ml-2">{ex.language}</Badge>
                          </div>
                        )}
                        <div className="relative group">
                          <pre className="p-4 text-sm font-mono text-green-400 overflow-x-auto whitespace-pre-wrap">{ex.code}</pre>
                          <button onClick={() => copyCode(ex.code, `code_${i}`)}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
                            {copiedIndex === `code_${i}`
                              ? <CheckCheck className="h-4 w-4 text-green-400" />
                              : <Copy className="h-4 w-4 text-slate-400" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Key Takeaways */}
                {result.answer?.keyTakeaways?.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold flex items-center gap-2 text-sm mb-3">
                      <Lightbulb className="h-4 w-4 text-amber-500" /> Key Takeaways
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.answer.keyTakeaways.map((k, i) => (
                        <Badge key={i} variant="success" className="text-xs px-3 py-1">{k}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Related Topics */}
                {result.answer?.relatedTopics?.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold flex items-center gap-2 text-sm mb-2">
                      <BookOpen className="h-4 w-4 text-primary-500" /> Related Topics to Explore
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {result.answer.relatedTopics.map((t, i) => (
                        <Badge key={i} variant="info" className="text-xs">{t}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommended Resources */}
                {result.answer?.recommendedResources?.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-semibold flex items-center gap-2 text-sm mb-2">
                      <ExternalLink className="h-4 w-4 text-blue-500" /> Recommended Resources
                    </h4>
                    <ul className="space-y-1">
                      {result.answer.recommendedResources.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <ArrowRight className="h-3.5 w-3.5 text-primary-500 mt-0.5 shrink-0" /> {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <button onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="btn-secondary text-sm w-full flex items-center justify-center gap-2">
                <MessageSquare className="h-4 w-4" /> Ask Another Question
              </button>
            </motion.div>
          )}

          {/* Empty State */}
          {!result && (
            <div className="glass rounded-2xl p-10 text-center">
              <BrainCircuit className="h-16 w-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
              <h3 className="text-lg font-semibold mb-2">What would you like to learn?</h3>
              <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
                Ask any doubt about your courses. Get clear explanations with code examples, key takeaways, and related topics to explore.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
                {[
                  { q: "What's the difference between let, const, and var?", t: "JavaScript" },
                  { q: "Explain how React's useEffect hook works", t: "React" },
                  { q: "What is the difference between SQL and NoSQL?", t: "Databases" },
                ].map((s, i) => (
                  <button key={i} onClick={() => { setQuestion(s.q); setTopic(s.t); }}
                    className="glass rounded-xl p-3 text-left text-sm hover:shadow-md transition-all text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200">
                    <span className="text-primary-500 font-medium block text-xs mb-1">{s.t}</span>
                    {s.q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* History Sidebar */}
        <div className="lg:col-span-1">
          <div className="glass rounded-2xl p-4 lg:sticky lg:top-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold flex items-center gap-2 text-sm">
                <History className="h-4 w-4 text-primary-500" /> History
              </h3>
              {history.length > 0 && (
                <button onClick={clearHistory} className="text-xs text-red-500 hover:underline">Clear</button>
              )}
            </div>
            {history.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No doubts asked yet</p>
            ) : (
              <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
                {history.map((entry) => (
                  <button key={entry.id} onClick={() => handleHistoryClick(entry)}
                    className={`w-full text-left p-3 rounded-xl text-xs transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 ${result?.id === entry.id ? 'bg-primary-50 dark:bg-primary-900/10 border border-primary-200 dark:border-primary-800' : 'border border-transparent'}`}>
                    <div className="flex items-start gap-2">
                      <MessageSquare className="h-3 w-3 text-slate-400 mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{entry.question}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="info" className="text-[10px] px-1.5 py-0">{entry.topic}</Badge>
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(entry.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
