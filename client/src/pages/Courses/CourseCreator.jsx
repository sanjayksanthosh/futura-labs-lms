import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useFetch, useMutate } from '../../hooks/useQuery';
import { courseService } from '../../services/endpoints';
import {
  Plus, Trash2, GripVertical, ChevronRight, BookOpen, Video, FileText,
  File, ArrowLeft, Save, Eye, CheckCircle, X, AlertCircle
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

const STEPS = ['Course Info', 'Learning Objectives', 'Modules & Lessons', 'Preview & Publish'];

export const CourseCreator = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!courseId;

  const { data: existingCourse } = useFetch(['course-edit', courseId], () =>
    courseService.getById(courseId), { enabled: isEditing }
  );

  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    title: '', description: '', shortDescription: '', level: 'beginner',
    category: 'programming', language: 'English', isFree: false, price: 0,
    thumbnail: '', learningObjectives: [''],
    modules: [],
  });
  const [errors, setErrors] = useState({});

  const createMut = useMutate((d) => courseService.create(d), { invalidateKeys: ['courses'] });
  const updateMut = useMutate((d) => courseService.update(courseId, d), { invalidateKeys: ['courses', 'course-edit'] });

  useEffect(() => {
    if (existingCourse?.data) {
      const c = existingCourse.data;
      setForm({
        title: c.title || '', description: c.description || '', shortDescription: c.shortDescription || '',
        level: c.level || 'beginner', category: c.category || 'programming', language: c.language || 'English',
        isFree: c.isFree || false, price: c.price || 0, thumbnail: c.thumbnail || '',
        learningObjectives: c.learningObjectives?.length ? c.learningObjectives : [''],
        modules: c.modules?.length ? c.modules.map(m => ({ ...m, lessons: m.lessons || [] })) : [],
      });
    }
  }, [existingCourse]);

  const updateField = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const updateObjective = (i, val) => {
    const arr = [...form.learningObjectives];
    arr[i] = val;
    updateField('learningObjectives', arr);
  };
  const addObjective = () => updateField('learningObjectives', [...form.learningObjectives, '']);
  const removeObjective = (i) => {
    const arr = form.learningObjectives.filter((_, idx) => idx !== i);
    updateField('learningObjectives', arr.length ? arr : ['']);
  };

  const addModule = () => {
    const newMod = { title: '', description: '', order: form.modules.length, lessons: [] };
    updateField('modules', [...form.modules, newMod]);
  };
  const updateModule = (i, key, val) => {
    const arr = [...form.modules];
    arr[i] = { ...arr[i], [key]: val };
    updateField('modules', arr);
  };
  const removeModule = (i) => updateField('modules', form.modules.filter((_, idx) => idx !== i));

  const addLesson = (mi) => {
    const arr = [...form.modules];
    arr[mi].lessons.push({
      title: '', contentType: 'video', description: '', duration: 10, order: arr[mi].lessons.length,
      isFree: false, content: { videoUrl: '', textContent: '', pdfUrl: '', documentUrl: '' }
    });
    updateField('modules', arr);
  };
  const updateLesson = (mi, li, key, val) => {
    const arr = [...form.modules];
    if (key.startsWith('content.')) {
      const ck = key.split('.')[1];
      arr[mi].lessons[li].content[ck] = val;
    } else {
      arr[mi].lessons[li][key] = val;
    }
    updateField('modules', arr);
  };
  const removeLesson = (mi, li) => {
    const arr = [...form.modules];
    arr[mi].lessons = arr[mi].lessons.filter((_, idx) => idx !== li);
    updateField('modules', arr);
  };

  const validate = () => {
    const errs = {};
    if (!form.title) errs.title = 'Required';
    if (!form.description) errs.description = 'Required';
    if (form.modules.length === 0) errs.modules = 'Add at least one module';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const payload = {
      title: form.title, description: form.description, shortDescription: form.shortDescription,
      level: form.level, category: form.category, language: form.language,
      isFree: form.isFree, price: form.isFree ? 0 : Number(form.price),
      thumbnail: form.thumbnail,
      learningObjectives: form.learningObjectives.filter(Boolean),
      modules: form.modules.map(m => ({
        title: m.title, description: m.description, order: m.order,
        lessons: m.lessons.map(l => ({ title: l.title, contentType: l.contentType, description: l.description, duration: Number(l.duration), isFree: l.isFree, content: l.content, order: l.order }))
      })),
    };
    try {
      if (isEditing) {
        await updateMut.mutateAsync(payload);
      } else {
        const res = await createMut.mutateAsync(payload);
        navigate(`/admin/courses/${res.data._id}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0: return (
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Course Title</label>
              <input value={form.title} onChange={e => updateField('title', e.target.value)} className="input-field" placeholder="Enter course title" />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
            </div>
            <div className="md:col-span-2">
              <label className="label">Short Description</label>
              <input value={form.shortDescription} onChange={e => updateField('shortDescription', e.target.value)} className="input-field" placeholder="Brief description for cards" />
            </div>
            <div className="md:col-span-2">
              <label className="label">Full Description</label>
              <textarea value={form.description} onChange={e => updateField('description', e.target.value)} className="input-field" rows={4} placeholder="Detailed course description" />
              {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
            </div>
            <div>
              <label className="label">Level</label>
              <select value={form.level} onChange={e => updateField('level', e.target.value)} className="input-field">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="all">All Levels</option>
              </select>
            </div>
            <div>
              <label className="label">Category</label>
              <select value={form.category} onChange={e => updateField('category', e.target.value)} className="input-field">
                <option value="programming">Programming</option>
                <option value="design">Design</option>
                <option value="business">Business</option>
                <option value="marketing">Marketing</option>
                <option value="data-science">Data Science</option>
                <option value="ai-ml">AI & ML</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Language</label>
              <select value={form.language} onChange={e => updateField('language', e.target.value)} className="input-field">
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Spanish">Spanish</option>
              </select>
            </div>
            <div>
              <label className="label">Thumbnail URL</label>
              <input value={form.thumbnail} onChange={e => updateField('thumbnail', e.target.value)} className="input-field" placeholder="Image URL" />
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isFree} onChange={e => updateField('isFree', e.target.checked)} className="rounded" />
                <span className="text-sm">Free Course</span>
              </label>
              {!form.isFree && (
                <div className="flex-1">
                  <label className="label">Price ($)</label>
                  <input type="number" value={form.price} onChange={e => updateField('price', e.target.value)} className="input-field" min={0} step={0.99} />
                </div>
              )}
            </div>
          </div>
        </div>
      );

      case 1: return (
        <div className="space-y-4">
          <h3 className="text-lg font-bold">Learning Objectives</h3>
          <p className="text-sm text-slate-500">What will students be able to do after completing this course?</p>
          {form.learningObjectives.map((obj, i) => (
            <div key={i} className="flex items-center gap-2">
              <input value={obj} onChange={e => updateObjective(i, e.target.value)} className="input-field flex-1" placeholder="e.g., Build a full-stack application" />
              <button onClick={() => removeObjective(i)} className="p-2 text-red-400 hover:text-red-600"><X className="h-4 w-4" /></button>
            </div>
          ))}
          <button onClick={addObjective} className="btn-secondary text-sm"><Plus className="h-4 w-4" /> Add Objective</button>
        </div>
      );

      case 2: return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Modules & Lessons</h3>
            <button onClick={addModule} className="btn-primary text-sm"><Plus className="h-4 w-4" /> Add Module</button>
          </div>
          {errors.modules && <p className="text-red-500 text-xs">{errors.modules}</p>}

          {form.modules.map((mod, mi) => (
            <div key={mi} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-xs font-bold text-primary-500">Module {mi + 1}</span>
                  <input value={mod.title} onChange={e => updateModule(mi, 'title', e.target.value)} className="input-field flex-1" placeholder="Module title" />
                </div>
                <button onClick={() => removeModule(mi)} className="p-2 text-red-400 hover:text-red-600 ml-2"><Trash2 className="h-4 w-4" /></button>
              </div>
              <textarea value={mod.description} onChange={e => updateModule(mi, 'description', e.target.value)} className="input-field mb-3" placeholder="Module description" rows={2} />
              <div className="space-y-2">
                {mod.lessons.map((lesson, li) => (
                  <div key={li} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3">
                    <GripVertical className="h-4 w-4 text-slate-300 shrink-0" />
                    <select value={lesson.contentType} onChange={e => updateLesson(mi, li, 'contentType', e.target.value)} className="input-field text-sm w-24">
                      <option value="video">Video</option>
                      <option value="text">Text</option>
                      <option value="pdf">PDF</option>
                      <option value="document">Doc</option>
                      <option value="quiz">Quiz</option>
                      <option value="assignment">Assignment</option>
                    </select>
                    <input value={lesson.title} onChange={e => updateLesson(mi, li, 'title', e.target.value)} className="input-field flex-1 text-sm" placeholder="Lesson title" />
                    <input type="number" value={lesson.duration} onChange={e => updateLesson(mi, li, 'duration', e.target.value)} className="input-field w-16 text-sm" placeholder="Min" />
                    {lesson.contentType === 'video' && (
                      <input value={lesson.content.videoUrl} onChange={e => updateLesson(mi, li, 'content.videoUrl', e.target.value)} className="input-field flex-1 text-sm" placeholder="Video URL" />
                    )}
                    {lesson.contentType === 'text' && (
                      <textarea value={lesson.content.textContent} onChange={e => updateLesson(mi, li, 'content.textContent', e.target.value)} className="input-field flex-1 text-sm" placeholder="Content" rows={1} />
                    )}
                    <label className="flex items-center gap-1 text-xs shrink-0">
                      <input type="checkbox" checked={lesson.isFree} onChange={e => updateLesson(mi, li, 'isFree', e.target.checked)} />
                      Free
                    </label>
                    <button onClick={() => removeLesson(mi, li)} className="p-1 text-red-400"><X className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
                <button onClick={() => addLesson(mi)} className="btn-secondary text-xs py-1"><Plus className="h-3 w-3" /> Lesson</button>
              </div>
            </div>
          ))}
        </div>
      );

      case 3: return (
        <div className="space-y-6">
          <h3 className="text-lg font-bold">Preview & Publish</h3>
          <div className="glass rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-2">{form.title || 'Untitled Course'}</h2>
            <p className="text-slate-500 mb-4">{form.shortDescription || 'No description'}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge>{form.level}</Badge>
              <Badge variant="info">{form.category}</Badge>
              <Badge variant={form.isFree ? 'success' : 'warning'}>{form.isFree ? 'Free' : `$${form.price}`}</Badge>
            </div>
            <div className="space-y-2">
              <p className="font-semibold">Learning Objectives ({form.learningObjectives.filter(Boolean).length})</p>
              {form.learningObjectives.filter(Boolean).map((obj, i) => (
                <div key={i} className="flex items-start gap-2 text-sm"><CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />{obj}</div>
              ))}
            </div>
            <div className="mt-4">
              <p className="font-semibold">Modules ({form.modules.length})</p>
              {form.modules.map((m, i) => (
                <div key={i} className="text-sm text-slate-500 mt-1">Module {i + 1}: {m.title || 'Untitled'} ({m.lessons.length} lessons)</div>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSubmit} className="btn-primary flex items-center gap-2">
              <Save className="h-4 w-4" /> {isEditing ? 'Update Course' : 'Create Course'}
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary-500 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>
      <div className="glass rounded-2xl p-6 mb-6">
        <h1 className="text-2xl font-bold mb-6">{isEditing ? 'Edit Course' : 'Create New Course'}</h1>
        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <button onClick={() => setStep(i)} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                step === i ? 'bg-primary-500 text-white' : step > i ? 'bg-green-100 dark:bg-green-900/20 text-green-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                {step > i ? <CheckCircle className="h-3.5 w-3.5" /> : <span className="font-bold text-xs">{i + 1}</span>}
                <span className="hidden sm:inline">{s.split(' ')[0]}</span>
              </button>
              {i < STEPS.length - 1 && <ChevronRight className="h-4 w-4 text-slate-300" />}
            </div>
          ))}
        </div>
        {renderStep()}
        <div className="flex justify-between mt-8">
          <button disabled={step === 0} onClick={() => setStep(s => s - 1)} className="btn-secondary">Previous</button>
          <button disabled={step === STEPS.length - 1} onClick={() => setStep(s => s + 1)} className="btn-primary">
            Next {step === STEPS.length - 1 ? '' : `- ${STEPS[step + 1]}`}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
