import { cn } from '../../utils/cn';

export const PageHeader = ({ eyebrow, title, description, actions, className }) => (
  <header className={cn('mb-8 border-b-2 border-line pb-8', className)}>
    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-3xl">
        {eyebrow && (
          <p className="mb-4 flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.26em] text-acid">
            <span className="h-px w-7 bg-acid" />
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-[clamp(2.3rem,5.5vw,4.6rem)] font-bold uppercase leading-[0.9] tracking-[-0.075em] text-white">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-2xl text-sm leading-6 text-muted">{description}</p>
        )}
      </div>

      {actions && <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>}
    </div>
  </header>
);
