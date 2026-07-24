import { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Send, Trash2, Users, Mail, AlertTriangle, Megaphone, Info, CheckCheck } from 'lucide-react';
import { useFetch, useMutate } from '../../hooks/useQuery';
import { notificationService } from '../../services/endpoints';
import { StatsCard } from '../../components/ui/StatsCard';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { timeAgo } from '../../utils/helpers';
import { cn } from '../../utils/cn';

const typeConfig = {
  system: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  announcement: { icon: Megaphone, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  reminder: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  grade: { icon: Mail, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
};

export const AdminNotifications = () => {
  const [showModal, setShowModal] = useState(false);
  const { data, isLoading, refetch } = useFetch('admin-notifications', () => notificationService.getAll({ limit: 50 }));
  const sendMutation = useMutate((d) => notificationService.send(d), { invalidateKeys: ['admin-notifications'] });
  const deleteMutation = useMutate((id) => notificationService.delete(id), { invalidateKeys: ['admin-notifications'] });
  const markAllRead = useMutate(() => notificationService.markAllAsRead(), { invalidateKeys: ['admin-notifications'] });

  const notifications = data?.data || [];
  const stats = data?.stats || {};

  const [form, setForm] = useState({ recipients: '', type: 'system', title: '', message: '', link: '', sendToAll: false });

  const handleSend = (e) => {
    e.preventDefault();
    const payload = {
      type: form.type, title: form.title, message: form.message, link: form.link,
      recipients: form.sendToAll ? [] : form.recipients.split(',').map(s => s.trim()).filter(Boolean),
      sendToAll: form.sendToAll,
    };
    sendMutation.mutate(payload);
    setShowModal(false);
    setForm({ recipients: '', type: 'system', title: '', message: '', link: '', sendToAll: false });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Notifications</h1><p className="text-slate-500">Send and manage system notifications</p></div>
        <div className="flex gap-2">
          <button onClick={() => markAllRead.mutate()} className="btn-secondary text-sm flex items-center gap-1"><CheckCheck className="h-4 w-4" /> Mark All Read</button>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Send className="h-4 w-4" /> Send</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard title="Total Sent" value={stats.total || notifications.length} icon={Bell} color="primary" />
        <StatsCard title="Announcements" value={notifications.filter(n => n.type === 'announcement').length} icon={Megaphone} color="secondary" />
        <StatsCard title="Reminders" value={notifications.filter(n => n.type === 'reminder').length} icon={AlertTriangle} color="accent" />
        <StatsCard title="Unread" value={notifications.filter(n => !n.isRead).length} icon={Mail} color="purple" />
      </div>

      <div className="glass rounded-2xl divide-y divide-slate-200 dark:divide-slate-700">
        {isLoading ? <LoadingSpinner className="py-10" /> : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500">No notifications yet</p>
          </div>
        ) : notifications.map((notif) => {
          const config = typeConfig[notif.type] || typeConfig.system;
          const Icon = config.icon;
          return (
            <div key={notif._id} className={cn('p-4 flex gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group', !notif.isRead && 'bg-primary-50/50 dark:bg-primary-900/10')}>
              <div className={cn('p-2 rounded-xl shrink-0', config.bg)}><Icon className={cn('h-4 w-4', config.color)} /></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-medium text-sm">{notif.title}</p>
                  <Badge variant="info" className="text-[10px] capitalize">{notif.type}</Badge>
                </div>
                <p className="text-sm text-slate-500">{notif.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-400">{timeAgo(notif.createdAt)}</span>
                  {notif.recipientCount && <span className="text-xs text-slate-400">• {notif.recipientCount} recipients</span>}
                </div>
              </div>
              <button onClick={() => deleteMutation.mutate(notif._id)} className="p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          );
        })}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Send Notification" size="lg">
        <form onSubmit={handleSend} className="space-y-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.sendToAll} onChange={e => setForm(f => ({ ...f, sendToAll: e.target.checked }))} />
            <span className="text-sm font-medium">Send to All Users</span>
          </label>
          {!form.sendToAll && (
            <input value={form.recipients} onChange={e => setForm(f => ({ ...f, recipients: e.target.value }))} placeholder="Recipient IDs (comma separated)" className="input-field" required />
          )}
          <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input-field">
            <option value="system">System</option>
            <option value="announcement">Announcement</option>
            <option value="reminder">Reminder</option>
            <option value="grade">Grade Update</option>
          </select>
          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Title" className="input-field" required />
          <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Message" className="input-field" rows={3} required />
          <input value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} placeholder="Link (optional)" className="input-field" />
          <button type="submit" className="btn-primary w-full">Send Notification</button>
        </form>
      </Modal>
    </motion.div>
  );
};
