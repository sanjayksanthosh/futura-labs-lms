import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFetch, useMutate } from '../../hooks/useQuery';
import { courseService, progressService } from '../../services/endpoints';
import {
  Users, BookOpen, BarChart3, Clock, Edit3, Trash2, Plus, CheckCircle, Circle, Play,
  ChevronDown, ChevronRight, Video, FileText, Award, Download, Eye
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { DataTable } from '../../components/ui/DataTable';
import { StatsCard } from '../../components/ui/StatsCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export const AdminCourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [expandedMod, setExpandedMod] = useState({});

  const { data, isLoading, refetch } = useFetch(['admin-course', courseId], () =>
    courseService.getById(courseId)
  );
  const deleteMut = useMutate(() => courseService.delete(courseId), {
    invalidateKeys: ['courses'],
  });
  const enrollMut = useMutate((studentId) => courseService.enroll(courseId, studentId), {
    invalidateKeys: ['admin-course', courseId],
  });

  const course = data?.data || {};
  const modules = course.modules || [];

  if (isLoading) return <LoadingSpinner className="py-20" />;

  const students = course.enrolledStudents || [];

  const studentColumns = [
    { key: 'name', label: 'Name', render: (r) => r.name || `${r.firstName || ''} ${r.lastName || ''}`.trim() },
    { key: 'email', label: 'Email' },
    { key: 'progress', label: 'Progress', render: (r) => <ProgressBar value={r.progress?.overallPercentage || 0} max={100} size="sm" /> },
    { key: 'enrolledAt', label: 'Enrolled', render: (r) => r.enrolledAt ? new Date(r.enrolledAt).toLocaleDateString() : '-' },
    { key: 'actions', label: '', render: (r) => (
      <button className="text-xs text-primary-500 hover:underline">View</button>
    )},
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Header */}
      <div className="glass rounded-3xl overflow-hidden">
        <div className="h-40 bg-gradient-to-br from-primary-600 to-secondary-600 relative">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="info" className="bg-white/20 text-white border-0">{course.level}</Badge>
                  <Badge variant="info" className="bg-white/20 text-white border-0">{course.category}</Badge>
                </div>
                <h1 className="text-3xl font-bold">{course.title}</h1>
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigate(`/admin/courses/${courseId}/edit`)} className="flex items-center gap-1 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm text-white">
                  <Edit3 className="h-4 w-4" /> Edit
                </button>
                <button onClick={() => { if (confirm('Delete this course?')) deleteMut.mutate(); navigate('/admin/courses'); }} className="flex items-center gap-1 px-3 py-2 bg-red-500/40 hover:bg-red-500/60 rounded-xl text-sm text-white">
                  <Trash2 className="h-4 w-4" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <p className="text-slate-600 dark:text-slate-400 mb-4">{course.description}</p>
          <div className="grid grid-cols-4 gap-4">
            <StatsCard icon={Users} title="Students" value={students.length} />
            <StatsCard icon={BookOpen} title="Modules" value={modules.length} />
            <StatsCard icon={BarChart3} title="Lessons" value={modules.reduce((s, m) => s + (m.lessons?.length || 0), 0)} />
            <StatsCard icon={Clock} title="Duration" value={course.duration || 'Flexible'} />
          </div>
        </div>
      </div>

      {/* Modules */}
      <div className="glass rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Course Content</h2>
          <button onClick={() => navigate(`/admin/courses/${courseId}/edit`)} className="btn-primary text-sm"><Plus className="h-4 w-4" /> Manage</button>
        </div>
        <div className="space-y-2">
          {modules.map((mod, mi) => (
            <div key={mod._id} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <button onClick={() => setExpandedMod(p => ({ ...p, [mod._id]: !p[mod._id] }))}
                className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50">
                <div className="flex items-center gap-3">
                  {expandedMod[mod._id] ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                  <span className="font-medium text-sm">Module {mi + 1}: {mod.title}</span>
                  <Badge variant="info" className="text-xs">{mod.lessons?.length || 0} lessons</Badge>
                </div>
              </button>
              {expandedMod[mod._id] && (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {mod.lessons?.map((lesson, li) => (
                    <div key={lesson._id} className="flex items-center justify-between p-3 pl-12 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg ${lesson.contentType === 'video' ? 'bg-blue-50 text-blue-500' : 'bg-slate-100 text-slate-500'}`}>
                          {lesson.contentType === 'video' ? <Video className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
                        </div>
                        <span className="text-sm">{lesson.title}</span>
                        <span className="text-xs text-slate-400">{lesson.contentType}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <span>{lesson.duration || 0} min</span>
                        {lesson.isFree && <Badge variant="success" className="text-xs">Free</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Enrolled Students */}
      <div className="glass rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2"><Users className="h-5 w-5" /> Enrolled Students ({students.length})</h2>
          <button onClick={() => setShowEnrollModal(true)} className="btn-primary text-sm"><Plus className="h-4 w-4" /> Enroll Student</button>
        </div>
        <DataTable columns={studentColumns} data={students} emptyMessage="No students enrolled yet" />
      </div>

      {/* Enroll Modal */}
      <Modal isOpen={showEnrollModal} onClose={() => setShowEnrollModal(false)} title="Enroll Student">
        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target); enrollMut.mutate(fd.get('studentId')); setShowEnrollModal(false); }} className="space-y-4">
          <input name="studentId" placeholder="Student ID" className="input-field" required />
          <button type="submit" className="btn-primary w-full">Enroll</button>
        </form>
      </Modal>
    </motion.div>
  );
};
