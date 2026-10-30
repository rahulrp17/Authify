import { cn } from '../../utils/cn';

export const Skeleton = ({ className }) => (
  <div className={cn('animate-pulse border border-line bg-card/80', className)} aria-hidden="true" />
);

export const SkeletonText = ({ lines = 3, className }) => (
  <div className={cn('space-y-2', className)} aria-hidden="true">
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton key={index} className={cn('h-3', index === lines - 1 ? 'w-2/3' : 'w-full')} />
    ))}
  </div>
);
