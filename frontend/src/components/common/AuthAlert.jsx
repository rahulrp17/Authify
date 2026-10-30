import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from 'lucide-react';
import { cn } from '../../utils/cn';

const variants = {
  error: {
    icon: AlertTriangle,
    className: 'border-error/50 bg-error/5 text-error',
  },
  warning: {
    icon: ShieldAlert,
    className: 'border-inferno/50 bg-inferno/5 text-inferno',
  },
  success: {
    icon: CheckCircle2,
    className: 'border-acid/50 bg-acid/5 text-acid',
  },
  info: {
    icon: Info,
    className: 'border-electric/50 bg-electric/10 text-[#B69CFF]',
  },
};

export const AuthAlert = ({ type = 'error', title, children, action, className }) => {
  const variant = variants[type] || variants.error;
  const Icon = variant.icon;

  return (
    <div className={cn('border-2 p-4', variant.className, className)} role="alert">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          {title && <p className="font-display text-xs font-bold uppercase tracking-[0.14em]">{title}</p>}
          {children && <div className="mt-1 text-xs leading-relaxed text-white/80">{children}</div>}
          {action && <div className="mt-3">{action}</div>}
        </div>
      </div>
    </div>
  );
};
