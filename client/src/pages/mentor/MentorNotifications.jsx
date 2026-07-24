import { motion } from 'framer-motion';
import { useState } from 'react';
import { Send, Bell } from 'lucide-react';
import { useFetch, useMutate } from '../../hooks/useQuery';
import { notificationService } from '../../services/endpoints';
import { Modal } from '../../components/ui/Modal';
import { timeAgo } from '../../utils/helpers';
import { cn } from '../../utils/cn';

export const MentorNotifications = () => {
  const [showModal, setShowModal] = useState(false);
  const { data } = useFetch('mentor-notifications-page', () => notificationService.getAll({ limit: 50 }));
  const sendMutation = useMutate((formData) => notificationService.send(formData), { invalidateKeys: ['mentor-notifications-page'] });
  const notifications = data?.data || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Notifications</h1></div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Send className="h-4 w-4" /> Send</button>
      </div>
      <div className="glass rounded-2xl divide-y">
        {notifications.length === 0 ? <div className="p-8 text-center text-slate-500">No notifications</div> : notifications.map((n) => (
          <div key={n._id} className={cn('p-4 flex gap-3', !n.isRead && 'bg-primary-50/50')}>
            <Bell className="h-5 w-5 text-primary-500 shrink-0" />
            <div><p className="font-medium text-sm">{n.title}</p><p className="text-sm text-slate-500">{n.message}</p><p className="text-xs text-slate-400 mt-1">{timeAgo(n.createdAt)}</p></div>
          </div>
        ))}
      </div>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Send Notification">
        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target); sendMutation.mutate({ recipients: fd.get('recipients').split(',').map(s => s.trim()), type: fd.get('type'), title: fd.get('title'), message: fd.get('message'), link: fd.get('link') }); setShowModal(false); }} className="space-y-4">
          <input name="recipients" placeholder="Recipient IDs (comma)" className="input-field" required />
          <select name="type" className="input-field">
            <option value="announcement">Announcement</option>
            <option value="reminder">Reminder</option>
            <option value="system">System</option>
          </select>
          <input name="title" placeholder="Title" className="input-field" required />
          <textarea name="message" placeholder="Message" className="input-field" rows={3} required />
          <button type="submit" className="btn-primary w-full">Send</button>
        </form>
      </Modal>
    </motion.div>
  );
};
