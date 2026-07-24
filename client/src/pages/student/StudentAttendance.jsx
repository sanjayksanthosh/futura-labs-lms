import { motion } from 'framer-motion';
import { useFetch } from '../../hooks/useQuery';
import { attendanceService } from '../../services/endpoints';
import { StatsCard } from '../../components/ui/StatsCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatDate } from '../../utils/helpers';
import { Badge } from '../../components/ui/Badge';
import { CalendarCheck } from 'lucide-react';

const statusColors = { present: 'success', absent: 'danger', late: 'warning', excused: 'info' };

export const StudentAttendance = () => {
  const { data, isLoading } = useFetch('my-attendance', () => attendanceService.getMyAttendance());

  if (isLoading) return <LoadingSpinner className="py-20" />;

  const summary = data?.data?.summary || {};
  const records = data?.data?.records || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div><h1 className="text-2xl font-bold">My Attendance</h1></div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard title="Total Days" value={summary.total || 0} icon={CalendarCheck} color="primary" />
        <StatsCard title="Present" value={summary.present || 0} icon={CalendarCheck} color="secondary" />
        <StatsCard title="Absent" value={summary.absent || 0} icon={CalendarCheck} color="danger" />
        <StatsCard title="Percentage" value={summary.percentage || 0} icon={CalendarCheck} color="purple" suffix="%" />
      </div>

      <div className="glass rounded-2xl p-6">
        <h3 className="section-title">Attendance Records</h3>
        <div className="space-y-2">
          {records.map((r) => (
            <div key={r._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <span className="text-sm">{formatDate(r.date)}</span>
              <Badge variant={statusColors[r.status]} className="capitalize">{r.status}</Badge>
            </div>
          ))}
          {records.length === 0 && <p className="text-slate-500 text-center py-4">No attendance records</p>}
        </div>
      </div>
    </motion.div>
  );
};
