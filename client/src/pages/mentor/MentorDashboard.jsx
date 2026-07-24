import { motion } from 'framer-motion';
import { BookOpen, Users, ClipboardCheck, BrainCircuit, TrendingUp } from 'lucide-react';
import { useFetch } from '../../hooks/useQuery';
import { analyticsService, courseService, assignmentService } from '../../services/endpoints';
import { StatsCard } from '../../components/ui/StatsCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { timeAgo } from '../../utils/helpers';

export const MentorDashboard = () => {
  const { data: perfData, isLoading } = useFetch('mentor-performance', () => analyticsService.getMyPerformance());
  const { data: courseData } = useFetch('mentor-courses-list', () => courseService.getAll({ limit: 5 }));
  const { data: assignData } = useFetch('mentor-assignments-list', () => assignmentService.getAll({ limit: 5 }));

  if (isLoading) return <LoadingSpinner className="py-20" />;

  const perf = perfData?.data || {};
  const courses = courseData?.data || [];
  const assignments = assignData?.data || [];

  const chartData = courses.slice(0, 6).map((c) => ({
    month: c.title?.slice(0, 8) || 'Course',
    students: c.enrolledStudents?.length || 0,
    score: perf.avgGrade || 0,
  }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mentor Dashboard</h1>
        <p className="text-slate-500">Your teaching overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard title="My Courses" value={perf.totalCourses || 0} icon={BookOpen} color="primary" />
        <StatsCard title="My Students" value={perf.totalStudents || 0} icon={Users} color="secondary" />
        <StatsCard title="Assignments" value={perf.totalAssignments || 0} icon={ClipboardCheck} color="accent" />
        <StatsCard title="Avg Grade" value={perf.avgGrade || 0} icon={BrainCircuit} color="purple" suffix="%" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <h3 className="section-title flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Performance Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Line type="monotone" dataKey="students" stroke="#6366f1" strokeWidth={2} name="Students" />
              <Line type="monotone" dataKey="score" stroke="#22c55e" strokeWidth={2} name="Avg Score" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-2xl p-6">
          <h3 className="section-title">Recent Assignments</h3>
          <div className="space-y-3">
            {assignments.slice(0, 5).map((a) => (
              <div key={a._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <div>
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-slate-500">{a.course?.title} • Due {timeAgo(a.dueDate)}</p>
                </div>
                <span className="text-xs text-slate-400">{a.totalPoints} pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
