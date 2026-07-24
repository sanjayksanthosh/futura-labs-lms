import { motion } from 'framer-motion';
import { useFetch, useMutate } from '../../hooks/useQuery';
import { notificationService } from '../../services/endpoints';
import { Bell } from 'lucide-react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { timeAgo } from '../../utils/helpers';
import { cn } from '../../utils/cn';

export const StudentNotifications = () => {
  const { data, isLoading } = useFetch('student-notifications-page', () => notificationService.getAll({ limit: 50 }));
  const readMutation = useMutate((id) => notificationService.markAsRead(id), { invalidateKeys: ['student-notifications-page'] });
  const notifications = data?.data || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div><h1 className="text-2xl font-bold">Notifications</h1></div>
      {isLoading ? <LoadingSpinner className="py-20" /> : (
      <div className="glass rounded-2xl divide-y divide-slate-200 dark:divide-slate-700">
        {notifications.length === 0 ? <div className="p-8 text-center text-slate-500">All clear!</div> : notifications.map((n) => (
          <div key={n._id} className={cn('p-4 flex gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50', !n.isRead && 'bg-primary-50/50 dark:bg-primary-900/10')} onClick={() => { if (!n.isRead) readMutation.mutate(n._id); }}>
            <Bell className="h-5 w-5 text-primary-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">{n.title}</p>
              <p className="text-sm text-slate-500">{n.message}</p>
              <p className="text-xs text-slate-400 mt-1">{timeAgo(n.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
      )}
    </motion.div>
  );
};
