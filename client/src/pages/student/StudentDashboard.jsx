import { motion } from 'framer-motion';
import { BookOpen, ClipboardCheck, BrainCircuit, CalendarCheck, TrendingUp, Clock } from 'lucide-react';
import { useFetch } from '../../hooks/useQuery';
import { analyticsService, courseService, assignmentService, quizService } from '../../services/endpoints';
import { StatsCard } from '../../components/ui/StatsCard';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatDate } from '../../utils/helpers';

export const StudentDashboard = () => {
  const { data: progressData, isLoading } = useFetch('my-progress', () => analyticsService.getMyProgress());
  const { data: courseData } = useFetch('student-courses', () => courseService.getAll({ limit: 50 }));
  const { data: assignData } = useFetch('student-assignments', () => assignmentService.getAll({ limit: 5 }));
  const { data: quizData } = useFetch('student-quizzes', () => quizService.getAll({ limit: 50 }));

  if (isLoading) return <LoadingSpinner className="py-20" />;

  const progress = progressData?.data || {};
  const courses = courseData?.data || [];
  const assignments = assignData?.data || [];
  const quizzes = quizData?.data || [];
  const courseProgress = progress.courseProgress || [];
  const attendanceSummary = progress.attendance || {};

  const attemptedQuizzes = quizzes.filter((q) => q.attempted);
  const avgQuizScore = attemptedQuizzes.length > 0
    ? Math.round(attemptedQuizzes.reduce((s, q) => s + (q.bestScore || 0), 0) / attemptedQuizzes.length)
    : 0;
  const completedLessons = courses.reduce((s, c) => s + (c.progress?.completedLessons?.length || 0), 0);
  const totalLessons = courses.reduce((s, c) => s + (c.progress?.totalLessons || 0), 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Student Dashboard</h1>
        <p className="text-slate-500">Continue your learning journey</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Enrolled Courses" value={courses.length} icon={BookOpen} color="primary" />
        <StatsCard title="Lessons Done" value={`${completedLessons}/${totalLessons}`} icon={TrendingUp} color="secondary" />
        <StatsCard title="Avg Quiz Score" value={avgQuizScore} icon={BrainCircuit} color="accent" suffix="%" />
        <StatsCard title="Attendance" value={attendanceSummary.present || 0} icon={CalendarCheck} color="purple" suffix={attendanceSummary.total ? `/${attendanceSummary.total} days` : ' days'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <h3 className="section-title flex items-center gap-2"><BookOpen className="h-5 w-5" /> Course Progress</h3>
          <div className="space-y-4">
            {courseProgress.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No course progress yet. Start learning!</p>
            ) : courseProgress.slice(0, 5).map((cp, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{cp.course}</span>
                  <span className="text-xs text-slate-500">{cp.completed}/{cp.total} lessons • {cp.percentage}%</span>
                </div>
                <ProgressBar value={cp.percentage} max={100} size="sm" showLabel={false} />
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="section-title flex items-center gap-2"><ClipboardCheck className="h-5 w-5" /> Upcoming Assignments</h3>
          <div className="space-y-3">
            {assignments.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No assignments yet</p>
            ) : assignments.slice(0, 5).map((a) => (
              <div key={a._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <div>
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-slate-500">{a.course?.title}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">{a.dueDate ? formatDate(a.dueDate) : 'No deadline'}</p>
                  <p className={`text-xs ${a.submitted ? 'text-green-500' : 'text-primary-500'}`}>{a.submitted ? 'Submitted' : `${a.totalPoints || 0} pts`}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
