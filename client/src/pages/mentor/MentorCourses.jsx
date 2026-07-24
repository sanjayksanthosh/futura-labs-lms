import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, BookOpen, Eye, Edit3, Users, BarChart3 } from 'lucide-react';
import { useFetch } from '../../hooks/useQuery';
import { courseService } from '../../services/endpoints';
import { StatsCard } from '../../components/ui/StatsCard';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatDate, truncate } from '../../utils/helpers';

export const MentorCourses = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useFetch('mentor-courses-list', () => courseService.getAll({ limit: 50 }));
  const courses = data?.data || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">My Courses</h1><p className="text-slate-500">Manage your courses</p></div>
        <button onClick={() => navigate('/admin/courses/create')} className="btn-primary flex items-center gap-2"><Plus className="h-4 w-4" /> Create Course</button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatsCard title="Total Courses" value={courses.length} icon={BookOpen} color="primary" />
        <StatsCard title="Published" value={courses.filter(c => c.isPublished).length} icon={Eye} color="secondary" />
        <StatsCard title="Total Students" value={courses.reduce((s, c) => s + (c.enrolledStudents?.length || 0), 0)} icon={Users} color="accent" />
      </div>

      {isLoading ? <LoadingSpinner className="py-10" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <motion.div key={course._id} whileHover={{ scale: 1.02 }} className="glass rounded-2xl overflow-hidden cursor-pointer group">
              <div className="h-36 bg-gradient-to-br from-primary-500 to-secondary-500 relative">
                <div className="absolute inset-0 bg-black/10" />
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex gap-1">
                    <Badge variant={course.isPublished ? 'success' : 'warning'} className="text-xs bg-black/30 text-white border-0">{course.isPublished ? 'Live' : 'Draft'}</Badge>
                    <Badge className="text-xs bg-black/30 text-white border-0">{course.level}</Badge>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-1 truncate">{course.title}</h3>
                <p className="text-sm text-slate-500 mb-3 line-clamp-2">{truncate(course.description, 80)}</p>
                <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {course.enrolledStudents?.length || 0}</span>
                  <span className="flex items-center gap-1"><BarChart3 className="h-3 w-3" /> {course.totalLessons || 0} lessons</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); navigate(`/course/${course._id}`); }} className="btn-secondary text-xs py-1.5 flex-1"><Eye className="h-3 w-3" /> View</button>
                  <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/courses/${course._id}/edit`); }} className="btn-secondary text-xs py-1.5"><Edit3 className="h-3 w-3" /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
