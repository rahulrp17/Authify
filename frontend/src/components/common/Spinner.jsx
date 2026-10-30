import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Spinner = ({ className, label = 'Loading' }) => (
  <span className={cn('inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted', className)}>
    <Loader2 className="h-4 w-4 animate-spin text-acid" aria-hidden="true" />
    {label}
  </span>
);
