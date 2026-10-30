import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const variants = {
  primary:
    'border-acid bg-acid text-void shadow-[4px_4px_0_0_#FF00E5] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#FF00E5]',
  secondary:
    'border-hot-pink bg-hot-pink text-white shadow-[4px_4px_0_0_#39FF14] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#39FF14]',
  orange:
    'border-inferno bg-inferno text-void shadow-[4px_4px_0_0_#FFFFFF] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#FFFFFF]',
  outline:
    'border-line bg-transparent text-white hover:border-acid hover:text-acid',
  ghost:
    'border-transparent bg-transparent text-muted hover:bg-card hover:text-white',
  danger:
    'border-error bg-error text-white shadow-[4px_4px_0_0_#FFFFFF] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#FFFFFF]',
  volt:
    'border-volt bg-volt text-void shadow-[4px_4px_0_0_#7000FF] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_#7000FF]',
};

const sizes = {
  sm: 'px-3 py-2 text-[10px]',
  md: 'px-5 py-3 text-[11px]',
  lg: 'px-7 py-4 text-xs',
};

const base =
  'inline-flex select-none items-center justify-center gap-2 border-2 font-display font-bold uppercase tracking-[0.16em] transition-all duration-200 disabled:pointer-events-none disabled:translate-x-0 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none';

export const Button = forwardRef(function Button(
  {
    children,
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    to,
    href,
    type = 'button',
    ...props
  },
  ref,
) {
  const classes = cn(base, variants[variant], sizes[size], className);
  const content = (
    <>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </>
  );
  const sharedProps = {
    className: classes,
    'aria-busy': loading || undefined,
    'aria-disabled': disabled || loading || undefined,
    ...props,
  };

  if (to) {
    return (
      <Link ref={ref} to={to} {...sharedProps}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a ref={ref} href={href} {...sharedProps}>
        {content}
      </a>
    );
  }

  return (
    <button ref={ref} type={type} disabled={disabled || loading} {...sharedProps}>
      {content}
    </button>
  );
});
