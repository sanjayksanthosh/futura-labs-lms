import { AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '../../utils/cn';

export const ErrorState = ({ message = 'Something went wrong', onRetry, className }) => (
  <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
    <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
    <p className="text-slate-600 dark:text-slate-400 mb-4">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="btn-primary flex items-center gap-2">
        <RefreshCw className="h-4 w-4" /> Try Again
      </button>
    )}
  </div>
);
