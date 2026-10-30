import { useEffect, useRef } from 'react';
import { cn } from '../../utils/cn';

export const OTPInput = ({
  value = '',
  onChange,
  length = 6,
  disabled = false,
  error = false,
  autoFocus = false,
}) => {
  const inputs = useRef([]);

  useEffect(() => {
    if (autoFocus) {
      inputs.current[0]?.focus();
    }
  }, [autoFocus]);

  const focusIndex = (index) => {
    const bounded = Math.max(0, Math.min(length - 1, index));
    inputs.current[bounded]?.focus();
    inputs.current[bounded]?.select();
  };

  const setDigits = (digits, startIndex = 0) => {
    const next = value.padEnd(length, ' ').split('');
    let cursor = startIndex;

    digits.split('').forEach((digit) => {
      if (cursor < length) {
        next[cursor] = digit;
        cursor += 1;
      }
    });

    onChange(next.join('').replaceAll(' ', '').slice(0, length));
    return cursor;
  };

  const handleChange = (index, rawValue) => {
    const digits = rawValue.replace(/\D/g, '');

    if (!digits) {
      const next = value.padEnd(length, ' ').split('');
      next[index] = ' ';
      onChange(next.join('').replaceAll(' ', '').slice(0, length));
      return;
    }

    const cursor = setDigits(digits, index);
    focusIndex(Math.min(cursor, length - 1));
  };

  const handleKeyDown = (event, index) => {
    if (event.key === 'Backspace') {
      event.preventDefault();

      if (value[index]) {
        const next = value.split('');
        next[index] = '';
        onChange(next.join('').slice(0, length));
        return;
      }

      if (index > 0) {
        const next = value.split('');
        next[index - 1] = '';
        onChange(next.join('').slice(0, length));
        focusIndex(index - 1);
      }
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusIndex(index - 1);
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusIndex(index + 1);
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const digits = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);

    if (!digits) return;

    const cursor = setDigits(digits, 0);
    focusIndex(Math.min(cursor, length - 1));
  };

  return (
    <div
      className="grid grid-cols-6 gap-2 sm:gap-3"
      onPaste={handlePaste}
      role="group"
      aria-label="One-time verification code"
    >
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(element) => {
            inputs.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={value[index] || ''}
          disabled={disabled}
          aria-label={`Digit ${index + 1}`}
          aria-invalid={error ? 'true' : 'false'}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(event, index)}
          onFocus={(event) => event.target.select()}
          className={cn(
            'h-14 w-full min-w-0 border-2 bg-void text-center font-display text-2xl font-bold text-white outline-none transition-all sm:h-16 sm:text-3xl',
            'focus:border-hot-pink focus:ring-2 focus:ring-hot-pink/20',
            value[index] ? 'border-acid/80' : 'border-line',
            error && 'border-error',
            disabled && 'cursor-not-allowed opacity-60',
          )}
        />
      ))}
    </div>
  );
};
