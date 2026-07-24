import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFetch, useMutate } from '../../hooks/useQuery';
import { quizService } from '../../services/endpoints';
import {
  Clock, AlertCircle, CheckCircle, XCircle, ArrowLeft, ArrowRight,
  Send, BarChart3, Trophy, Target, HelpCircle
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ProgressBar } from '../../components/ui/ProgressBar';

export const QuizTaking = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const { data: quizData, isLoading } = useFetch(['quiz-take', quizId], () => quizService.getById(quizId));
  const submitMut = useMutate((d) => quizService.submit(quizId, d), {
    invalidateKeys: ['quiz-take', quizId],
  });

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const answersRef = useRef({});

  const quiz = quizData?.data || {};
  const questions = quiz.questions || [];
  const totalQ = questions.length;

  useEffect(() => {
    if (quiz.timeLimit) {
      setTimeLeft(quiz.timeLimit * 60);
    }
  }, [quiz.timeLimit]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submitted) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  useEffect(() => {
    if (timeLeft === 0 && !submitted) {
      handleSubmit();
    }
  }, [timeLeft, submitted, handleSubmit]);

  const handleAnswer = (questionId, answer) => {
    const updated = { ...answersRef.current, [questionId]: answer };
    answersRef.current = updated;
    setAnswers(updated);
  };

  const handleSubmit = useCallback(async () => {
    if (submitted) return;
    setSubmitted(true);
    try {
      const answersArray = Object.entries(answersRef.current).map(([questionId, selectedAnswer]) => ({
        questionId,
        selectedAnswer,
      }));
      const res = await submitMut.mutateAsync({ answers: answersArray });
      setResult(res.data);
    } catch (e) {
      setSubmitted(false);
    }
  }, [submitMut, submitted]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (isLoading) return <LoadingSpinner className="py-20" />;

  if (submitted && result) {
    const passed = result.score >= (quiz.passingScore || 50);
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto">
        <div className={`glass rounded-3xl p-8 text-center ${passed ? 'border-green-500/30' : 'border-red-500/30'}`}>
          <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center ${
            passed ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
          }`}>
            {passed ? <Trophy className="h-12 w-12 text-green-500" /> : <XCircle className="h-12 w-12 text-red-500" />}
          </div>
          <h2 className="text-3xl font-bold mb-2">{passed ? 'Congratulations!' : 'Try Again'}</h2>
          <p className="text-slate-500 mb-6">{passed ? 'You passed the quiz!' : 'You didn\'t pass this time.'}</p>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="glass rounded-xl p-4">
              <p className="text-2xl font-bold text-primary-500">{result.score}%</p>
              <p className="text-xs text-slate-500">Score</p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-2xl font-bold text-green-500">{result.correctAnswers || 0}</p>
              <p className="text-xs text-slate-500">Correct</p>
            </div>
            <div className="glass rounded-xl p-4">
              <p className="text-2xl font-bold text-red-500">{result.incorrectAnswers || 0}</p>
              <p className="text-xs text-slate-500">Wrong</p>
            </div>
          </div>
          {result.totalPoints && (
            <div className="glass rounded-xl p-4 mb-6">
              <p className="text-sm text-slate-500">Points: {result.pointsEarned || 0} / {result.totalPoints}</p>
              <ProgressBar value={result.pointsEarned || 0} max={result.totalPoints} />
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate(-1)} className="btn-secondary">Back</button>
            {!passed && <button onClick={() => { setSubmitted(false); setAnswers({}); setCurrentQ(0); }} className="btn-primary">Retry</button>}
          </div>
        </div>
      </motion.div>
    );
  }

  if (!quiz || !totalQ) {
    return (
      <div className="text-center py-20">
        <HelpCircle className="h-12 w-12 mx-auto mb-3 text-slate-300" />
        <p className="text-slate-500">Quiz not found or has no questions</p>
      </div>
    );
  }

  const question = questions[currentQ];
  const answeredCount = Object.keys(answers).length;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="glass rounded-2xl p-4 mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-bold text-lg">{quiz.title}</h1>
          <p className="text-xs text-slate-500">{totalQ} questions</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="info">{answeredCount}/{totalQ} Answered</Badge>
          {timeLeft !== null && (
            <div className={`flex items-center gap-1 font-mono text-sm ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-slate-500'}`}>
              <Clock className="h-4 w-4" /> {formatTime(timeLeft)}
            </div>
          )}
        </div>
      </div>

      {/* Progress */}
      <ProgressBar value={answeredCount} max={totalQ} className="mb-4" />

      {/* Question */}
      <motion.div key={currentQ} initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="glass rounded-2xl p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <Badge variant="warning">Question {currentQ + 1} of {totalQ}</Badge>
          {question.type === 'mcq' && (
            <span className="text-xs text-slate-400">Select one answer</span>
          )}
          {question.type === 'multiple_select' && (
            <span className="text-xs text-slate-400">Select all that apply</span>
          )}
        </div>
        <h3 className="text-lg font-semibold mb-4">{question.question}</h3>

        <div className="space-y-3">
          {question.options?.map((option, oi) => {
            const isSelected = Array.isArray(answers[question._id])
              ? answers[question._id]?.includes(option)
              : answers[question._id] === option;

            return (
              <button
                key={oi}
                onClick={() => {
                  if (question.type === 'multiple_select') {
                    const current = answers[question._id] || [];
                    handleAnswer(question._id,
                      current.includes(option) ? current.filter(o => o !== option) : [...current, option]
                    );
                  } else {
                    handleAnswer(question._id, option);
                  }
                }}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-primary-500 bg-primary-500' : 'border-slate-300'
                  }`}>
                    {isSelected && <CheckCircle className="h-3 w-3 text-white" />}
                  </div>
                  <span className="text-sm">{option}</span>
                </div>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          disabled={currentQ === 0}
          onClick={() => setCurrentQ(q => q - 1)}
          className="btn-secondary flex items-center gap-2 disabled:opacity-50"
        >
          <ArrowLeft className="h-4 w-4" /> Previous
        </button>

        {currentQ === totalQ - 1 ? (
          <button onClick={handleSubmit} className="btn-primary flex items-center gap-2">
            <Send className="h-4 w-4" /> Submit Quiz
          </button>
        ) : (
          <button onClick={() => setCurrentQ(q => q + 1)} className="btn-primary flex items-center gap-2">
            Next <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
};
