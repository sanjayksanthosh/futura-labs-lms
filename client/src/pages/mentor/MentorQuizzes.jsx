import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, BrainCircuit } from 'lucide-react';
import { useFetch, useMutate } from '../../hooks/useQuery';
import { quizService } from '../../services/endpoints';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';

export const MentorQuizzes = () => {
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading } = useFetch(['mentor-quizzes', page], () => quizService.getAll({ page, limit: 10 }));
  const createMutation = useMutate((formData) => quizService.create(formData), { invalidateKeys: ['mentor-quizzes'] });

  const columns = [
    { key: 'title', label: 'Title', render: (row) => <div><p className="font-medium">{row.title}</p><p className="text-xs text-slate-500">{row.course?.title}</p></div> },
    { key: 'questions', label: 'Questions', render: (row) => row.questions?.length || 0 },
    { key: 'timeLimit', label: 'Time (min)' },
    { key: 'passingScore', label: 'Pass %' },
    { key: 'isPublished', label: 'Status', render: (row) => <Badge variant={row.isPublished ? 'success' : 'warning'}>{row.isPublished ? 'Active' : 'Draft'}</Badge> },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">Quizzes</h1><p className="text-slate-500">Manage quizzes</p></div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4" /> New Quiz</button>
      </div>
      <DataTable columns={columns} data={data?.data || []} loading={isLoading} page={page} totalPages={data?.pagination?.totalPages || 1} onPageChange={setPage} />
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Quiz" size="lg">
        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target); createMutation.mutate(Object.fromEntries(fd)); setShowModal(false); }} className="space-y-4">
          <input name="title" placeholder="Quiz Title" className="input-field" required />
          <input name="course" placeholder="Course ID" className="input-field" required />
          <div className="grid grid-cols-3 gap-4">
            <input name="timeLimit" type="number" placeholder="Time (min)" className="input-field" defaultValue={30} />
            <input name="passingScore" type="number" placeholder="Pass %" className="input-field" defaultValue={40} />
            <input name="maxAttempts" type="number" placeholder="Attempts" className="input-field" defaultValue={3} />
          </div>
          <button type="submit" className="btn-primary w-full">Create Quiz</button>
        </form>
      </Modal>
    </motion.div>
  );
};
