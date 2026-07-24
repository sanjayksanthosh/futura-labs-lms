import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, BookOpen } from 'lucide-react';
import { useFetch, useMutate } from '../../hooks/useQuery';
import { courseService } from '../../services/endpoints';
import { StatsCard } from '../../components/ui/StatsCard';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { formatDate, truncate } from '../../utils/helpers';

export const AdminCourses = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const { data, isLoading } = useFetch('admin-courses', () => courseService.getAll({ limit: 50 }));
  const createMutation = useMutate((formData) => courseService.create(formData), { invalidateKeys: ['admin-courses'] });

  const courses = data?.data || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Courses</h1>
          <p className="text-slate-500">Create and manage courses</p>
        </div>
        <button onClick={() => navigate('/admin/courses/create')} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> New Course
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Total Courses" value={courses.length} icon={BookOpen} color="primary" />
        <StatsCard title="Published" value={courses.filter(c => c.isPublished).length} icon={BookOpen} color="secondary" />
        <StatsCard title="Free Courses" value={courses.filter(c => c.isFree).length} icon={BookOpen} color="accent" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass rounded-2xl p-4"><div className="skeleton h-40 mb-4" /><div className="skeleton h-4 w-3/4 mb-2" /><div className="skeleton h-3 w-1/2" /></div>
        )) : courses.map((course) => (
          <motion.div key={course._id} whileHover={{ scale: 1.02 }} onClick={() => navigate(`/admin/courses/${course._id}`)} className="glass rounded-2xl overflow-hidden cursor-pointer group">
            <div className="h-40 bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-white/50" />
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={course.isPublished ? 'success' : 'warning'}>{course.isPublished ? 'Published' : 'Draft'}</Badge>
                <Badge>{course.level}</Badge>
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{course.title}</h3>
              <p className="text-sm text-slate-500 mb-3">{truncate(course.description, 80)}</p>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{course.enrolledStudents?.length || 0} students</span>
                <span>{course.totalLessons || 0} lessons</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Course" size="lg">
        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target); createMutation.mutate(Object.fromEntries(fd)); setShowModal(false); }} className="space-y-4">
          <input name="title" placeholder="Course Title" className="input-field" required />
          <textarea name="description" placeholder="Description" className="input-field" rows={3} />
          <input name="shortDescription" placeholder="Short Description" className="input-field" />
          <div className="grid grid-cols-2 gap-4">
            <select name="level" className="input-field">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <input name="category" placeholder="Category" className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input name="price" type="number" placeholder="Price (0 for free)" className="input-field" defaultValue={0} />
            <label className="flex items-center gap-2 text-sm"><input name="isFree" type="checkbox" defaultChecked /> Free Course</label>
          </div>
          <button type="submit" className="btn-primary w-full">Create Course</button>
        </form>
      </Modal>
    </motion.div>
  );
};
