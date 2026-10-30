import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Modal = ({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  size = 'md',
}) => {
  const panelRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-void/85 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.18 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose?.();
          }}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="authify-modal-title"
            aria-describedby={description ? 'authify-modal-description' : undefined}
            tabIndex={-1}
            className={cn(
              'w-full border-2 border-line bg-surface shadow-brutal-acid outline-none',
              sizes[size],
              className,
            )}
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
          >
            <div className="flex items-start justify-between gap-6 border-b-2 border-line p-5 sm:p-6">
              <div>
                <h2
                  id="authify-modal-title"
                  className="font-display text-2xl font-bold uppercase tracking-[-0.04em] text-white"
                >
                  {title}
                </h2>
                {description && (
                  <p id="authify-modal-description" className="mt-2 text-sm leading-relaxed text-muted">
                    {description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-line text-muted transition-colors hover:border-acid hover:text-acid"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            {children && <div className="p-5 sm:p-6">{children}</div>}

            {footer && (
              <div className="flex flex-col-reverse gap-3 border-t-2 border-line p-5 sm:flex-row sm:justify-end sm:p-6">
                {footer}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
