import { cn } from '../../utils/cn';

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}) => (
  <div
    className={cn(
      'max-w-4xl',
      align === 'center' && 'mx-auto text-center',
      className,
    )}
  >
    {eyebrow && (
      <div
        className={cn(
          'mb-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.28em] text-acid',
          align === 'center' && 'justify-center',
        )}
      >
        <span className="h-px w-8 bg-acid" />
        {eyebrow}
        <span className="h-px w-8 bg-acid" />
      </div>
    )}

    <h2 className="font-display text-[clamp(2.4rem,6vw,5.4rem)] font-bold uppercase leading-[0.92] tracking-[-0.075em] text-white">
      {title}
    </h2>

    {description && (
      <p className="mt-6 max-w-2xl text-sm leading-7 text-muted sm:text-base">
        {description}
      </p>
    )}
  </div>
);
