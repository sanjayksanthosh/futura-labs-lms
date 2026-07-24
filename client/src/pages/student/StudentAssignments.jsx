import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardCheck, Upload, ExternalLink, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useFetch } from '../../hooks/useQuery';
import { assignmentService } from '../../services/endpoints';
import { StatsCard } from '../../components/ui/StatsCard';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatDate, timeAgo } from '../../utils/helpers';
import { cn } from '../../utils/cn';

export const StudentAssignments = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useFetch('student-assignments-list', () => assignmentService.getAll({ limit: 50 }));
  const assignments = data?.data || [];

  const pending = assignments.filter(a => !a.submission);
  const submitted = assignments.filter(a => a.submission?.status === 'submitted');
  const graded = assignments.filter(a => a.submission?.status === 'graded');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div><h1 className="text-2xl font-bold">Assignments</h1><p className="text-slate-500">Submit and track your assignments</p></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Pending" value={pending.length} icon={Clock} color="accent" />
        <StatsCard title="Submitted" value={submitted.length} icon={Upload} color="primary" />
        <StatsCard title="Graded" value={graded.length} icon={CheckCircle} color="secondary" />
      </div>

      <div className="space-y-3">
        {isLoading ? <LoadingSpinner className="py-10" /> : assignments.length === 0 ? (
          <div className="text-center py-12 text-slate-500"><ClipboardCheck className="h-12 w-12 mx-auto mb-3 opacity-40" /><p>No assignments yet</p></div>
        ) : assignments.map((a) => {
          const isOverdue = new Date(a.dueDate) < new Date() && !a.submission;
          return (
            <div key={a._id} className="glass rounded-xl p-4 hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-sm">{a.title}</h3>
                    {a.submission?.status === 'graded' ? <Badge variant="success" className="text-xs">{a.submission.score}/{a.totalPoints}</Badge> : a.submission ? <Badge variant="info" className="text-xs">Submitted</Badge> : isOverdue ? <Badge variant="danger" className="text-xs">Overdue</Badge> : <Badge variant="warning" className="text-xs">Pending</Badge>}
                  </div>
                  <p className="text-xs text-slate-500 mb-2">{a.course?.title} • {a.type}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span><strong>Due:</strong> {formatDate(a.dueDate)}</span>
                    <span><strong>Points:</strong> {a.totalPoints}</span>
                    {a.submission?.submittedAt && <span>Submitted {timeAgo(a.submission.submittedAt)}</span>}
                  </div>
                  {a.submission?.feedback && <p className="text-xs text-slate-500 mt-1">Feedback: {a.submission.feedback}</p>}
                </div>
                <button
                  onClick={() => navigate(`/assignment/submit/${a._id}`)}
                  className={cn('btn-sm flex items-center gap-1', a.submission ? 'btn-secondary' : 'btn-primary')}
                >
                  {a.submission ? <ExternalLink className="h-3.5 w-3.5" /> : <Upload className="h-3.5 w-3.5" />}
                  {a.submission ? 'View' : 'Submit'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
