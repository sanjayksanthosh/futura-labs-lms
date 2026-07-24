import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useFetch, useMutate } from '../../hooks/useQuery';
import { userService } from '../../services/endpoints';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { formatDate } from '../../utils/helpers';

export const AdminMentors = () => {
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading } = useFetch(['mentors', page], () =>
    userService.getAll({ role: { $in: ['mentor', 'admin'] }, page, limit: 10 })
  );

  const createMutation = useMutate((formData) => userService.create(formData), { invalidateKeys: ['mentors'] });

  const columns = [
    { key: 'name', label: 'Mentor', render: (row) => (
      <div className="flex items-center gap-3">
        <Avatar name={row.name} size="sm" />
        <div><p className="font-medium">{row.name}</p><p className="text-xs text-slate-500">{row.email}</p></div>
      </div>
    )},
    { key: 'role', label: 'Role', render: (row) => <Badge variant="primary" className="capitalize">{row.role?.replace('_', ' ')}</Badge> },
    { key: 'phone', label: 'Phone', render: (row) => row.phone || '-' },
    { key: 'isActive', label: 'Status', render: (row) => <Badge variant={row.isActive ? 'success' : 'danger'}>{row.isActive ? 'Active' : 'Inactive'}</Badge> },
    { key: 'createdAt', label: 'Joined', render: (row) => formatDate(row.createdAt) },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mentors</h1>
          <p className="text-slate-500">Manage mentors and admins</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Mentor
        </button>
      </div>
      <DataTable columns={columns} data={data?.data || []} loading={isLoading} page={page} totalPages={data?.pagination?.totalPages || 1} onPageChange={setPage} />
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Mentor">
        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target); createMutation.mutate(Object.fromEntries(fd)); setShowModal(false); }} className="space-y-4">
          <input name="name" placeholder="Full Name" className="input-field" required />
          <input name="email" type="email" placeholder="Email" className="input-field" required />
          <input name="phone" placeholder="Phone" className="input-field" />
          <select name="role" className="input-field">
            <option value="mentor">Mentor</option>
            <option value="admin">Admin</option>
          </select>
          <input name="password" type="password" placeholder="Password" className="input-field" required minLength={6} />
          <button type="submit" className="btn-primary w-full">Create</button>
        </form>
      </Modal>
    </motion.div>
  );
};
