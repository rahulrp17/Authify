import { cn } from '../../utils/cn';

const accents = {
  acid: 'text-acid',
  pink: 'text-hot-pink',
  orange: 'text-inferno',
  volt: 'text-volt',
  purple: 'text-[#B69CFF]',
};

export const StatCard = ({ label, value, hint, icon: Icon, accent = 'acid', className }) => (
  <div className={cn('border-2 border-line bg-surface p-5', className)}>
    <div className="flex items-start justify-between gap-3">
      <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-muted">
        {label}
      </span>
      {Icon && <Icon className={cn('h-4 w-4', accents[accent])} aria-hidden="true" />}
    </div>

    <p
      className={cn(
        'mt-4 break-words font-display text-[clamp(1.4rem,2.5vw,2rem)] font-bold uppercase leading-none tracking-[-0.05em] text-white',
      )}
    >
      {value}
    </p>

    {hint && (
      <p className="mt-3 text-[10px] uppercase tracking-[0.16em] text-muted">{hint}</p>
    )}
  </div>
);
