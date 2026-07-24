import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFetch, useMutate } from '../../hooks/useQuery';
import { courseService, quizService, noteService } from '../../services/endpoints';
import { useSelector } from 'react-redux';
import {
  BookOpen, Play, FileText, ChevronDown, ChevronRight, Plus, Edit3, Trash2,
  Video, File, Clock, Users, BarChart3, CheckCircle, Circle, Lock, GripVertical,
  HelpCircle, StickyNote, ExternalLink
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { truncate } from '../../utils/helpers';

const lessonIcons = {
  video: Video, pdf: FileText, document: File, quiz: BarChart3,
  assignment: BookOpen, audio: File, image: File, text: FileText,
};

export const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [activeModule, setActiveModule] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [expandedNotes, setExpandedNotes] = useState({});

  const { data, isLoading, refetch } = useFetch(['course-detail', courseId], () =>
    courseService.getById(courseId)
  );
  const { data: quizzesData } = useFetch(['course-quizzes', courseId], () =>
    quizService.getAll({ courseId, limit: 50 })
  );
  const { data: notesData } = useFetch(['course-notes', courseId], () =>
    noteService.getAll({ courseId, limit: 50 })
  );

  const createModuleMut = useMutate((d) => courseService.createModule(courseId, d), {
    invalidateKeys: ['course-detail', courseId],
  });
  const createLessonMut = useMutate(
    (d) => courseService.createLesson(courseId, d.moduleId, d),
    { invalidateKeys: ['course-detail', courseId] }
  );
  const deleteModuleMut = useMutate((id) => courseService.deleteModule(courseId, id), {
    invalidateKeys: ['course-detail', courseId],
  });
  const deleteLessonMut = useMutate(
    (id) => courseService.deleteLesson(courseId, activeModule?._id, id),
    { invalidateKeys: ['course-detail', courseId] }
  );

  const course = data?.data || {};
  const modules = course.modules || [];
  const quizzes = quizzesData?.data || [];
  const notes = notesData?.data || [];
  const isMentorOrAdmin = ['super_admin', 'admin', 'mentor'].includes(user?.role);

  const getModuleQuizzes = (moduleId) => quizzes.filter((q) => q.module === moduleId);
  const getModuleNotes = (moduleId) => notes.filter((n) => n.module === moduleId);

  if (isLoading) return <LoadingSpinner className="py-20" />;

  const toggleModule = (id) => {
    setExpandedModules((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleNote = (id) => {
    setExpandedNotes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-6xl mx-auto">
      {/* Course Header */}
      <div className="glass rounded-3xl overflow-hidden">
        <div className="h-48 bg-gradient-to-br from-primary-600 via-primary-500 to-secondary-500 relative">
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="info" className="bg-white/20 text-white border-0">{course.level}</Badge>
              <Badge variant="info" className="bg-white/20 text-white border-0">{course.category}</Badge>
              {course.isFree && <Badge variant="info" className="bg-green-400/30 text-white border-0">Free</Badge>}
            </div>
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <p className="text-white/80 mt-1">{course.shortDescription || truncate(course.description, 120)}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-white/70">
              <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {course.enrolledStudents?.length || 0} enrolled</span>
              <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {course.totalLessons || 0} lessons</span>
              <span className="flex items-center gap-1"><BarChart3 className="h-4 w-4" /> {course.completionRate || 0}% completion</span>
              <span className="flex items-center gap-1"><HelpCircle className="h-4 w-4" /> {quizzes.length} quizzes</span>
              <span className="flex items-center gap-1"><StickyNote className="h-4 w-4" /> {notes.length} notes</span>
            </div>
          </div>
        </div>
        <div className="p-6">
          <p className="text-slate-600 dark:text-slate-400">{course.description}</p>
          {course.learningObjectives?.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-sm mb-2">What you'll learn:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {course.learningObjectives.map((obj, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    {obj}
                  </div>
                ))}
              </div>
            </div>
          )}
          {course.progress && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">Your Progress</span>
                <span>{course.progress.overallPercentage}%</span>
              </div>
              <ProgressBar value={course.progress.overallPercentage} max={100} />
            </div>
          )}
        </div>
      </div>

      {/* Modules & Lessons */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary-500" /> Course Content
            <span className="text-sm font-normal text-slate-500">({modules.reduce((s, m) => s + (m.lessons?.length || 0), 0)} lessons)</span>
          </h2>
          {isMentorOrAdmin && (
            <button onClick={() => setShowModuleModal(true)} className="btn-primary flex items-center gap-2 text-sm py-2">
              <Plus className="h-4 w-4" /> Add Module
            </button>
          )}
        </div>

        <div className="space-y-3">
          {modules.map((mod, idx) => {
            const moduleQuizzes = getModuleQuizzes(mod._id);
            const moduleNotes = getModuleNotes(mod._id);
            return (
              <div key={mod._id} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleModule(mod._id)}
                  className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {expandedModules[mod._id] ? <ChevronDown className="h-5 w-5 text-slate-400" /> : <ChevronRight className="h-5 w-5 text-slate-400" />}
                    <div className="text-left">
                      <h3 className="font-semibold text-sm">Module {idx + 1}: {mod.title}</h3>
                      <p className="text-xs text-slate-500">{mod.lessons?.length || 0} lessons{moduleQuizzes.length ? `, ${moduleQuizzes.length} quizzes` : ''}{moduleNotes.length ? `, ${moduleNotes.length} notes` : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isMentorOrAdmin && (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); setActiveModule(mod); setShowLessonModal(true); }} className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-primary-500">
                          <Plus className="h-4 w-4" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); deleteModuleMut.mutate(mod._id); }} className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </button>

                {expandedModules[mod._id] && (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {/* Lessons */}
                    {mod.lessons?.length === 0 ? (
                      <p className="p-4 text-sm text-slate-400 text-center">No lessons yet</p>
                    ) : mod.lessons?.map((lesson, li) => {
                      const Icon = lessonIcons[lesson.contentType] || File;
                      return (
                        <div
                          key={lesson._id}
                          className="flex items-center justify-between p-4 pl-14 hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors group"
                          onClick={() => navigate(`/lesson/${lesson._id}?course=${courseId}`)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-500">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{lesson.title}</p>
                              <p className="text-xs text-slate-400">{lesson.contentType} • {lesson.duration ? `${lesson.duration} min` : 'No limit'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {lesson.isFree && <Badge variant="success" className="text-xs">Free</Badge>}
                            {isMentorOrAdmin && (
                              <button onClick={(e) => { e.stopPropagation(); deleteLessonMut.mutate(lesson._id); }} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 opacity-0 group-hover:opacity-100">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Quizzes for this module */}
                    {moduleQuizzes.length > 0 && (
                      <div className="px-4 py-3 bg-purple-50/50 dark:bg-purple-900/10">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-1.5">
                          <HelpCircle className="h-3.5 w-3.5" /> Module Quizzes
                        </h4>
                        <div className="space-y-1.5">
                          {moduleQuizzes.map((quiz) => (
                            <div
                              key={quiz._id}
                              onClick={() => navigate(`/quiz/take/${quiz._id}`)}
                              className="flex items-center justify-between px-3 py-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 cursor-pointer transition-colors group"
                            >
                              <div className="flex items-center gap-2">
                                <BarChart3 className="h-4 w-4 text-purple-500" />
                                <span className="text-sm font-medium">{quiz.title}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {quiz.attempted ? (
                                  <Badge variant="success" className="text-xs">
                                    Score: {quiz.bestScore}%
                                  </Badge>
                                ) : (
                                  <Badge variant="info" className="text-xs">Not attempted</Badge>
                                )}
                                <ExternalLink className="h-3.5 w-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes for this module */}
                    {moduleNotes.length > 0 && (
                      <div className="px-4 py-3 bg-amber-50/50 dark:bg-amber-900/10">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                          <StickyNote className="h-3.5 w-3.5" /> Study Notes
                        </h4>
                        <div className="space-y-1.5">
                          {moduleNotes.map((note) => (
                            <div key={note._id}>
                              <div
                                onClick={() => toggleNote(note._id)}
                                className="flex items-center justify-between px-3 py-2 rounded-lg bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-900/20 cursor-pointer transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <StickyNote className="h-4 w-4 text-amber-500" />
                                  <span className="text-sm font-medium">{note.title}</span>
                                </div>
                                {expandedNotes[note._id] ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />}
                              </div>
                              {expandedNotes[note._id] && (
                                <div className="mx-3 mb-2 p-4 rounded-lg bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                  {note.content}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {modules.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-40" />
              <p>No modules yet</p>
              {isMentorOrAdmin && (
                <button onClick={() => setShowModuleModal(true)} className="btn-primary mt-4">Create First Module</button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Module Modal */}
      <Modal isOpen={showModuleModal} onClose={() => setShowModuleModal(false)} title="Add Module">
        <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.target); createModuleMut.mutate(Object.fromEntries(fd)); setShowModuleModal(false); }} className="space-y-4">
          <input name="title" placeholder="Module Title" className="input-field" required />
          <textarea name="description" placeholder="Description" className="input-field" rows={3} />
          <input name="order" type="number" placeholder="Order (0, 1, 2...)" className="input-field" defaultValue={modules.length} />
          <button type="submit" className="btn-primary w-full">Create Module</button>
        </form>
      </Modal>

      {/* Add Lesson Modal */}
      <Modal isOpen={showLessonModal} onClose={() => setShowLessonModal(false)} title="Add Lesson" size="lg">
        <form onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.target);
          const data = Object.fromEntries(fd);
          data.moduleId = activeModule?._id;
          data.content = { videoUrl: fd.get('videoUrl'), textContent: fd.get('textContent'), pdfUrl: fd.get('pdfUrl'), documentUrl: fd.get('documentUrl') };
          createLessonMut.mutate(data);
          setShowLessonModal(false);
        }} className="space-y-4">
          <input name="title" placeholder="Lesson Title" className="input-field" required />
          <textarea name="description" placeholder="Description" className="input-field" rows={2} />
          <select name="contentType" className="input-field">
            <option value="video">Video</option>
            <option value="text">Text</option>
            <option value="pdf">PDF</option>
            <option value="document">Document</option>
            <option value="quiz">Quiz</option>
            <option value="assignment">Assignment</option>
          </select>
          <input name="videoUrl" placeholder="Video URL (YouTube/Vimeo)" className="input-field" />
          <input name="pdfUrl" placeholder="PDF URL" className="input-field" />
          <input name="documentUrl" placeholder="Document URL" className="input-field" />
          <textarea name="textContent" placeholder="Text Content (for text lessons)" className="input-field" rows={4} />
          <div className="grid grid-cols-2 gap-4">
            <input name="duration" type="number" placeholder="Duration (min)" className="input-field" defaultValue={10} />
            <label className="flex items-center gap-2 text-sm"><input name="isFree" type="checkbox" /> Free Preview</label>
          </div>
          <input name="order" type="number" placeholder="Order" className="input-field" defaultValue={0} />
          <button type="submit" className="btn-primary w-full">Create Lesson</button>
        </form>
      </Modal>
    </motion.div>
  );
};
