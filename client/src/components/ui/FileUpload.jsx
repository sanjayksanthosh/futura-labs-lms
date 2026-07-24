import { useState, useRef } from 'react';
import { Upload, X, File, Image, AlertCircle, CheckCircle } from 'lucide-react';

const ACCEPT_MAP = {
  image: 'image/*',
  pdf: '.pdf',
  document: '.doc,.docx,.pdf,.txt',
  video: 'video/*',
  all: '*/*',
};

export const FileUpload = ({
  accept = 'all',
  maxSize = 10 * 1024 * 1024,
  multiple = false,
  onUpload,
  label = 'Upload files',
  className = '',
}) => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = (fileList) => {
    setError('');
    const valid = [];
    for (const f of fileList) {
      if (f.size > maxSize) {
        setError(`"${f.name}" exceeds max size of ${maxSize / 1024 / 1024}MB`);
        continue;
      }
      valid.push(f);
    }
    if (valid.length) {
      setFiles((prev) => [...prev, ...valid]);
      onUpload?.(valid);
    }
  };

  const removeFile = (i) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  return (
    <div className={`space-y-2 ${className}`}>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
          dragOver
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
            : 'border-slate-300 dark:border-slate-600 hover:border-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800/30'
        }`}
      >
        <Upload className={`h-8 w-8 mx-auto mb-2 ${dragOver ? 'text-primary-500' : 'text-slate-300'}`} />
        <p className="text-sm text-slate-500">
          <span className="text-primary-500 font-medium">Click to upload</span> or drag and drop
        </p>
        <p className="text-xs text-slate-400 mt-1">Max {maxSize / 1024 / 1024}MB</p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_MAP[accept] || accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-xs p-2 bg-red-50 dark:bg-red-900/10 rounded-lg">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="space-y-1">
          {files.map((f, i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <File className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="text-sm flex-1 truncate">{f.name}</span>
              <span className="text-xs text-slate-400 shrink-0">{(f.size / 1024).toFixed(1)} KB</span>
              <button onClick={() => removeFile(i)} className="p-0.5 text-red-400 hover:text-red-600"><X className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
