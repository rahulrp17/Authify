import { forwardRef, useId } from 'react';
import { cn } from '../../utils/cn';
import { FormError } from './FormError';

export const Input = forwardRef(function Input(
  {
    label,
    error,
    hint,
    icon: Icon,
    rightSlot,
    id,
    className,
    inputClassName,
    required,
    ...props
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.22em] text-muted"
        >
          <span>{label}</span>
          {required && <span className="text-hot-pink">REQ</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden="true"
          />
        )}

        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          className={cn(
            'w-full border-2 border-line bg-void px-4 py-3.5 text-sm text-white outline-none transition-colors placeholder:text-muted/50',
            'focus:border-acid focus:ring-2 focus:ring-acid/15',
            'disabled:cursor-not-allowed disabled:opacity-60',
            Icon && 'pl-11',
            rightSlot && 'pr-12',
            error && 'border-error focus:border-error focus:ring-error/15',
            inputClassName,
          )}
          {...props}
        />

        {rightSlot && <div className="absolute right-2 top-1/2 -translate-y-1/2">{rightSlot}</div>}
      </div>

      {hint && !error && (
        <p id={hintId} className="mt-2 text-xs leading-relaxed text-muted">
          {hint}
        </p>
      )}

      <FormError id={errorId}>{error}</FormError>
    </div>
  );
});
