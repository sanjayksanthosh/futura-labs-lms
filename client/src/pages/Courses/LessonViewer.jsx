import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFetch, useMutate } from '../../hooks/useQuery';
import { courseService, progressService } from '../../services/endpoints';
import {
  Play, FileText, CheckCircle, Circle, ChevronLeft, ChevronRight,
  ArrowLeft, Clock, BookOpen, Maximize2, CheckCheck
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { formatDate } from '../../utils/helpers';

const lessonIcons = { video: Play, pdf: FileText, document: FileText, text: FileText, quiz: BookOpen, assignment: BookOpen };

export const LessonViewer = () => {
  const { lessonId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const courseId = searchParams.get('course');

  const { data: courseData } = useFetch(['course-lesson-view', courseId], () =>
    courseService.getById(courseId), { enabled: !!courseId }
  );

  const progressMut = useMutate((d) => progressService.updateProgress(courseId, d), {
    invalidateKeys: ['course-lesson-view', courseId],
  });

  const course = courseData?.data || {};
  const modules = course.modules || [];
  let currentLesson = null;
  let prevLesson = null;
  let nextLesson = null;

  const allLessons = modules.flatMap((m) =>
    (m.lessons || []).map((l) => ({ ...l, moduleId: m._id, moduleTitle: m.title }))
  );
  const currentIdx = allLessons.findIndex((l) => l._id === lessonId);
  if (currentIdx >= 0) {
    currentLesson = allLessons[currentIdx];
    prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
    nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;
  }

  const handleComplete = () => {
    if (courseId && lessonId) {
      progressMut.mutate({ lessonId, completed: true });
    }
  };

  const renderContent = () => {
    if (!currentLesson) return <div className="text-center py-20 text-slate-500">Lesson not found</div>;

    switch (currentLesson.contentType) {
      case 'video':
        return (
          <div className="aspect-video bg-black rounded-2xl overflow-hidden">
            {currentLesson.content?.videoUrl ? (
              <iframe
                src={currentLesson.content.videoUrl.replace('watch?v=', 'embed/')}
                className="w-full h-full"
                allowFullScreen
                title={currentLesson.title}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/50">
                <Play className="h-16 w-16" />
              </div>
            )}
          </div>
        );
      case 'text':
        return (
          <div className="prose dark:prose-invert max-w-none p-6">
            <div dangerouslySetInnerHTML={{ __html: currentLesson.content?.textContent?.replace(/\n/g, '<br/>') || 'No content available' }} />
          </div>
        );
      case 'pdf':
        return (
          <div className="h-[600px] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            {currentLesson.content?.pdfUrl ? (
              <iframe src={currentLesson.content.pdfUrl} className="w-full h-full" title={currentLesson.title} />
            ) : (
              <div className="text-center text-slate-400">
                <FileText className="h-16 w-16 mx-auto mb-3" />
                <p>PDF not available</p>
              </div>
            )}
          </div>
        );
      default:
        return (
          <div className="p-12 text-center text-slate-500">
            <BookOpen className="h-16 w-16 mx-auto mb-3 opacity-40" />
            <p>Content type: {currentLesson.contentType}</p>
          </div>
        );
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-6xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary-500 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass rounded-2xl overflow-hidden">
            {renderContent()}
          </div>
          <div className="glass rounded-2xl p-6">
            <h1 className="text-2xl font-bold mb-2">{currentLesson?.title}</h1>
            <div className="flex items-center gap-3 text-sm text-slate-500 mb-4">
              <Badge>{currentLesson?.contentType}</Badge>
              <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {currentLesson?.duration || 0} min</span>
              <span>{currentLesson?.moduleTitle}</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400">{currentLesson?.description}</p>

            {currentLesson?.content?.externalLinks?.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-sm mb-2">Resources</h4>
                <div className="flex flex-wrap gap-2">
                  {currentLesson.content.externalLinks.map((link, i) => (
                    <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" /> {link.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            {prevLesson ? (
              <button
                onClick={() => navigate(`/lesson/${prevLesson._id}?course=${courseId}`)}
                className="btn-secondary flex items-center gap-2"
              >
                <ChevronLeft className="h-4 w-4" /> Previous: {prevLesson.title}
              </button>
            ) : <div />}
            <div className="flex gap-2">
              <button onClick={handleComplete} className="btn-primary flex items-center gap-2">
                <CheckCheck className="h-4 w-4" /> Mark Complete
              </button>
              {nextLesson && (
                <button
                  onClick={() => navigate(`/lesson/${nextLesson._id}?course=${courseId}`)}
                  className="btn-primary flex items-center gap-2"
                >
                  Next: {nextLesson.title} <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Course Content */}
        <div className="glass rounded-2xl p-4 h-fit sticky top-20">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary-500" /> {course.title}
          </h3>
          {course.progress && <ProgressBar value={course.progress.overallPercentage} max={100} size="sm" className="mb-4" />}
          <div className="space-y-1 max-h-[60vh] overflow-y-auto">
            {modules.map((mod) => (
              <div key={mod._id}>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-3 mb-1 px-2">{mod.title}</p>
                {mod.lessons?.map((lesson) => {
                  const Icon = lessonIcons[lesson.contentType] || BookOpen;
                  const isActive = lesson._id === lessonId;
                  const isCompleted = course.progress?.completedLessons?.includes(lesson._id);
                  return (
                    <button
                      key={lesson._id}
                      onClick={() => navigate(`/lesson/${lesson._id}?course=${courseId}`)}
                      className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-xs transition-colors ${
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {isCompleted ? <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" /> : <Circle className="h-3.5 w-3.5 shrink-0" />}
                      <Icon className="h-3 w-3 shrink-0" />
                      <span className="truncate">{lesson.title}</span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
