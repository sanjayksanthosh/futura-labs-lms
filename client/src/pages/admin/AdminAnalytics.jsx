import { motion } from 'framer-motion';
import { useFetch } from '../../hooks/useQuery';
import { analyticsService } from '../../services/endpoints';
import { StatsCard } from '../../components/ui/StatsCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export const AdminAnalytics = () => {
  const { data, isLoading } = useFetch('system-analytics', () => analyticsService.getSystem());

  if (isLoading) return <LoadingSpinner className="py-20" />;
  const monthly = data?.data?.monthly || {};
  const trend = data?.data?.enrollmentTrend || [];

  const chartData = monthly.byRole?.map((r) => ({ name: r._id, value: r.count })) || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-slate-500">System-wide analytics and reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard title="New Users (Month)" value={monthly.newUsers} icon={null} color="primary" />
        <StatsCard title="New Courses" value={monthly.newCourses} icon={null} color="secondary" />
        <StatsCard title="Submissions" value={monthly.submissions} icon={null} color="accent" />
        <StatsCard title="Attendance" value={monthly.attendance} icon={null} color="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <h3 className="section-title">New Users by Role</h3>
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
        <div className="glass rounded-2xl p-6">
          <h3 className="section-title">Enrollment Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trend.slice(0, 12).reverse()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" tickFormatter={(v) => `${v?.month}/${v?.year}`} />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};
