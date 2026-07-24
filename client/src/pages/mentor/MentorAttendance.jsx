import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck } from 'lucide-react';
import { useFetch, useMutate } from '../../hooks/useQuery';
import { attendanceService, batchService } from '../../services/endpoints';
import { Badge } from '../../components/ui/Badge';
import toast from 'react-hot-toast';

const statusColors = { present: 'success', absent: 'danger', late: 'warning', excused: 'info' };

export const MentorAttendance = () => {
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState([]);

  const { data: batchData } = useFetch('mentor-batches', () => batchService.getAll({ limit: 50 }));
  const markMutation = useMutate((formData) => attendanceService.bulkMark(formData), { invalidateKeys: ['attendance'] });
  const batches = batchData?.data || [];

  const handleLoadStudents = () => {
    if (!selectedBatch) return;
    const batch = batches.find((b) => b._id === selectedBatch);
    if (batch?.students) {
      setRecords(batch.students.map((s) => ({
        student: typeof s === 'object' ? s._id : s,
        studentName: typeof s === 'object' ? s.name : 'Student',
        status: 'present',
      })));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedBatch || !selectedDate) return toast.error('Select batch and date');
    markMutation.mutate({
      batch: selectedBatch,
      date: selectedDate,
      records: records.map((r) => ({ student: r.student, status: r.status })),
    });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div><h1 className="text-2xl font-bold">Mark Attendance</h1><p className="text-slate-500">Quick attendance management</p></div>

      <div className="glass rounded-2xl p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select value={selectedBatch} onChange={(e) => { setSelectedBatch(e.target.value); }} className="input-field">
              <option value="">Select Batch</option>
              {batches.map((b) => <option key={b._id} value={b._id}>{b.name} ({b.code})</option>)}
            </select>
            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="input-field" />
            <button type="button" onClick={handleLoadStudents} className="btn-secondary">Load Students</button>
          </div>

          {records.length > 0 && (
            <div className="mt-6">
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {records.map((record, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-sm font-medium">{record.studentName}</span>
                    <select
                      value={record.status}
                      onChange={(e) => {
                        const updated = [...records];
                        updated[idx].status = e.target.value;
                        setRecords(updated);
                      }}
                      className="input-field w-32 py-1.5"
                    >
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                      <option value="excused">Excused</option>
                    </select>
                  </div>
                ))}
              </div>
              <button type="submit" className="btn-primary mt-4 w-full">Save Attendance</button>
            </div>
          )}
        </form>
      </div>
    </motion.div>
  );
};
