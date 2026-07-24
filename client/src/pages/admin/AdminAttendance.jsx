import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, CheckCircle, XCircle, Clock, AlertCircle, Download } from 'lucide-react';
import { useFetch, useMutate } from '../../hooks/useQuery';
import { attendanceService } from '../../services/endpoints';
import { StatsCard } from '../../components/ui/StatsCard';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { formatDate } from '../../utils/helpers';

const statusConfig = {
  present: { icon: CheckCircle, color: 'text-green-500', variant: 'success' },
  absent: { icon: XCircle, color: 'text-red-500', variant: 'danger' },
  late: { icon: Clock, color: 'text-amber-500', variant: 'warning' },
  excused: { icon: AlertCircle, color: 'text-blue-500', variant: 'info' },
};

export const AdminAttendance = () => {
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const { data, isLoading, refetch } = useFetch(['attendance', page], () => attendanceService.getAll({ page, limit: 20 }));
  const markMutate = useMutate((d) => attendanceService.mark(d), { invalidateKeys: ['attendance'] });
  const bulkMutate = useMutate((d) => attendanceService.bulkMark(d), { invalidateKeys: ['attendance'] });

  const records = data?.data || [];
  const summary = data?.summary || {};

  const [markForm, setMarkForm] = useState({ date: new Date().toISOString().split('T')[0], batch: '', records: [] });

  const columns = [
    { key: 'student', label: 'Student', render: (row) => (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-white text-xs font-bold">
          {row.student?.name?.[0] || '?'}
        </div>
        <div><p className="text-sm font-medium">{row.student?.name || '-'}</p></div>
      </div>
    )},
    { key: 'date', label: 'Date', render: (row) => <span className="text-sm">{formatDate(row.date)}</span> },
    { key: 'status', label: 'Status', render: (row) => {
      const cfg = statusConfig[row.status] || statusConfig.absent;
      return <Badge variant={cfg.variant} className="capitalize text-xs">{row.status}</Badge>;
    }},
    { key: 'batch', label: 'Batch', render: (row) => row.batch?.name ? <Badge variant="info" className="text-xs">{row.batch.name}</Badge> : <span className="text-xs text-slate-300">-</span> },
    { key: 'markedBy', label: 'Marked By', render: (row) => <span className="text-xs text-slate-500">{row.markedBy?.name || '-'}</span> },
  ];

  const handleMarkAttendance = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const data = Object.fromEntries(fd);
    if (data.studentIds) {
      const ids = data.studentIds.split(',').map(s => s.trim());
      bulkMutate.mutate({ date: data.date, batch: data.batch, records: ids.map(id => ({ student: id, status: data.status })) });
    } else {
      markMutate.mutate({ student: data.student, date: data.date, status: data.status, batch: data.batch });
    }
    setShowModal(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Attendance</h1>
          <p className="text-slate-500">View and manage attendance records</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><CalendarCheck className="h-4 w-4" /> Mark Attendance</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard title="Total Records" value={records.length || 0} icon={CalendarCheck} color="primary" />
        <StatsCard title="Present" value={records.filter(r => r.status === 'present').length || 0} icon={CheckCircle} color="secondary" />
        <StatsCard title="Absent" value={records.filter(r => r.status === 'absent').length || 0} icon={XCircle} color="danger" />
        <StatsCard title="Late" value={records.filter(r => r.status === 'late').length || 0} icon={Clock} color="accent" />
      </div>

      <DataTable columns={columns} data={records} loading={isLoading} page={page} totalPages={data?.pagination?.totalPages || 1} onPageChange={setPage} searchable />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Mark Attendance" size="lg">
        <form onSubmit={handleMarkAttendance} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Date</label>
              <input name="date" type="date" className="input-field" defaultValue={new Date().toISOString().split('T')[0]} required />
            </div>
            <div>
              <label className="label">Batch ID</label>
              <input name="batch" placeholder="Batch ID" className="input-field" />
            </div>
          </div>
          <div>
            <label className="label">Status</label>
            <select name="status" className="input-field" defaultValue="present">
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="excused">Excused</option>
            </select>
          </div>
          <div>
            <label className="label">Single Student ID</label>
            <input name="student" placeholder="Student ID (leave empty for bulk)" className="input-field" />
          </div>
          <div>
            <label className="label">Bulk: Student IDs (comma separated)</label>
            <textarea name="studentIds" placeholder="id1, id2, id3..." className="input-field" rows={2} />
          </div>
          <button type="submit" className="btn-primary w-full">Save Attendance</button>
        </form>
      </Modal>
    </motion.div>
  );
};
