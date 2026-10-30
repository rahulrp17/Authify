import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

export const ErrorState = ({
  title = 'SIGNAL LOST',
  message = 'We could not load this data. Try again.',
  onRetry,
}) => (
  <div className="border-2 border-error/50 bg-error/5 p-6">
    <div className="flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center border-2 border-error text-error">
        <AlertTriangle className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <h3 className="font-display text-xl font-bold uppercase tracking-[-0.03em] text-white">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{message}</p>
        {onRetry && (
          <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Retry
          </Button>
        )}
      </div>
    </div>
  </div>
);
