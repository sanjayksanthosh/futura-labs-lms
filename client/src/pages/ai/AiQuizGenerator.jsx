import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, BrainCircuit, Save, RefreshCw, Settings2, BookOpen,
  FileText, Video, Sliders, ChevronDown, ChevronRight, CheckCircle, X, Edit3
} from 'lucide-react';
import { useFetch, useMutate } from '../../hooks/useQuery';
import { aiService, courseService } from '../../services/endpoints';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

export const AiQuizGenerator = () => {
  const [step, setStep] = useState('configure');
  const [form, setForm] = useState({
    topic: '', difficulty: 'intermediate', count: 5, type: 'mcq',
    content: '', timeLimit: 30, course: '', lesson: '',
  });
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [editingQuestions, setEditingQuestions] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState('generate');

  const generateMut = useMutate((d) => aiService.generateQuiz(d));
  const saveMut = useMutate((d) => aiService.saveQuiz(d), { invalidateKeys: ['quizzes'] });
  const { data: coursesData } = useFetch('courses-list', () => courseService.getAll({ limit: 50 }));

  const courses = coursesData?.data || [];

  const handleGenerate = async () => {
    if (!form.topic && !form.content) return toast.error('Enter a topic or content');
    setStep('generating');
    try {
      const res = await generateMut.mutateAsync(form);
      setGeneratedQuiz(res.data);
      setQuestions(res.data.questions || []);
      setStep('preview');
      toast.success('Quiz generated!');
    } catch { setStep('configure'); toast.error('Generation failed'); }
  };

  const handleSave = () => {
    saveMut.mutate({
      generatedData: { ...generatedQuiz, questions },
      course: form.course,
      timeLimit: form.timeLimit,
      passingScore: form.passingScore || 40,
    });
    toast.success('Quiz saved!');
    setStep('configure');
    setGeneratedQuiz(null);
  };

  const updateQuestion = (i, field, value) => {
    const qs = [...questions];
    qs[i] = { ...qs[i], [field]: value };
    setQuestions(qs);
  };

  const updateOption = (qi, oi, value) => {
    const qs = [...questions];
    qs[qi].options[oi] = value;
    setQuestions(qs);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-500" /> AI Quiz Generator
          </h1>
          <p className="text-slate-500">Generate quizzes instantly using artificial intelligence</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="info" className="flex items-center gap-1">
            <BrainCircuit className="h-3 w-3" /> Powered by AI
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
        {[
          { id: 'generate', icon: Sparkles, label: 'Generate Quiz' },
          { id: 'from-content', icon: FileText, label: 'From Content' },
          { id: 'from-lesson', icon: BookOpen, label: 'From Lesson' },
        ].map((t) => (
          <button key={t.id} onClick={() => { setActiveTab(t.id); setStep('configure'); setGeneratedQuiz(null); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-colors ${activeTab === t.id ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 border border-primary-200 dark:border-primary-800' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Configure Step */}
      {step === 'configure' && (
        <div className="glass rounded-2xl p-6 space-y-5">
          <h3 className="font-semibold flex items-center gap-2"><Settings2 className="h-4 w-4 text-primary-500" /> Configure Quiz Settings</h3>
          {activeTab === 'generate' && (
            <div>
              <label className="label">Topic *</label>
              <input value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} className="input-field" placeholder="e.g., JavaScript Promises, Machine Learning, React Hooks..." />
            </div>
          )}
          {activeTab === 'from-content' && (
            <div>
              <label className="label">Content / Notes</label>
              <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} className="input-field min-h-[150px]" placeholder="Paste your notes, lesson content, or any text to generate a quiz from..." />
            </div>
          )}
          {activeTab === 'from-lesson' && (
            <div>
              <label className="label">Select Lesson</label>
              <select className="input-field" onChange={e => setForm(f => ({ ...f, lesson: e.target.value }))}>
                <option value="">Select a lesson</option>
                {courses.flatMap(c => c.modules || []).flatMap(m => m.lessons || []).map((l, i) => (
                  <option key={l._id || i} value={l._id}>{l.title}</option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="label">Difficulty</label>
              <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))} className="input-field">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="label">Question Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input-field">
                <option value="mcq">MCQ Only</option>
                <option value="mixed">Mixed (MCQ + Descriptive)</option>
                <option value="descriptive">Descriptive</option>
              </select>
            </div>
            <div>
              <label className="label">Number of Questions</label>
                <input type="number" min={1} max={20} value={form.count} onChange={e => setForm(f => ({ ...f, count: parseInt(e.target.value) || 5 }))} className="input-field" />
            </div>
            <div>
              <label className="label">Time Limit (min)</label>
              <input type="number" min={1} value={form.timeLimit} onChange={e => setForm(f => ({ ...f, timeLimit: parseInt(e.target.value) || 30 }))} className="input-field" />
            </div>
          </div>
          <div>
            <label className="label">Course (optional)</label>
            <select value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))} className="input-field">
              <option value="">General (no course)</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
            </select>
          </div>
          <button onClick={handleGenerate} disabled={generateMut.isPending} className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-lg">
            {generateMut.isPending ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            {generateMut.isPending ? 'Generating...' : 'Generate Quiz with AI'}
          </button>
        </div>
      )}

      {/* Loading */}
      {step === 'generating' && (
        <div className="glass rounded-2xl p-12 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-lg font-medium">AI is generating your quiz...</p>
          <p className="text-sm text-slate-500">Analyzing topic and creating questions with explanations</p>
          {generateMut.data?.data?.questions && (
            <button onClick={() => { setGeneratedQuiz(generateMut.data.data); setQuestions(generateMut.data.data.questions || []); setStep('preview'); }} className="btn-primary mt-4">Show Results</button>
          )}
        </div>
      )}

      {/* Preview / Edit Step */}
      {step === 'preview' && generatedQuiz && (
        <div className="space-y-6">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">{generatedQuiz.title}</h2>
                <p className="text-sm text-slate-500">{generatedQuiz.description}</p>
              </div>
              <button onClick={() => setEditingQuestions(!editingQuestions)} className="btn-secondary text-sm flex items-center gap-1">
                <Edit3 className="h-4 w-4" /> {editingQuestions ? 'Done Editing' : 'Edit Questions'}
              </button>
            </div>
            <div className="flex gap-2 mb-4">
              <Badge variant="info">{generatedQuiz.questions?.length || 0} questions</Badge>
              <Badge variant="success">{generatedQuiz.totalPoints || 0} points</Badge>
              <Badge variant="warning" className="capitalize">{form.difficulty}</Badge>
            </div>

            {generatedQuiz.metadata?.generatedBy === 'fallback' && (
              <p className="text-xs text-amber-500 mb-2">Note: Using AI simulation. Connect OpenAI API key for real AI generation.</p>
            )}

            {/* Questions */}
            <div className="space-y-4">
              {(editingQuestions ? questions : generatedQuiz.questions).map((q, i) => (
                <div key={q._id || i} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xs font-bold text-primary-500 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-full shrink-0 mt-1">Q{i + 1}</span>
                    <div className="flex-1">
                      {editingQuestions ? (
                        <input value={q.question} onChange={e => updateQuestion(i, 'question', e.target.value)} className="input-field text-sm font-medium mb-2" />
                      ) : (
                        <p className="font-medium text-sm mb-2">{q.question}</p>
                      )}
                      {q.options?.length > 0 && (
                        <div className="space-y-1 mb-2">
                          {q.options.map((opt, oi) => (
                            <div key={oi} className="flex items-center gap-2">
                              {editingQuestions ? (
                                <div className="flex items-center gap-2 flex-1">
                                  <input type="radio" checked={q.correctAnswer === opt} onChange={() => updateQuestion(i, 'correctAnswer', opt)} />
                                  <input value={opt} onChange={e => updateOption(i, oi, e.target.value)} className="input-field text-xs flex-1" />
                                </div>
                              ) : (
                                <div className={`flex items-center gap-2 text-sm p-2 rounded-lg w-full ${q.correctAnswer === opt ? 'bg-green-50 dark:bg-green-900/20 text-green-700 border border-green-200' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
                                  <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${q.correctAnswer === opt ? 'border-green-500 bg-green-500' : 'border-slate-300'}`}>
                                    {q.correctAnswer === opt && <CheckCircle className="h-3 w-3 text-white" />}
                                  </div>
                                  <span className={q.correctAnswer === opt ? 'font-medium' : ''}>{opt}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {editingQuestions && q.type === 'descriptive' && (
                        <Badge variant="info" className="text-xs">Descriptive • {q.points || 10} pts</Badge>
                      )}
                      {!editingQuestions && q.explanation && (
                        <details className="text-xs text-slate-500 mt-2">
                          <summary className="cursor-pointer text-primary-500 hover:underline">View Explanation</summary>
                          <p className="mt-1 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">{q.explanation}</p>
                        </details>
                      )}
                    </div>
                  </div>
                  {editingQuestions && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-xs text-slate-500">Points:</span>
                      <input type="number" value={q.points || 5} onChange={e => updateQuestion(i, 'points', parseInt(e.target.value) || 5)} className="input-field w-16 text-xs" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
              <Save className="h-5 w-5" /> Save Quiz
            </button>
            <button onClick={() => { setStep('configure'); setGeneratedQuiz(null); }} className="btn-secondary flex items-center gap-2 px-6">
              <RefreshCw className="h-4 w-4" /> Regenerate
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
