import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ClipboardCheck, Eye, Edit3, Trash2, Download, Users } from 'lucide-react';
import { useFetch, useMutate } from '../../hooks/useQuery';
import { assignmentService } from '../../services/endpoints';
import { StatsCard } from '../../components/ui/StatsCard';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { formatDate } from '../../utils/helpers';

export const AdminAssignments = () => {
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editAssignment, setEditAssignment] = useState(null);
  const [viewSubmissions, setViewSubmissions] = useState(null);
  const [gradeForm, setGradeForm] = useState({});

  const { data, isLoading } = useFetch(['admin-assignments', page], () => assignmentService.getAll({ page, limit: 10 }));
  const createMutation = useMutate((d) => assignmentService.create(d), { invalidateKeys: ['admin-assignments'] });
  const updateMutation = useMutate(({ id, data }) => assignmentService.update(id, data), { invalidateKeys: ['admin-assignments'] });
  const deleteMutation = useMutate((id) => assignmentService.delete(id), { invalidateKeys: ['admin-assignments'] });
  const gradeMutation = useMutate(({ submissionId, data }) => assignmentService.gradeSubmission(submissionId, data), { invalidateKeys: ['admin-assignments'] });

  // Fetch submissions when viewing
  const { data: subsData } = useFetch(['submissions', viewSubmissions?._id], () =>
    assignmentService.getSubmissions(viewSubmissions._id, {}), { enabled: !!viewSubmissions }
  );

  const assignments = data?.data || [];
  const submissions = subsData?.data || [];

  const openEdit = (a) => {
    setEditAssignment(a);
    setShowModal(true);
  };

  const columns = [
    { key: 'title', label: 'Title', render: (row) => (
      <div><p className="font-medium text-sm">{row.title}</p><p className="text-xs text-slate-500">{row.course?.title || 'General'}</p></div>
    )},
    { key: 'type', label: 'Type', render: (row) => <Badge variant="primary" className="capitalize text-xs">{row.type?.replace('_', ' ') || 'assignment'}</Badge> },
    { key: 'totalPoints', label: 'Points', render: (row) => <span className="text-sm">{row.totalPoints}</span> },
    { key: 'dueDate', label: 'Due', render: (row) => <span className="text-xs text-slate-500">{formatDate(row.dueDate)}</span> },
    { key: 'submissions', label: 'Submissions', render: (row) => <span className="text-xs">{row.submissionCount || 0}/{row.totalStudents || 'N/A'}</span> },
    { key: 'isPublished', label: 'Status', render: (row) => <Badge variant={row.isPublished ? 'success' : 'warning'} className="text-xs">{row.isPublished ? 'Live' : 'Draft'}</Badge> },
    { key: 'actions', label: '', render: (row) => (
      <div className="flex items-center gap-1">
        <button onClick={(e) => { e.stopPropagation(); setViewSubmissions(row); }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-primary-500"><Eye className="h-3.5 w-3.5" /></button>
        <button onClick={(e) => { e.stopPropagation(); openEdit(row); }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-primary-500"><Edit3 className="h-3.5 w-3.5" /></button>
        <button onClick={(e) => { e.stopPropagation(); if (confirm('Delete this assignment?')) deleteMutation.mutate(row._id); }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
      </div>
    )},
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Assignments</h1>
          <p className="text-slate-500">Create and manage assignments</p>
        </div>
        <button onClick={() => { setEditAssignment(null); setShowModal(true); }} className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4" /> New Assignment</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard title="Total" value={assignments.length} icon={ClipboardCheck} color="primary" />
        <StatsCard title="Published" value={assignments.filter(a => a.isPublished).length} icon={Eye} color="secondary" />
        <StatsCard title="Submissions" value={assignments.reduce((s, a) => s + (a.submissionCount || 0), 0)} icon={Download} color="accent" />
        <StatsCard title="Avg Score" value={assignments.length ? Math.round(assignments.reduce((s, a) => s + (a.avgScore || 0), 0) / assignments.length) : 0} icon={Users} color="purple" suffix="%" />
      </div>

      <DataTable columns={columns} data={assignments} loading={isLoading} page={page} totalPages={data?.pagination?.totalPages || 1} onPageChange={setPage} />

      {/* Create/Edit Assignment Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditAssignment(null); }} title={editAssignment ? 'Edit Assignment' : 'Create Assignment'} size="lg">
        <form onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const data = Object.fromEntries(fd);
          if (editAssignment) {
            updateMutation.mutate({ id: editAssignment._id, data });
          } else {
            createMutation.mutate(data);
          }
          setShowModal(false);
          setEditAssignment(null);
        }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input name="title" placeholder="Assignment Title" className="input-field" required defaultValue={editAssignment?.title || ''} />
            <select name="type" className="input-field" defaultValue={editAssignment?.type || 'file_upload'}>
              <option value="file_upload">File Upload</option>
              <option value="text">Text/Written</option>
              <option value="quiz">Quiz</option>
              <option value="coding">Coding</option>
              <option value="presentation">Presentation</option>
            </select>
          </div>
          <textarea name="description" placeholder="Description" className="input-field" rows={3} defaultValue={editAssignment?.description || ''} />
          <input name="course" placeholder="Course ID" className="input-field" defaultValue={editAssignment?.course?._id || ''} />
          <div className="grid grid-cols-2 gap-4">
            <input name="totalPoints" type="number" placeholder="Total Points" className="input-field" defaultValue={editAssignment?.totalPoints || 100} />
            <input name="passingPoints" type="number" placeholder="Passing Points" className="input-field" defaultValue={editAssignment?.passingPoints || 40} />
          </div>
          <input name="dueDate" type="datetime-local" className="input-field" defaultValue={editAssignment?.dueDate ? new Date(editAssignment.dueDate).toISOString().slice(0, 16) : ''} />
          <div className="flex items-center gap-2">
            <input name="isPublished" type="checkbox" defaultChecked={editAssignment?.isPublished ?? true} />
            <span className="text-sm">Published</span>
          </div>
          <button type="submit" className="btn-primary w-full">{editAssignment ? 'Update' : 'Create'}</button>
        </form>
      </Modal>

      {/* View Submissions Modal */}
      <Modal isOpen={!!viewSubmissions} onClose={() => setViewSubmissions(null)} title={`Submissions: ${viewSubmissions?.title || ''}`} size="2xl">
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {submissions.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No submissions yet</p>
          ) : submissions.map((sub) => (
            <div key={sub._id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Avatar name={sub.student?.name} size="sm" />
                  <div>
                    <p className="font-medium text-sm">{sub.student?.name || 'Unknown'}</p>
                    <p className="text-xs text-slate-500">Submitted {formatDate(sub.submittedAt)}</p>
                  </div>
                </div>
                {sub.status === 'graded' ? (
                  <Badge variant="success" className="text-xs">{sub.score}/{viewSubmissions?.totalPoints || 100}</Badge>
                ) : (
                  <Badge variant="warning" className="text-xs">Pending</Badge>
                )}
              </div>
              {sub.textSubmission && <p className="text-sm text-slate-500 mb-2">{sub.textSubmission}</p>}
              {sub.files?.[0]?.url && (
                <a href={sub.files[0].url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-500 flex items-center gap-1 mb-2"><Download className="h-3 w-3" /> View Submission</a>
              )}
              {sub.status !== 'graded' ? (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                  <input
                    type="number"
                    placeholder="Score"
                    className="input-field w-20 text-sm"
                    value={gradeForm[sub._id]?.score || ''}
                    onChange={(e) => setGradeForm(p => ({ ...p, [sub._id]: { ...p[sub._id], score: e.target.value } }))}
                    max={viewSubmissions?.totalPoints || 100}
                  />
                  <input
                    placeholder="Feedback"
                    className="input-field flex-1 text-sm"
                    value={gradeForm[sub._id]?.feedback || ''}
                    onChange={(e) => setGradeForm(p => ({ ...p, [sub._id]: { ...p[sub._id], feedback: e.target.value } }))}
                  />
                  <button onClick={() => gradeMutation.mutate({ submissionId: sub._id, data: { score: Number(gradeForm[sub._id]?.score), feedback: gradeForm[sub._id]?.feedback } })} className="btn-primary text-xs py-2">Grade</button>
                </div>
              ) : sub.feedback && (
                <p className="text-xs text-slate-500 mt-1">Feedback: {sub.feedback}</p>
              )}
            </div>
          ))}
        </div>
      </Modal>
    </motion.div>
  );
};
