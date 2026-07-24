import { motion } from 'framer-motion';
import { Users, GraduationCap, BookOpen, ClipboardCheck, TrendingUp, Activity } from 'lucide-react';
import { useFetch } from '../../hooks/useQuery';
import { analyticsService } from '../../services/endpoints';
import { StatsCard } from '../../components/ui/StatsCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const COLORS = ['#6366f1', '#22c55e', '#f97316', '#ef4444', '#8b5cf6'];

export const AdminDashboard = () => {
  const { data, isLoading } = useFetch('admin-dashboard', () => analyticsService.getDashboard());
  const { data: systemData } = useFetch('admin-system-analytics', () => analyticsService.getSystem());

  if (isLoading) return <LoadingSpinner className="py-20" />;

  const overview = data?.data?.overview || {};
  const recentUsers = data?.data?.recentUsers || [];
  const courseStats = data?.data?.courseStats || [];

  const chartData = [
    { name: 'Students', value: overview.totalStudents || 0 },
    { name: 'Mentors', value: overview.totalMentors || 0 },
    { name: 'Courses', value: overview.totalCourses || 0 },
    { name: 'Assignments', value: overview.totalAssignments || 0 },
  ];

  const rawTrend = systemData?.data?.enrollmentTrend || [];
  const activityData = rawTrend.length > 0
    ? [...rawTrend].reverse().map((t) => ({
        month: MONTH_NAMES[(t._id.month || 1) - 1],
        students: t.count || 0,
        courses: 0,
      }))
    : [
        { month: 'Jan', students: 0, courses: 0 },
        { month: 'Feb', students: 0, courses: 0 },
        { month: 'Mar', students: 0, courses: 0 },
        { month: 'Apr', students: 0, courses: 0 },
        { month: 'May', students: 0, courses: 0 },
        { month: 'Jun', students: 0, courses: 0 },
      ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome to Futura Labs Ai Tutor LMS - Full platform overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Total Students" value={overview.totalStudents} icon={GraduationCap} color="primary" trend={12} />
        <StatsCard title="Total Mentors" value={overview.totalMentors} icon={Users} color="secondary" trend={8} />
        <StatsCard title="Total Courses" value={overview.totalCourses} icon={BookOpen} color="accent" trend={15} />
        <StatsCard title="Certificates" value={overview.totalCertificates} icon={ClipboardCheck} color="purple" trend={20} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 glass rounded-2xl p-6">
          <h3 className="section-title flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Platform Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Line type="monotone" dataKey="students" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
              <Line type="monotone" dataKey="courses" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
          <h3 className="section-title flex items-center gap-2"><Activity className="h-5 w-5" /> Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label>
                {chartData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {chartData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-2 text-sm">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                <span className="text-slate-600 dark:text-slate-400">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
          <h3 className="section-title">Recent Users</h3>
          <div className="space-y-3">
            {recentUsers.map((user) => (
              <div key={user._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-semibold">
                  {user.name?.[0] || 'U'}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <span className="badge capitalize">{user.role?.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
          <h3 className="section-title">Course Levels</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={courseStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="_id" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </motion.div>
  );
};
