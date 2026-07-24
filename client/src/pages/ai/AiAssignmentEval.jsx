import { useState } from 'react';
import { motion } from 'framer-motion';
import { useFetch, useMutate } from '../../hooks/useQuery';
import { assignmentService, aiService } from '../../services/endpoints';
import {
  Sparkles, FileText, Upload, CheckCircle, XCircle, AlertTriangle,
  BrainCircuit, Download, Eye, BarChart3, Target, Lightbulb, TrendingUp,
  Award, Star, MessageSquare, Code, ArrowRight
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Modal } from '../../components/ui/Modal';
import toast from 'react-hot-toast';

export const AiAssignmentEval = () => {
  const [page, setPage] = useState(1);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  const { data, isLoading } = useFetch(['submissions-ai', page], () =>
    assignmentService.getAll({ page, limit: 10, status: 'submitted' })
  );
  const evaluateMut = useMutate(({ id, data }) => aiService.evaluateAssignment(id, data), {
    invalidateKeys: ['submissions-ai'],
  });

  const submissions = data?.data || [];

  const handleEvaluate = async (submission) => {
    setEvaluating(true);
    setSelectedSubmission(submission);
    try {
      const res = await evaluateMut.mutateAsync({ id: submission._id, data: {} });
      const sub = res.data?.data || res.data;
      const aiData = sub.aiFeedback ? JSON.parse(sub.aiFeedback) : {};
      setEvaluation({ ...sub, ...aiData, totalPoints: sub.maxScore });
      toast.success('Assignment evaluated!');
    } catch { toast.error('Evaluation failed'); }
    setEvaluating(false);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-purple-500" /> AI Assignment Evaluator
          </h1>
          <p className="text-slate-500">Automatically evaluate student submissions with AI</p>
        </div>
      </div>

      {/* Pending Submissions */}
      <div className="space-y-3">
        {isLoading ? <LoadingSpinner className="py-10" /> : submissions.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <Upload className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500">No pending submissions for evaluation</p>
          </div>
        ) : submissions.map((sub) => (
          <div key={sub._id} className="glass rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <FileText className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">{sub.assignment?.title || 'Assignment'}</h3>
                  <p className="text-xs text-slate-500">Submitted by {sub.student?.name || 'Unknown'} • {sub.assignment?.course?.title || 'General'}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {sub.files?.[0]?.url && <a href={sub.files[0].url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-500 flex items-center gap-1"><Download className="h-3 w-3" /> View File</a>}
                    {sub.textSubmission && <span className="text-xs text-slate-400">{sub.textSubmission.substring(0, 50)}...</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="warning" className="text-xs">Pending</Badge>
                <button onClick={() => handleEvaluate(sub)} disabled={evaluateMut.isPending}
                  className="btn-primary text-sm py-1.5 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" /> Evaluate
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Evaluation Result */}
      {evaluation && (
        <Modal isOpen={!!evaluation} onClose={() => { setEvaluation(null); setSelectedSubmission(null); }} title="AI Evaluation Result" size="2xl">
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Score */}
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl">
              <div className={`text-5xl font-bold mb-2 ${getScoreColor(evaluation.score)}`}>{evaluation.score || 0}<span className="text-2xl">/{evaluation.totalPoints || 100}</span></div>
              <p className="text-slate-500">AI Score</p>
              <div className="flex justify-center gap-4 mt-4">
                <Badge variant={evaluation.score >= 70 ? 'success' : evaluation.score >= 40 ? 'warning' : 'danger'} className="text-sm px-4 py-1">
                  {evaluation.score >= 80 ? 'Excellent' : evaluation.score >= 60 ? 'Good' : evaluation.score >= 40 ? 'Average' : 'Needs Improvement'}
                </Badge>
              </div>
            </div>

            {/* Scores by Category */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { label: 'Concept Understanding', value: evaluation.conceptUnderstanding, icon: BrainCircuit },
                { label: 'Completion Quality', value: evaluation.completionQuality, icon: CheckCircle },
                { label: 'Presentation Structure', value: evaluation.presentationStructure, icon: FileText },
                { label: 'Practical Understanding', value: evaluation.practicalUnderstanding, icon: TrendingUp },
                { label: 'Code Quality', value: evaluation.codeQuality, icon: Code },
              ].filter(s => s.value != null).map((s, i) => (
                <div key={i} className="glass rounded-xl p-3 text-center">
                  <s.icon className="h-4 w-4 mx-auto mb-1 text-primary-500" />
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <p className={`text-lg font-bold ${getScoreColor(s.value)}`}>{s.value}%</p>
                </div>
              ))}
            </div>

            {/* Feedback */}
            {evaluation.feedback && (
              <div className="glass rounded-xl p-4">
                <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><MessageSquare className="h-4 w-4 text-primary-500" /> AI Feedback</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{evaluation.feedback}</p>
              </div>
            )}

            {/* Strengths */}
            {evaluation.strengths?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><Star className="h-4 w-4 text-green-500" /> Strengths</h4>
                <div className="flex flex-wrap gap-2">
                  {evaluation.strengths.map((s, i) => <Badge key={i} variant="success" className="text-xs">{s}</Badge>)}
                </div>
              </div>
            )}

            {/* Improvements */}
            {evaluation.improvements?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><Lightbulb className="h-4 w-4 text-amber-500" /> Suggested Improvements</h4>
                <ul className="space-y-1">
                  {evaluation.improvements.map((imp, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <ArrowRight className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" /> {imp}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Weak Areas */}
            {evaluation.weakAreas?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm flex items-center gap-2 mb-2"><AlertTriangle className="h-4 w-4 text-red-500" /> Weak Areas</h4>
                <div className="flex flex-wrap gap-2">
                  {evaluation.weakAreas.map((w, i) => <Badge key={i} variant="danger" className="text-xs">{w}</Badge>)}
                </div>
              </div>
            )}

            {/* Mentor Recommendation */}
            {evaluation.mentorRecommendation && (
              <div className="glass rounded-xl p-4 border-l-4 border-primary-500">
                <h4 className="font-semibold text-sm flex items-center gap-2 mb-1"><Award className="h-4 w-4 text-primary-500" /> Mentor Recommendation</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{evaluation.mentorRecommendation}</p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </motion.div>
  );
};
