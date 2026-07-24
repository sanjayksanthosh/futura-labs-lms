import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Briefcase } from 'lucide-react';
import { useFetch, useMutate } from '../../hooks/useQuery';
import { internshipService } from '../../services/endpoints';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';

const statusColors = { active: 'success', completed: 'info', pending: 'warning', cancelled: 'danger' };

export const MentorInternships = () => {
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading } = useFetch(['mentor-internships', page], () => internshipService.getAll({ page, limit: 10 }));
  const createMutation = useMutate((formData) => internshipService.create(formData), { invalidateKeys: ['mentor-internships'] });

  const columns = [
    { key: 'student', label: 'Student', render: (row) => row.student?.name || '-' },
    { key: 'company', label: 'Company' },
    { key: 'position', label: 'Position' },
    { key: 'status', label: 'Status', render: (row) => <Badge variant={statusColors[row.status]}>{row.status}</Badge> },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Internships</h1></div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4" /> Add</button>
      </div>
      <DataTable columns={columns} data={data?.data || []} loading={isLoading} page={page} totalPages={data?.pagination?.totalPages || 1} onPageChange={setPage} />
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Internship">
        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target); createMutation.mutate(Object.fromEntries(fd)); setShowModal(false); }} className="space-y-4">
          <input name="student" placeholder="Student ID" className="input-field" required />
          <input name="company" placeholder="Company" className="input-field" required />
          <input name="position" placeholder="Position" className="input-field" required />
          <input name="startDate" type="date" className="input-field" required />
          <button type="submit" className="btn-primary w-full">Create</button>
        </form>
      </Modal>
    </motion.div>
  );
};
