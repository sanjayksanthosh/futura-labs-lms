import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Mail, Phone, MoreVertical, Edit3, Trash2, Search, Users, UserCheck, UserX, GraduationCap } from 'lucide-react';
import { useFetch, useMutate } from '../../hooks/useQuery';
import { userService } from '../../services/endpoints';
import { StatsCard } from '../../components/ui/StatsCard';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatDate } from '../../utils/helpers';

export const AdminStudents = () => {
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useFetch(['students', page, search], () =>
    userService.getAll({ role: 'student', page, limit: 10, search })
  );
  const createMutation = useMutate((formData) => userService.create(formData), { invalidateKeys: ['students'] });
  const updateMutation = useMutate(({ id, data }) => userService.update(id, data), { invalidateKeys: ['students'] });
  const deleteMutation = useMutate((id) => userService.delete(id), { invalidateKeys: ['students'] });

  const students = data?.data || [];
  const stats = data?.stats || {};

  const columns = [
    { key: 'name', label: 'Student', render: (row) => (
      <div className="flex items-center gap-3">
        <Avatar name={row.name} size="sm" />
        <div>
          <p className="font-medium text-sm">{row.name}</p>
          <p className="text-xs text-slate-500">{row.email}</p>
        </div>
      </div>
    )},
    { key: 'phone', label: 'Phone', render: (row) => row.phone ? <span className="text-sm text-slate-500">{row.phone}</span> : <span className="text-sm text-slate-300">-</span> },
    { key: 'batch', label: 'Batch', render: (row) => row.batch?.name ? <Badge variant="info" className="text-xs">{row.batch.name}</Badge> : <span className="text-xs text-slate-300">-</span> },
    { key: 'isActive', label: 'Status', render: (row) => <Badge variant={row.isActive ? 'success' : 'danger'}>{row.isActive ? 'Active' : 'Inactive'}</Badge> },
    { key: 'createdAt', label: 'Joined', render: (row) => <span className="text-sm text-slate-500">{formatDate(row.createdAt)}</span> },
    { key: 'actions', label: '', render: (row) => (
      <div className="flex items-center gap-1">
        <button onClick={(e) => { e.stopPropagation(); setEditStudent(row); setShowModal(true); }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-primary-500"><Edit3 className="h-3.5 w-3.5" /></button>
        <button onClick={(e) => { e.stopPropagation(); if (confirm('Delete this student?')) deleteMutation.mutate(row._id); }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
      </div>
    )},
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Students</h1>
          <p className="text-slate-500">Manage all enrolled students</p>
        </div>
        <button onClick={() => { setEditStudent(null); setShowModal(true); }} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Student
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard title="Total Students" value={data?.pagination?.total || students.length || 0} icon={Users} color="primary" />
        <StatsCard title="Active" value={students.filter(s => s.isActive).length || 0} icon={UserCheck} color="secondary" />
        <StatsCard title="Inactive" value={students.filter(s => !s.isActive).length || 0} icon={UserX} color="accent" />
        <StatsCard title="Avg Per Batch" value={stats.avgPerBatch || '-'} icon={GraduationCap} color="purple" />
      </div>

      <DataTable
        columns={columns}
        data={students}
        loading={isLoading}
        page={page}
        totalPages={data?.pagination?.totalPages || 1}
        onPageChange={setPage}
        onSearch={setSearch}
      />

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditStudent(null); }} title={editStudent ? 'Edit Student' : 'Add Student'} size="lg">
        <form onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const data = Object.fromEntries(fd);
          data.isActive = fd.has('isActive');
          if (editStudent) {
            updateMutation.mutate({ id: editStudent._id, data });
          } else {
            createMutation.mutate({ ...data, role: 'student' });
          }
          setShowModal(false);
          setEditStudent(null);
        }} className="space-y-4">
          <input name="name" placeholder="Full Name" className="input-field" required defaultValue={editStudent?.name || ''} />
          <input name="email" type="email" placeholder="Email" className="input-field" required defaultValue={editStudent?.email || ''} />
          <input name="phone" placeholder="Phone" className="input-field" defaultValue={editStudent?.phone || ''} />
          <div className="grid grid-cols-2 gap-4">
            <select name="gender" className="input-field" defaultValue={editStudent?.gender || ''}>
              <option value="">Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <input name="dateOfBirth" type="date" className="input-field" defaultValue={editStudent?.dateOfBirth ? new Date(editStudent.dateOfBirth).toISOString().split('T')[0] : ''} />
          </div>
          {!editStudent && (
            <input name="password" type="password" placeholder="Password" className="input-field" required minLength={6} />
          )}
          <div className="flex items-center gap-2">
            <input name="isActive" type="checkbox" defaultChecked={editStudent?.isActive ?? true} className="rounded" />
            <span className="text-sm">Active Account</span>
          </div>
          <button type="submit" className="btn-primary w-full">{editStudent ? 'Update Student' : 'Create Student'}</button>
        </form>
      </Modal>
    </motion.div>
  );
};
