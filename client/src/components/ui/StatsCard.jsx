import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export const StatsCard = ({ title, value, icon: Icon, trend, color = 'primary', suffix = '', prefix = '', onClick }) => {
  const colors = {
    primary: 'from-primary-500 to-primary-600',
    secondary: 'from-secondary-500 to-secondary-600',
    accent: 'from-accent-500 to-accent-600',
    danger: 'from-red-500 to-red-600',
    info: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    pink: 'from-pink-500 to-pink-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={cn('stats-card cursor-pointer', onClick && 'cursor-pointer')}
    >
      <div
        className={cn(
          'p-3 rounded-xl bg-gradient-to-br text-white shadow-lg',
          colors[color] || colors.primary
        )}
      >
        {Icon && <Icon className="h-6 w-6" />}
      </div>
      <div className="flex-1">
        <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
          {prefix}{value?.toLocaleString() || 0}{suffix}
        </p>
        {trend !== undefined && (
          <p className={cn('text-xs mt-1', trend >= 0 ? 'text-green-600' : 'text-red-600')}>
            {trend >= 0 ? '+' : ''}{trend}% from last month
          </p>
        )}
      </div>
    </motion.div>
  );
};
