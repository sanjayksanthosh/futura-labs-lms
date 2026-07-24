import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Layers, Users, Calendar, Clock, MoreVertical, Edit3, Trash2, UserPlus } from 'lucide-react';
import { useFetch, useMutate } from '../../hooks/useQuery';
import { batchService } from '../../services/endpoints';
import { StatsCard } from '../../components/ui/StatsCard';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatDate } from '../../utils/helpers';

export const AdminBatches = () => {
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editBatch, setEditBatch] = useState(null);
  const [showStudents, setShowStudents] = useState(null);
  const [studentIds, setStudentIds] = useState('');

  const { data, isLoading } = useFetch(['batches', page], () => batchService.getAll({ page, limit: 10 }));
  const createMutation = useMutate((fd) => batchService.create(fd), { invalidateKeys: ['batches'] });
  const updateMutation = useMutate(({ id, data }) => batchService.update(id, data), { invalidateKeys: ['batches'] });
  const deleteMutation = useMutate((id) => batchService.delete(id), { invalidateKeys: ['batches'] });
  const addStudentsMut = useMutate(({ id, studentIds }) => batchService.addStudents(id, studentIds), { invalidateKeys: ['batches'] });

  const batches = data?.data || [];

  const columns = [
    { key: 'name', label: 'Name', render: (row) => (
      <div><p className="font-medium text-sm">{row.name}</p><p className="text-xs text-slate-500">{row.code || row._id?.slice(-6)}</p></div>
    )},
    { key: 'mentor', label: 'Mentor', render: (row) => row.mentor?.name ? <span className="text-sm">{row.mentor.name}</span> : <span className="text-xs text-slate-400">-</span> },
    { key: 'students', label: 'Students', render: (row) => (
      <span className="text-sm">{row.students?.length || 0}/{row.maxStudents || '∞'}</span>
    )},
    { key: 'status', label: 'Status', render: (row) => {
      const variants = { active: 'success', upcoming: 'info', completed: 'warning', cancelled: 'danger' };
      return <Badge variant={variants[row.status] || 'info'} className="capitalize text-xs">{row.status}</Badge>;
    }},
    { key: 'startDate', label: 'Period', render: (row) => (
      <span className="text-xs text-slate-500">{formatDate(row.startDate)}{row.endDate ? ` - ${formatDate(row.endDate)}` : ''}</span>
    )},
    { key: 'actions', label: '', render: (row) => (
      <div className="flex items-center gap-1">
        <button onClick={(e) => { e.stopPropagation(); setShowStudents(row); }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-primary-500"><UserPlus className="h-3.5 w-3.5" /></button>
        <button onClick={(e) => { e.stopPropagation(); setEditBatch(row); setShowModal(true); }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-primary-500"><Edit3 className="h-3.5 w-3.5" /></button>
        <button onClick={(e) => { e.stopPropagation(); if (confirm('Delete this batch?')) deleteMutation.mutate(row._id); }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
      </div>
    )},
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Batches</h1>
          <p className="text-slate-500">Manage student batches and cohorts</p>
        </div>
        <button onClick={() => { setEditBatch(null); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4" /> New Batch</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard title="Total Batches" value={batches.length} icon={Layers} color="primary" />
        <StatsCard title="Active" value={batches.filter(b => b.status === 'active').length} icon={Calendar} color="secondary" />
        <StatsCard title="Upcoming" value={batches.filter(b => b.status === 'upcoming').length} icon={Clock} color="accent" />
        <StatsCard title="Total Students" value={batches.reduce((s, b) => s + (b.students?.length || 0), 0)} icon={Users} color="purple" />
      </div>

      <DataTable columns={columns} data={batches} loading={isLoading} page={page} totalPages={data?.pagination?.totalPages || 1} onPageChange={setPage} />

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditBatch(null); }} title={editBatch ? 'Edit Batch' : 'Create Batch'} size="lg">
        <form onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const data = Object.fromEntries(fd);
          if (editBatch) {
            updateMutation.mutate({ id: editBatch._id, data });
          } else {
            createMutation.mutate(data);
          }
          setShowModal(false);
          setEditBatch(null);
        }} className="space-y-4">
          <input name="name" placeholder="Batch Name" className="input-field" required defaultValue={editBatch?.name || ''} />
          <textarea name="description" placeholder="Description" className="input-field" rows={2} defaultValue={editBatch?.description || ''} />
          <input name="mentor" placeholder="Mentor ID" className="input-field" defaultValue={editBatch?.mentor?._id || ''} />
          <div className="grid grid-cols-2 gap-4">
            <input name="startDate" type="date" className="input-field" defaultValue={editBatch?.startDate ? new Date(editBatch.startDate).toISOString().split('T')[0] : ''} />
            <input name="endDate" type="date" className="input-field" defaultValue={editBatch?.endDate ? new Date(editBatch.endDate).toISOString().split('T')[0] : ''} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input name="maxStudents" type="number" placeholder="Max Students" className="input-field" defaultValue={editBatch?.maxStudents || 50} />
            <select name="status" className="input-field" defaultValue={editBatch?.status || 'active'}>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button type="submit" className="btn-primary w-full">{editBatch ? 'Update Batch' : 'Create Batch'}</button>
        </form>
      </Modal>

      {/* Add Students Modal */}
      <Modal isOpen={!!showStudents} onClose={() => setShowStudents(null)} title={`Add Students to ${showStudents?.name || ''}`}>
        <form onSubmit={(e) => {
          e.preventDefault();
          const ids = studentIds.split(',').map(s => s.trim()).filter(Boolean);
          addStudentsMut.mutate({ id: showStudents._id, studentIds: ids });
          setShowStudents(null);
          setStudentIds('');
        }} className="space-y-4">
          <p className="text-sm text-slate-500">Enter student IDs separated by commas</p>
          <textarea value={studentIds} onChange={(e) => setStudentIds(e.target.value)} placeholder="e.g. id1, id2, id3" className="input-field" rows={3} />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary flex-1">Add Students</button>
            <button type="button" onClick={() => setShowStudents(null)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};
