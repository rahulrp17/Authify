import { AlertCircle } from 'lucide-react';

export const FormError = ({ children, id }) => {
  if (!children) return null;

  return (
    <p id={id} className="mt-2 flex items-start gap-1.5 text-xs font-medium text-error">
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
};
