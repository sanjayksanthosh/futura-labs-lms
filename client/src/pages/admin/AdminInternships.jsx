import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Briefcase, Building, Calendar, MapPin, Edit3, Trash2 } from 'lucide-react';
import { useFetch, useMutate } from '../../hooks/useQuery';
import { internshipService } from '../../services/endpoints';
import { StatsCard } from '../../components/ui/StatsCard';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { formatDate } from '../../utils/helpers';

const statusColors = { active: 'success', completed: 'info', pending: 'warning', cancelled: 'danger' };

export const AdminInternships = () => {
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editInternship, setEditInternship] = useState(null);
  const { data, isLoading } = useFetch(['admin-internships', page], () => internshipService.getAll({ page, limit: 10 }));
  const createMutation = useMutate((d) => internshipService.create(d), { invalidateKeys: ['admin-internships'] });
  const updateMutation = useMutate(({ id, data }) => internshipService.update(id, data), { invalidateKeys: ['admin-internships'] });
  const deleteMutation = useMutate((id) => internshipService.delete(id), { invalidateKeys: ['admin-internships'] });

  const internships = data?.data || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Internships</h1><p className="text-slate-500">Track and manage student internships</p></div>
        <button onClick={() => { setEditInternship(null); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4" /> New Internship</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard title="Total" value={data?.pagination?.total || internships.length} icon={Briefcase} color="primary" />
        <StatsCard title="Active" value={internships.filter(i => i.status === 'active').length} icon={Building} color="secondary" />
        <StatsCard title="Completed" value={internships.filter(i => i.status === 'completed').length} icon={Calendar} color="accent" />
        <StatsCard title="Pending" value={internships.filter(i => i.status === 'pending').length} icon={MapPin} color="purple" />
      </div>

      <div className="space-y-3">
        {isLoading ? <div className="text-center py-10"><div className="animate-spin h-8 w-8 border-2 border-primary-500 border-t-transparent rounded-full mx-auto" /></div> : internships.length === 0 ? (
          <div className="text-center py-12 text-slate-500"><Briefcase className="h-12 w-12 mx-auto mb-3 opacity-40" /><p>No internships</p></div>
        ) : internships.map((item) => (
          <div key={item._id} className="glass rounded-xl p-4 flex items-start gap-4 hover:shadow-md transition-all">
            <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20"><Briefcase className="h-5 w-5 text-primary-500" /></div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm">{item.company}</h3>
                <Badge variant={statusColors[item.status] || 'info'} className="text-xs capitalize">{item.status}</Badge>
              </div>
              <p className="text-sm text-slate-500 mb-1">{item.position}</p>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>{item.student?.name || 'N/A'}</span>
                <span>{formatDate(item.startDate)}{item.endDate ? ` - ${formatDate(item.endDate)}` : ''}</span>
                {item.stipend && <span>${item.stipend}/mo</span>}
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { setEditInternship(item); setShowModal(true); }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400"><Edit3 className="h-3.5 w-3.5" /></button>
              <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(item._id); }} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditInternship(null); }} title={editInternship ? 'Edit Internship' : 'Add Internship'} size="lg">
        <form onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const data = Object.fromEntries(fd);
          if (editInternship) updateMutation.mutate({ id: editInternship._id, data });
          else createMutation.mutate(data);
          setShowModal(false); setEditInternship(null);
        }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input name="student" placeholder="Student ID" className="input-field" required defaultValue={editInternship?.student?._id || ''} />
            <input name="company" placeholder="Company Name" className="input-field" required defaultValue={editInternship?.company || ''} />
          </div>
          <input name="position" placeholder="Position / Role" className="input-field" required defaultValue={editInternship?.position || ''} />
          <div className="grid grid-cols-2 gap-4">
            <input name="startDate" type="date" className="input-field" required defaultValue={editInternship?.startDate ? new Date(editInternship.startDate).toISOString().split('T')[0] : ''} />
            <input name="endDate" type="date" className="input-field" defaultValue={editInternship?.endDate ? new Date(editInternship.endDate).toISOString().split('T')[0] : ''} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input name="stipend" type="number" placeholder="Monthly Stipend ($)" className="input-field" defaultValue={editInternship?.stipend || 0} />
            <select name="status" className="input-field" defaultValue={editInternship?.status || 'active'}>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <textarea name="description" placeholder="Description" className="input-field" rows={2} defaultValue={editInternship?.description || ''} />
          <button type="submit" className="btn-primary w-full">{editInternship ? 'Update' : 'Create'}</button>
        </form>
      </Modal>
    </motion.div>
  );
};
