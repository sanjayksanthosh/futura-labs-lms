import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, BrainCircuit, Target, TrendingUp, AlertTriangle, RefreshCw,
  ArrowRight, CheckCircle, XCircle, BarChart3, BookOpen, Lightbulb
} from 'lucide-react';
import { useFetch, useMutate } from '../../hooks/useQuery';
import { aiService } from '../../services/endpoints';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Modal } from '../../components/ui/Modal';
import toast from 'react-hot-toast';

export const AiAdaptiveQuiz = () => {
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [showExplanation, setShowExplanation] = useState(null);
  const [started, setStarted] = useState(false);

  const { data: weakData, isLoading } = useFetch('weak-topics', () => aiService.getWeakTopics());
  const generateMut = useMutate((d) => aiService.generateRevision(d));

  const weakTopics = weakData?.data || [];

  const handleGenerateQuiz = async (topic) => {
    try {
      const res = await generateMut.mutateAsync({
        topic: topic || 'General',
        weakTopics: weakTopics.filter(t => t.isWeak).map(t => t.topic),
        count: 5,
      });
      setQuiz(res.data);
      setStarted(true);
      setSubmitted(false);
      setResult(null);
      setAnswers({});
      setCurrentQ(0);
    } catch { toast.error('Failed to generate quiz'); }
  };

  const handleAnswer = (answer) => {
    if (!quiz?.questions?.[currentQ]) return;
    setAnswers(prev => ({ ...prev, [quiz.questions[currentQ]._id || currentQ]: answer }));
  };

  const handleSubmit = () => {
    const questions = quiz.questions || [];
    let correct = 0;
    const graded = questions.map((q, i) => {
      const userAns = answers[q._id || i];
      const isCorrect = q.correctAnswer
        ? userAns?.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()
        : false;
      if (isCorrect) correct++;
      return { ...q, userAnswer: userAns, isCorrect };
    });
    const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
    setResult({ score, correct, total: questions.length, graded });
    setSubmitted(true);
  };

  if (!started) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-purple-500" /> Adaptive AI Quiz
          </h1>
          <p className="text-slate-500">Personalized quizzes that adapt to your skill level</p>
        </div>

        {/* Weak Topics */}
        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold flex items-center gap-2 mb-4"><Target className="h-5 w-5 text-primary-500" /> Your Performance by Topic</h3>
          {isLoading ? <LoadingSpinner className="py-6" /> : weakTopics.length === 0 ? (
            <p className="text-slate-500 text-center py-6">No quiz history yet. Take some quizzes to get personalized recommendations.</p>
          ) : (
            <div className="space-y-3">
              {weakTopics.map((t, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium capitalize">{t.topic}</span>
                      {t.isWeak && <Badge variant="danger" className="text-xs">Needs Improvement</Badge>}
                    </div>
                    <ProgressBar value={t.score} max={100} size="sm" />
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm font-bold">{t.score}%</p>
                    <p className="text-xs text-slate-400">{t.attempts} attempts</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Generate Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass rounded-2xl p-6 text-center hover:shadow-lg transition-all cursor-pointer" onClick={() => handleGenerateQuiz('')}>
            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-900/20 w-fit mx-auto mb-3"><Sparkles className="h-6 w-6 text-purple-500" /></div>
            <h3 className="font-semibold text-sm mb-1">Revision Quiz</h3>
            <p className="text-xs text-slate-500">Focus on your weak areas</p>
          </div>
          <div className="glass rounded-2xl p-6 text-center hover:shadow-lg transition-all cursor-pointer" onClick={() => handleGenerateQuiz('general')}>
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 w-fit mx-auto mb-3"><TrendingUp className="h-6 w-6 text-blue-500" /></div>
            <h3 className="font-semibold text-sm mb-1">General Quiz</h3>
            <p className="text-xs text-slate-500">Test overall knowledge</p>
          </div>
          <div className="glass rounded-2xl p-6 text-center hover:shadow-lg transition-all cursor-pointer" onClick={() => handleGenerateQuiz(weakTopics[0]?.topic || '')}>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 w-fit mx-auto mb-3"><AlertTriangle className="h-6 w-6 text-amber-500" /></div>
            <h3 className="font-semibold text-sm mb-1">Weakest Topic</h3>
            <p className="text-xs text-slate-500">{weakTopics[0]?.topic || 'No data'} ({weakTopics[0]?.score || 0}%)</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (submitted && result) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-6">
        <div className={`glass rounded-3xl p-6 text-center ${result.score >= 60 ? 'border-green-500/30' : 'border-red-500/30'}`}>
          <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${result.score >= 60 ? 'bg-green-100 dark:bg-green-900/20' : 'bg-amber-100 dark:bg-amber-900/20'}`}>
            {result.score >= 60 ? <CheckCircle className="h-10 w-10 text-green-500" /> : <AlertTriangle className="h-10 w-10 text-amber-500" />}
          </div>
          <h2 className="text-2xl font-bold mb-1">{result.score >= 60 ? 'Great Job!' : 'Keep Practicing'}</h2>
          <p className="text-slate-500 mb-4">{result.score}% - {result.correct}/{result.total} correct</p>
          <ProgressBar value={result.score} max={100} className="mb-4" />
          <div className="flex gap-2 justify-center">
            <button onClick={() => handleGenerateQuiz('')} className="btn-primary flex items-center gap-2"><RefreshCw className="h-4 w-4" /> New Quiz</button>
            <button onClick={() => { setStarted(false); setQuiz(null); }} className="btn-secondary">Back</button>
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Detailed Review</h3>
          <div className="space-y-3">
            {result.graded.map((q, i) => (
              <div key={i} className={`p-4 rounded-xl border ${q.isCorrect ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10' : 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10'}`}>
                <div className="flex items-start gap-2">
                  {q.isCorrect ? <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" /> : <XCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{q.question}</p>
                    {!q.isCorrect && <p className="text-xs text-green-600 mt-1">Correct answer: {q.correctAnswer}</p>}
                    {q.explanation && (
                      <details className="mt-1">
                        <summary className="text-xs text-primary-500 cursor-pointer">Explanation</summary>
                        <p className="text-xs text-slate-500 mt-1">{q.explanation}</p>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  const questions = quiz?.questions || [];
  const question = questions[currentQ];
  if (!question) return <LoadingSpinner className="py-20" />;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-4">
      <div className="glass rounded-2xl p-4 flex items-center justify-between">
        <div><h2 className="font-bold text-lg">{quiz.title}</h2><p className="text-xs text-slate-500">{questions.length} questions</p></div>
        <Badge variant="info">{Object.keys(answers).length}/{questions.length} Answered</Badge>
      </div>
      <ProgressBar value={Object.keys(answers).length} max={questions.length} />

      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <Badge variant="warning">Question {currentQ + 1} of {questions.length}</Badge>
        </div>
        <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
        <div className="space-y-3">
          {question.options?.map((opt, oi) => {
            const selected = answers[question._id || currentQ] === opt;
            return (
              <button key={oi} onClick={() => handleAnswer(opt)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selected ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selected ? 'border-primary-500 bg-primary-500' : 'border-slate-300'}`}>
                    {selected && <CheckCircle className="h-3 w-3 text-white" />}
                  </div>
                  <span className="text-sm">{opt}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between">
        <button disabled={currentQ === 0} onClick={() => setCurrentQ(q => q - 1)} className="btn-secondary disabled:opacity-50">Previous</button>
        {currentQ === questions.length - 1 ? (
          <button onClick={handleSubmit} className="btn-primary flex items-center gap-2"><BarChart3 className="h-4 w-4" /> Submit</button>
        ) : (
          <button onClick={() => setCurrentQ(q => q + 1)} className="btn-primary flex items-center gap-2">Next <ArrowRight className="h-4 w-4" /></button>
        )}
      </div>
    </motion.div>
  );
};
