import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BrainCircuit, Play, Clock, CheckCircle } from 'lucide-react';
import { useFetch } from '../../hooks/useQuery';
import { quizService } from '../../services/endpoints';
import { StatsCard } from '../../components/ui/StatsCard';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export const StudentQuizzes = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useFetch('student-quizzes-list', () => quizService.getAll({ limit: 50 }));

  const quizzes = data?.data || [];
  const attempted = quizzes.filter(q => q.attempted).length;
  const avgScore = (() => {
    const scored = quizzes.filter(q => q.attempted && q.bestScore != null);
    return scored.length > 0 ? Math.round(scored.reduce((s, q) => s + q.bestScore, 0) / scored.length) : 0;
  })();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div><h1 className="text-2xl font-bold">Quizzes</h1><p className="text-slate-500">Test your knowledge</p></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Available" value={quizzes.length} icon={BrainCircuit} color="primary" />
        <StatsCard title="Attempted" value={attempted} icon={CheckCircle} color="secondary" />
        <StatsCard title="Avg Score" value={avgScore} icon={BrainCircuit} color="accent" suffix="%" />
      </div>

      {isLoading ? <LoadingSpinner className="py-10" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((q) => (
            <div key={q._id} className="glass rounded-2xl p-5 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-primary-50 dark:bg-primary-900/20"><BrainCircuit className="h-5 w-5 text-primary-500" /></div>
                <Badge variant={q.attempted ? 'info' : 'success'} className="text-xs">{q.attempted ? 'Attempted' : 'New'}</Badge>
              </div>
              <h3 className="font-semibold text-sm mb-1">{q.title}</h3>
              <p className="text-xs text-slate-500 mb-3">{q.questions?.length || 0} questions • {q.timeLimit ? `${q.timeLimit} min` : 'No time limit'} • Pass: {q.passingScore}%</p>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                <Clock className="h-3 w-3" /> {q.maxAttempts || '∞'} attempts
                {q.attempted && q.bestScore != null && <span className="ml-auto font-medium text-primary-500">Best: {q.bestScore}%</span>}
              </div>
              <button onClick={() => navigate(`/quiz/take/${q._id}`)} className="btn-primary w-full text-sm py-2 flex items-center justify-center gap-2">
                <Play className="h-4 w-4" /> {q.attempted ? 'Retake' : 'Start Quiz'}
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
