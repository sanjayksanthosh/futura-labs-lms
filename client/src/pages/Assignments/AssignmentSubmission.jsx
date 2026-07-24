import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useFetch, useMutate } from '../../hooks/useQuery';
import { assignmentService } from '../../services/endpoints';
import { useSelector } from 'react-redux';
import {
  FileText, Upload, Clock, Calendar, CheckCircle, AlertCircle,
  ArrowLeft, Download, ExternalLink, Star, MessageSquare, Award
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

export const AssignmentSubmission = () => {
  const { assignmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [grade, setGrade] = useState({ score: 0, feedback: '', status: 'pending' });

  const { data: assignmentData, isLoading } = useFetch(['assignment-submit', assignmentId], () =>
    assignmentService.getById(assignmentId)
  );

  const submitMut = useMutate((d) => assignmentService.submit(assignmentId, d), {
    invalidateKeys: ['assignment-submit', assignmentId],
  });

  const assignment = assignmentData?.data || {};
  const isStudent = user?.role === 'student';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      if (file) fd.append('file', file);
      fd.append('textSubmission', notes);
      await submitMut.mutateAsync(fd);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) return <LoadingSpinner className="py-20" />;

  if (!assignment) {
    return <div className="text-center py-20 text-slate-500">Assignment not found</div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-primary-500 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      {/* Assignment Details */}
      <div className="glass rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">{assignment.title}</h1>
            <p className="text-slate-500">{assignment.description}</p>
          </div>
          <Badge variant={assignment.difficulty === 'hard' ? 'warning' : assignment.difficulty === 'medium' ? 'info' : 'success'}>
            {assignment.difficulty}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-4">
          <span className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500" /> {assignment.totalPoints || 100} points</span>
          <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No deadline'}</span>
          <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> Estimated: {assignment.estimatedHours || 0}h</span>
        </div>

        {(assignment.resources?.length > 0 || assignment.referenceLinks?.length > 0) && (
          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <p className="font-semibold text-sm mb-2">Resources</p>
            <div className="flex flex-wrap gap-2">
              {assignment.resources?.map((r, i) => (
                <a key={i} href={r} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs flex items-center gap-1">
                  <Download className="h-3 w-3" /> Resource {i + 1}
                </a>
              ))}
              {assignment.referenceLinks?.map((l, i) => (
                <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="btn-secondary text-xs flex items-center gap-1">
                  <ExternalLink className="h-3 w-3" /> {l.title || `Link ${i + 1}`}
                </a>
              ))}
            </div>
          </div>
        )}

        {assignment.rubric?.length > 0 && (
          <div className="mt-4">
            <p className="font-semibold text-sm mb-2">Rubric</p>
            <div className="space-y-1">
              {assignment.rubric.map((r, i) => (
                <div key={i} className="flex items-center justify-between text-sm p-2 bg-slate-50 dark:bg-slate-800/30 rounded-lg">
                  <span>{r.criterion}</span>
                  <Badge variant="info">{r.points} pts</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Submission Form */}
      {isStudent && !assignment.mySubmission ? (
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-bold mb-4">Submit Your Work</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-8 text-center hover:border-primary-400 transition-colors cursor-pointer"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); setFile(e.dataTransfer.files[0]); }}>
              {file ? (
                <div className="flex items-center justify-center gap-2 text-primary-500">
                  <FileText className="h-8 w-8" />
                  <div className="text-left">
                    <p className="font-medium text-sm">{file.name}</p>
                    <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm text-slate-500"><span className="text-primary-500 font-medium">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-slate-400 mt-1">PDF, DOC, ZIP up to 10MB</p>
                  <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                </label>
              )}
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes or comments for your mentor..."
              className="input-field"
              rows={4}
            />
            <button type="submit" disabled={!file || submitMut.isPending} className="btn-primary w-full flex items-center justify-center gap-2">
              <Upload className="h-4 w-4" /> {submitMut.isPending ? 'Submitting...' : 'Submit Assignment'}
            </button>
          </form>
        </div>
      ) : isStudent && assignment.mySubmission ? (
        <div className="glass rounded-2xl p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold mb-1">Already Submitted</h2>
          <p className="text-slate-500 mb-4">Submitted on {new Date(assignment.mySubmission.submittedAt).toLocaleDateString()}</p>
          {assignment.mySubmission.status === 'graded' ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-xl">
              <Award className="h-5 w-5 text-yellow-500" />
              <span className="font-bold text-lg">Score: {assignment.mySubmission.score}/{assignment.totalPoints}</span>
            </div>
          ) : (
            <Badge variant="warning">Pending Review</Badge>
          )}
        </div>
      ) : null}
    </motion.div>
  );
};
