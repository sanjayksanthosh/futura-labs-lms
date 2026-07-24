import { cn } from '../../utils/cn';
import { getInitials } from '../../utils/helpers';

export const Avatar = ({ name, src, size = 'md', className }) => {
  const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-lg', xl: 'h-20 w-20 text-2xl' };

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover', sizes[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-semibold',
        sizes[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
};

export { getInitials } from '../../utils/helpers';
