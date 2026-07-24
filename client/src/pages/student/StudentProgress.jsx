import { motion } from 'framer-motion';
import { useFetch } from '../../hooks/useQuery';
import { analyticsService, progressService, quizService } from '../../services/endpoints';
import { StatsCard } from '../../components/ui/StatsCard';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, BookOpen, BrainCircuit, CheckCircle, Clock } from 'lucide-react';

const COLORS = ['#6366f1', '#22c55e', '#f97316', '#ef4444'];

export const StudentProgress = () => {
  const { data: progressData, isLoading } = useFetch('student-progress', () => analyticsService.getMyProgress());
  const { data: courseData } = useFetch('student-course-progress', () => progressService.getMyCourses());
  const { data: quizData } = useFetch('student-quiz-scores', () => quizService.getAll({ limit: 200 }));

  if (isLoading) return <LoadingSpinner className="py-20" />;

  const progress = progressData?.data || {};
  const courses = courseData?.data || [];
  const quizzes = quizData?.data || [];
  const courseProgress = progress.courseProgress || [];

  const attemptedQuizzes = quizzes.filter((q) => q.attempted);
  const avgQuizScore = attemptedQuizzes.length > 0
    ? Math.round(attemptedQuizzes.reduce((s, q) => s + (q.bestScore || 0), 0) / attemptedQuizzes.length)
    : 0;

  const totalCompleted = courses.reduce((s, c) => s + (c.completedLessons?.length || 0), 0);
  const totalAllLessons = courses.reduce((s, c) => s + (c.totalLessons || 0), 0);

  const chartData = [
    { name: 'Assignments', value: Math.round(progress.assignments?.avgScore || 0) },
    { name: 'Quizzes', value: avgQuizScore },
    { name: 'Completed', value: totalAllLessons > 0 ? Math.round((totalCompleted / totalAllLessons) * 100) : 0 },
  ];

  const pieData = [
    { name: 'Completed', value: courseProgress.filter(c => c.isCompleted).length },
    { name: 'In Progress', value: courseProgress.filter(c => !c.isCompleted && c.percentage > 0).length },
    { name: 'Not Started', value: courseProgress.filter(c => c.percentage === 0).length },
  ].filter(d => d.value > 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div><h1 className="text-2xl font-bold">My Progress</h1><p className="text-slate-500">Track your learning journey</p></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Avg Assignment Score" value={Math.round(progress.assignments?.avgScore || 0)} icon={TrendingUp} color="primary" suffix="%" />
        <StatsCard title="Avg Quiz Score" value={avgQuizScore} icon={BrainCircuit} color="secondary" suffix="%" />
        <StatsCard title="Lessons Completed" value={`${totalCompleted}/${totalAllLessons}`} icon={CheckCircle} color="accent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <h3 className="section-title">Scores Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="section-title">Course Status</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                  {pieData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-500 text-center py-8">No course data yet</p>}
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="section-title flex items-center gap-2"><BookOpen className="h-5 w-5" /> Course Progress</h3>
        <div className="space-y-4">
          {courses.length === 0 ? <p className="text-slate-500">Not enrolled in any courses</p> : courses.map((cp) => (
            <div key={cp._id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{cp.course?.title || 'Course'}</span>
                  {cp.isCompleted && <CheckCircle className="h-4 w-4 text-green-500" />}
                </div>
                <span className="text-xs text-slate-500">{cp.completedLessons?.length || 0}/{cp.totalLessons || 0} lessons • {Math.round(cp.overallPercentage || 0)}%</span>
              </div>
              <ProgressBar value={cp.overallPercentage || 0} max={100} showLabel={false} />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
