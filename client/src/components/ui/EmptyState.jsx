import { Inbox } from 'lucide-react';
import { cn } from '../../utils/cn';

export const EmptyState = ({ icon: Icon = Inbox, title = 'No data found', description = '', action, className }) => (
  <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
    <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
      <Icon className="h-8 w-8 text-slate-400" />
    </div>
    <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-1">{title}</h3>
    {description && <p className="text-sm text-slate-500 mb-4 max-w-md">{description}</p>}
    {action && <div className="mt-2">{action}</div>}
  </div>
);
