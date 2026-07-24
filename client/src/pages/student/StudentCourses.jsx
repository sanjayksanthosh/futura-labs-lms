import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Users, Play, TrendingUp, Award, ChevronRight } from 'lucide-react';
import { useFetch } from '../../hooks/useQuery';
import { courseService } from '../../services/endpoints';
import { StatsCard } from '../../components/ui/StatsCard';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { formatDate, truncate } from '../../utils/helpers';

export const StudentCourses = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useFetch('student-courses-list', () => courseService.getAll({ limit: 50 }));
  const courses = data?.data || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div><h1 className="text-2xl font-bold">My Courses</h1><p className="text-slate-500">Browse and continue your courses</p></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Enrolled" value={courses.length} icon={BookOpen} color="primary" />
        <StatsCard title="In Progress" value={courses.filter(c => (c.progress?.overallPercentage || 0) > 0 && (c.progress?.overallPercentage || 0) < 100).length} icon={Play} color="secondary" />
        <StatsCard title="Completed" value={courses.filter(c => c.progress?.overallPercentage === 100).length} icon={Award} color="accent" />
      </div>

      {isLoading ? <LoadingSpinner className="py-10" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => {
            const progress = course.progress?.overallPercentage || 0;
            return (
              <motion.div
                key={course._id}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate(`/course/${course._id}`)}
                className="glass rounded-2xl overflow-hidden cursor-pointer group"
              >
                <div className="h-36 bg-gradient-to-br from-primary-500 to-secondary-500 relative flex items-center justify-center">
                  <BookOpen className="h-14 w-14 text-white/30" />
                  <div className="absolute top-3 right-3">
                    <Badge variant={course.isFree ? 'success' : 'warning'} className="text-xs bg-black/30 text-white border-0">{course.isFree ? 'Free' : 'Premium'}</Badge>
                  </div>
                  {progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/30 backdrop-blur-sm px-3 py-1.5">
                      <ProgressBar value={progress} max={100} size="sm" className="mb-0.5" />
                      <p className="text-xs text-white/80">{progress}% complete</p>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-1 truncate">{course.title}</h3>
                  <p className="text-sm text-slate-500 mb-3 line-clamp-2">{truncate(course.shortDescription || course.description, 80)}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {course.enrolledStudents?.length || 0}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {course.totalLessons || 0} lessons</span>
                    <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> {course.level}</span>
                  </div>
                  <button className="mt-3 text-xs text-primary-500 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    {progress > 0 ? 'Continue Learning' : 'Start Course'} <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};
