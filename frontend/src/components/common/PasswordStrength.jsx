import { Check, X } from 'lucide-react';
import { usePasswordStrength } from '../../hooks/usePasswordStrength';
import { cn } from '../../utils/cn';

export const PasswordStrength = ({ password, className }) => {
  const strength = usePasswordStrength(password);

  if (!password) return null;

  return (
    <div className={cn('mt-3 border-2 border-line bg-void p-3', className)} aria-live="polite">
      <div className="flex items-center justify-between gap-4">
        <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-muted">
          Password strength
        </span>
        <span className={cn('font-display text-[10px] font-bold tracking-[0.18em]', strength.color)}>
          {strength.label}
        </span>
      </div>

      <div className="mt-2 grid grid-cols-5 gap-1">
        {Array.from({ length: 5 }).map((_, index) => (
          <span
            key={index}
            className={cn(
              'h-1.5 transition-colors',
              index < strength.score ? strength.bar : 'bg-line',
            )}
          />
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
        {strength.checks.map((check) => (
          <span
            key={check.key}
            className={cn(
              'flex items-center gap-1.5 text-[10px]',
              check.passed ? 'text-acid' : 'text-muted/70',
            )}
          >
            {check.passed ? (
              <Check className="h-3 w-3" aria-hidden="true" />
            ) : (
              <X className="h-3 w-3" aria-hidden="true" />
            )}
            {check.label}
          </span>
        ))}
      </div>
    </div>
  );
};
