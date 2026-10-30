import { Badge } from '../common/Badge';

export const AuthHeader = ({ code, title, description, children }) => (
  <div className="mb-8">
    <div className="mb-5 flex items-center justify-between gap-4">
      <Badge variant="acid" dot>
        {code}
      </Badge>
      <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-muted">
        Secure channel
      </span>
    </div>

    <h1 className="font-display text-[clamp(2.2rem,5vw,3.6rem)] font-bold uppercase leading-[0.9] tracking-[-0.07em] text-white">
      {title}
    </h1>

    {description && (
      <p className="mt-4 text-sm leading-6 text-muted">{description}</p>
    )}

    {children}
  </div>
);
