import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, BrainCircuit, HelpCircle, Trash2, Edit3, X, Copy } from 'lucide-react';
import { useFetch, useMutate } from '../../hooks/useQuery';
import { quizService } from '../../services/endpoints';
import { StatsCard } from '../../components/ui/StatsCard';
import { DataTable } from '../../components/ui/DataTable';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { formatDate } from '../../utils/helpers';

const emptyQuestion = () => ({
  question: '', type: 'mcq', options: ['', ''], correctAnswer: '', points: 1,
});

export const AdminQuizzes = () => {
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editQuiz, setEditQuiz] = useState(null);
  const [quizForm, setQuizForm] = useState({ title: '', description: '', course: '', timeLimit: 30, passingScore: 40, maxAttempts: 3, questions: [emptyQuestion()] });

  const { data, isLoading } = useFetch(['admin-quizzes', page], () => quizService.getAll({ page, limit: 10 }));
  const createMutation = useMutate((d) => quizService.create(d), { invalidateKeys: ['admin-quizzes'] });
  const updateMutation = useMutate(({ id, data }) => quizService.update(id, data), { invalidateKeys: ['admin-quizzes'] });
  const deleteMutation = useMutate((id) => quizService.delete(id), { invalidateKeys: ['admin-quizzes'] });

  const quizzes = data?.data || [];

  const openCreate = () => {
    setEditQuiz(null);
    setQuizForm({ title: '', description: '', course: '', timeLimit: 30, passingScore: 40, maxAttempts: 3, questions: [emptyQuestion()] });
    setShowModal(true);
  };

  const openEdit = (quiz) => {
    setEditQuiz(quiz);
    setQuizForm({
      title: quiz.title || '', description: quiz.description || '', course: quiz.course?._id || '',
      timeLimit: quiz.timeLimit || 30, passingScore: quiz.passingScore || 40, maxAttempts: quiz.maxAttempts || 3,
      questions: quiz.questions?.length ? quiz.questions : [emptyQuestion()],
    });
    setShowModal(true);
  };

  const updateForm = (key, value) => setQuizForm(prev => ({ ...prev, [key]: value }));

  const updateQuestion = (i, key, value) => {
    const qs = [...quizForm.questions];
    qs[i] = { ...qs[i], [key]: value };
    updateForm('questions', qs);
  };

  const updateOption = (qi, oi, value) => {
    const qs = [...quizForm.questions];
    qs[qi].options[oi] = value;
    updateForm('questions', qs);
  };

  const addQuestion = () => updateForm('questions', [...quizForm.questions, emptyQuestion()]);
  const removeQuestion = (i) => {
    const qs = quizForm.questions.filter((_, idx) => idx !== i);
    updateForm('questions', qs.length ? qs : [emptyQuestion()]);
  };
  const addOption = (qi) => {
    const qs = [...quizForm.questions];
    qs[qi].options.push('');
    updateForm('questions', qs);
  };
  const removeOption = (qi, oi) => {
    const qs = [...quizForm.questions];
    qs[qi].options = qs[qi].options.filter((_, idx) => idx !== oi);
    updateForm('questions', qs);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...quizForm,
      questions: quizForm.questions.filter(q => q.question.trim()),
    };
    if (editQuiz) {
      updateMutation.mutate({ id: editQuiz._id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
    setShowModal(false);
  };

  const columns = [
    { key: 'title', label: 'Title', render: (row) => (
      <div><p className="font-medium text-sm">{row.title}</p><p className="text-xs text-slate-500">{row.course?.title || 'General'}</p></div>
    )},
    { key: 'questions', label: 'Questions', render: (row) => <span className="text-sm">{row.questions?.length || 0}</span> },
    { key: 'timeLimit', label: 'Time', render: (row) => <span className="text-sm">{row.timeLimit || '-'} min</span> },
    { key: 'passingScore', label: 'Pass %', render: (row) => <span className="text-sm">{row.passingScore || 40}%</span> },
    { key: 'attempts', label: 'Attempts', render: (row) => <span className="text-sm">{row.attemptsCount || 0}/{row.maxAttempts || '∞'}</span> },
    { key: 'isPublished', label: 'Status', render: (row) => <Badge variant={row.isPublished ? 'success' : 'warning'} className="text-xs">{row.isPublished ? 'Published' : 'Draft'}</Badge> },
    { key: 'actions', label: '', render: (row) => (
      <div className="flex items-center gap-1">
        <button onClick={(e) => { e.stopPropagation(); openEdit(row); }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-primary-500"><Edit3 className="h-3.5 w-3.5" /></button>
        <button onClick={(e) => { e.stopPropagation(); if (confirm('Delete this quiz?')) deleteMutation.mutate(row._id); }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
      </div>
    )},
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quizzes</h1>
          <p className="text-slate-500">Create and manage quizzes</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4" /> New Quiz</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard title="Total Quizzes" value={data?.pagination?.total || quizzes.length} icon={BrainCircuit} color="primary" />
        <StatsCard title="Published" value={quizzes.filter(q => q.isPublished).length} icon={HelpCircle} color="secondary" />
        <StatsCard title="Total Questions" value={quizzes.reduce((s, q) => s + (q.questions?.length || 0), 0)} icon={Copy} color="accent" />
        <StatsCard title="Avg Pass Rate" value={quizzes.length ? Math.round(quizzes.reduce((s, q) => s + (q.passingScore || 40), 0) / quizzes.length) : 0} icon={BrainCircuit} color="purple" suffix="%" />
      </div>

      <DataTable columns={columns} data={quizzes} loading={isLoading} page={page} totalPages={data?.pagination?.totalPages || 1} onPageChange={setPage} />

      {/* Create/Edit Quiz Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditQuiz(null); }} title={editQuiz ? 'Edit Quiz' : 'Create Quiz'} size="2xl">
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-4">
            <input value={quizForm.title} onChange={e => updateForm('title', e.target.value)} placeholder="Quiz Title" className="input-field" required />
            <textarea value={quizForm.description} onChange={e => updateForm('description', e.target.value)} placeholder="Description" className="input-field" rows={2} />
            <input value={quizForm.course} onChange={e => updateForm('course', e.target.value)} placeholder="Course ID (optional)" className="input-field" />
            <div className="grid grid-cols-3 gap-4">
              <div><label className="label">Time (min)</label><input type="number" value={quizForm.timeLimit} onChange={e => updateForm('timeLimit', Number(e.target.value))} className="input-field" /></div>
              <div><label className="label">Pass %</label><input type="number" value={quizForm.passingScore} onChange={e => updateForm('passingScore', Number(e.target.value))} className="input-field" /></div>
              <div><label className="label">Max Attempts</label><input type="number" value={quizForm.maxAttempts} onChange={e => updateForm('maxAttempts', Number(e.target.value))} className="input-field" /></div>
            </div>
          </div>

          {/* Questions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-sm">Questions ({quizForm.questions.length})</h4>
              <button type="button" onClick={addQuestion} className="btn-primary text-xs py-1.5"><Plus className="h-3 w-3" /> Add Question</button>
            </div>
            <div className="space-y-4">
              {quizForm.questions.map((q, qi) => (
                <div key={qi} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-xs font-bold text-primary-500 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-full">Q{qi + 1}</span>
                    <button type="button" onClick={() => removeQuestion(qi)} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                  <input value={q.question} onChange={e => updateQuestion(qi, 'question', e.target.value)} className="input-field text-sm mb-2" placeholder="Enter question" />
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <select value={q.type} onChange={e => updateQuestion(qi, 'type', e.target.value)} className="input-field text-xs">
                      <option value="mcq">Single Choice</option>
                      <option value="multiple_select">Multi Select</option>
                      <option value="true_false">True/False</option>
                      <option value="short_answer">Short Answer</option>
                      <option value="fill_blank">Fill in Blank</option>
                    </select>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Points:</span>
                      <input type="number" value={q.points} onChange={e => updateQuestion(qi, 'points', Number(e.target.value))} className="input-field text-xs w-16" min={1} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <input type="radio" name={`correct-${qi}`} checked={q.correctAnswer === opt} onChange={() => updateQuestion(qi, 'correctAnswer', opt)} className="shrink-0" />
                        <input value={opt} onChange={e => updateOption(qi, oi, e.target.value)} className="input-field text-xs flex-1" placeholder={`Option ${oi + 1}`} />
                        <button type="button" onClick={() => removeOption(qi, oi)} disabled={q.options.length <= 2} className="p-1 text-slate-300 hover:text-red-400 disabled:opacity-30"><X className="h-3 w-3" /></button>
                      </div>
                    ))}
                    <button type="button" onClick={() => addOption(qi)} className="text-xs text-primary-500 hover:underline">+ Add option</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button type="submit" className="btn-primary w-full">{editQuiz ? 'Update Quiz' : 'Create Quiz'}</button>
        </form>
      </Modal>
    </motion.div>
  );
};
