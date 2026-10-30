import { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { cn } from '../../utils/cn';
import { FormError } from './FormError';

export const PasswordInput = forwardRef(function PasswordInput(
  { label = 'Password', error, hint, id, className, inputClassName, required, ...props },
  ref,
) {
  const [visible, setVisible] = useState(false);
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
        <LockKeyhole
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          aria-hidden="true"
        />

        <input
          ref={ref}
          id={inputId}
          type={visible ? 'text' : 'password'}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          className={cn(
            'w-full border-2 border-line bg-void py-3.5 pl-11 pr-12 text-sm text-white outline-none transition-colors placeholder:text-muted/50',
            'focus:border-acid focus:ring-2 focus:ring-acid/15',
            'disabled:cursor-not-allowed disabled:opacity-60',
            error && 'border-error focus:border-error focus:ring-error/15',
            inputClassName,
          )}
          {...props}
        />

        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center text-muted transition-colors hover:text-acid"
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {visible ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
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
