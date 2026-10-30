import { cn } from '../../utils/cn';

const variants = {
  acid: 'border-acid/60 bg-acid/10 text-acid',
  pink: 'border-hot-pink/60 bg-hot-pink/10 text-hot-pink',
  orange: 'border-inferno/60 bg-inferno/10 text-inferno',
  volt: 'border-volt/60 bg-volt/10 text-volt',
  purple: 'border-electric/60 bg-electric/15 text-[#B69CFF]',
  neutral: 'border-line bg-card text-muted',
  error: 'border-error/60 bg-error/10 text-error',
};

export const Badge = ({ children, variant = 'neutral', dot = false, className }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.2em]',
      variants[variant],
      className,
    )}
  >
    {dot && <span className="h-1.5 w-1.5 bg-current" />}
    {children}
  </span>
);
