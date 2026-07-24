import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Building2, Globe, Users, Edit3, Trash2, Shield } from 'lucide-react';
import { useFetch, useMutate } from '../../hooks/useQuery';
import { instituteService } from '../../services/endpoints';
import { StatsCard } from '../../components/ui/StatsCard';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { formatDate } from '../../utils/helpers';

export const AdminInstitutes = () => {
  const [showModal, setShowModal] = useState(false);
  const [editInstitute, setEditInstitute] = useState(null);
  const { data, isLoading } = useFetch('institutes', () => instituteService.getAll());
  const createMutation = useMutate((d) => instituteService.create(d), { invalidateKeys: ['institutes'] });
  const updateMutation = useMutate(({ id, data }) => instituteService.update(id, data), { invalidateKeys: ['institutes'] });
  const deleteMutation = useMutate((id) => instituteService.delete(id), { invalidateKeys: ['institutes'] });

  const institutes = data?.data || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Institutes</h1><p className="text-slate-500">Multi-institute management</p></div>
        <button onClick={() => { setEditInstitute(null); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4" /> New Institute</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Total" value={institutes.length} icon={Building2} color="primary" />
        <StatsCard title="Active" value={institutes.filter(i => i.isActive).length} icon={Globe} color="secondary" />
        <StatsCard title="Total Users" value={institutes.reduce((s, i) => s + (i.totalUsers || 0), 0)} icon={Users} color="accent" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-6"><div className="skeleton h-4 w-3/4 mb-3" /><div className="skeleton h-3 w-1/2" /></div>
        )) : institutes.length === 0 ? (
          <div className="col-span-full text-center py-16 text-slate-500"><Building2 className="h-12 w-12 mx-auto mb-3 opacity-40" /><p>No institutes yet</p></div>
        ) : institutes.map((inst) => (
          <motion.div key={inst._id} whileHover={{ scale: 1.02 }} className="glass rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-xl bg-primary-50 dark:bg-primary-900/20"><Building2 className="h-6 w-6 text-primary-500" /></div>
              <div className="flex gap-1">
                <button onClick={(e) => { e.stopPropagation(); setEditInstitute(inst); setShowModal(true); }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400"><Edit3 className="h-3.5 w-3.5" /></button>
                <button onClick={(e) => { e.stopPropagation(); if (confirm('Delete?')) deleteMutation.mutate(inst._id); }} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-400"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
            <h3 className="font-semibold text-sm mb-1">{inst.name}</h3>
            <p className="text-xs text-slate-500 mb-3">{inst.email} • {inst.phone || 'No phone'}</p>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant={inst.isActive ? 'success' : 'danger'} className="text-xs">{inst.isActive ? 'Active' : 'Inactive'}</Badge>
              {inst.subscription?.plan && <Badge variant="info" className="text-xs capitalize">{inst.subscription.plan}</Badge>}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {inst.totalUsers || 0} users</span>
              <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> {inst.subscription?.plan || 'Free'}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditInstitute(null); }} title={editInstitute ? 'Edit Institute' : 'Create Institute'} size="lg">
        <form onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const raw = Object.fromEntries(fd);
          const data = {
            name: raw.name, email: raw.email, phone: raw.phone, address: raw.address,
            subscription: { plan: raw.subscriptionPlan },
            isActive: fd.has('isActive'),
          };
          if (editInstitute) updateMutation.mutate({ id: editInstitute._id, data });
          else createMutation.mutate(data);
          setShowModal(false); setEditInstitute(null);
        }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input name="name" placeholder="Institute Name" className="input-field" required defaultValue={editInstitute?.name || ''} />
            <input name="email" type="email" placeholder="Email" className="input-field" required defaultValue={editInstitute?.email || ''} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input name="phone" placeholder="Phone" className="input-field" defaultValue={editInstitute?.phone || ''} />
            <input name="address" placeholder="Address" className="input-field" defaultValue={editInstitute?.address || ''} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <select name="subscriptionPlan" className="input-field" defaultValue={editInstitute?.subscription?.plan || 'free'}>
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
            </select>
            <label className="flex items-center gap-2"><input name="isActive" type="checkbox" defaultChecked={editInstitute?.isActive ?? true} /> Active</label>
          </div>
          <button type="submit" className="btn-primary w-full">{editInstitute ? 'Update' : 'Create'}</button>
        </form>
      </Modal>
    </motion.div>
  );
};
