import { cn } from '../../utils/cn';

export const Panel = ({ title, code, description, actions, children, className, bodyClassName }) => (
  <section className={cn('border-2 border-line bg-surface', className)}>
    {(title || actions) && (
      <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-line px-5 py-4">
        <div>
          {code && (
            <p className="text-[8px] font-bold uppercase tracking-[0.24em] text-acid">
              {code}
            </p>
          )}
          {title && (
            <h2 className="mt-1 font-display text-lg font-bold uppercase tracking-[-0.03em] text-white">
              {title}
            </h2>
          )}
          {description && <p className="mt-1 text-xs text-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    )}
    <div className={cn('p-5', bodyClassName)}>{children}</div>
  </section>
);
