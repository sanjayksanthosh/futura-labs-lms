import { useState } from 'react';
import { motion } from 'framer-motion';
import { useFetch } from '../../hooks/useQuery';
import { userService } from '../../services/endpoints';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { StatsCard } from '../../components/ui/StatsCard';
import { Users, UserCheck, GraduationCap, Eye, Mail, Phone } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

export const MentorStudents = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const { data, isLoading } = useFetch(['mentor-students', page, search], () =>
    userService.getAll({ role: 'student', page, limit: 10, search })
  );
  const students = data?.data || [];

  const columns = [
    { key: 'name', label: 'Student', render: (row) => (
      <div className="flex items-center gap-3">
        <Avatar name={row.name} size="sm" />
        <div><p className="font-medium text-sm">{row.name}</p><p className="text-xs text-slate-500">{row.email}</p></div>
      </div>
    )},
    { key: 'batch', label: 'Batch', render: (row) => row.batch?.name ? <Badge variant="info" className="text-xs">{row.batch.name}</Badge> : <span className="text-xs text-slate-300">-</span> },
    { key: 'progress', label: 'Progress', render: (row) => <ProgressBar value={row.progress?.overallPercentage || 0} max={100} size="sm" className="w-24" /> },
    { key: 'isActive', label: 'Status', render: (row) => <Badge variant={row.isActive ? 'success' : 'danger'} className="text-xs">{row.isActive ? 'Active' : 'Inactive'}</Badge> },
    { key: 'actions', label: '', render: (row) => (
      <button onClick={(e) => { e.stopPropagation(); setSelectedStudent(row); }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-primary-500"><Eye className="h-3.5 w-3.5" /></button>
    )},
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div><h1 className="text-2xl font-bold">Students</h1><p className="text-slate-500">View and manage your students</p></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Total" value={students.length} icon={Users} color="primary" />
        <StatsCard title="Active" value={students.filter(s => s.isActive).length} icon={UserCheck} color="secondary" />
        <StatsCard title="Avg Progress" value={students.length > 0 ? Math.round(students.reduce((s, st) => s + (st.progress?.overallPercentage || 0), 0) / students.length) : 0} icon={GraduationCap} color="accent" suffix="%" />
      </div>
      <DataTable columns={columns} data={students} loading={isLoading} page={page} totalPages={data?.pagination?.totalPages || 1} onPageChange={setPage} onSearch={setSearch} />

      <Modal isOpen={!!selectedStudent} onClose={() => setSelectedStudent(null)} title={selectedStudent?.name || 'Student Details'}>
        {selectedStudent && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <Avatar name={selectedStudent.name} size="lg" />
              <div>
                <h3 className="font-semibold text-lg">{selectedStudent.name}</h3>
                <Badge variant={selectedStudent.isActive ? 'success' : 'danger'}>{selectedStudent.isActive ? 'Active' : 'Inactive'}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" /> {selectedStudent.email}</div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" /> {selectedStudent.phone || '-'}</div>
              <div><span className="text-slate-500">Batch:</span> {selectedStudent.batch?.name || '-'}</div>
              <div><span className="text-slate-500">Joined:</span> {formatDate(selectedStudent.createdAt)}</div>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
};
