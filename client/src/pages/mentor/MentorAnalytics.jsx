import { motion } from 'framer-motion';
import { useFetch } from '../../hooks/useQuery';
import { analyticsService } from '../../services/endpoints';
import { StatsCard } from '../../components/ui/StatsCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const MentorAnalytics = () => {
  const { data, isLoading } = useFetch('mentor-my-analytics', () => analyticsService.getMyPerformance());

  if (isLoading) return <LoadingSpinner className="py-20" />;

  const perf = data?.data || {};
  const chartData = [
    { name: 'Courses', value: perf.totalCourses || 0 },
    { name: 'Students', value: perf.totalStudents || 0 },
    { name: 'Assignments', value: perf.totalAssignments || 0 },
    { name: 'Avg Grade', value: perf.avgGrade || 0 },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div><h1 className="text-2xl font-bold">My Analytics</h1></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard title="Courses" value={perf.totalCourses} />
        <StatsCard title="Students" value={perf.totalStudents} color="secondary" />
        <StatsCard title="Assignments" value={perf.totalAssignments} color="accent" />
        <StatsCard title="Avg Grade" value={perf.avgGrade} color="purple" suffix="%" />
      </div>
      <div className="glass rounded-2xl p-6">
        <h3 className="section-title">Performance Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
