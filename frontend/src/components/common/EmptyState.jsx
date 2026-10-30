export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center border-2 border-dashed border-line px-6 py-12 text-center">
    {Icon && (
      <div className="mb-5 flex h-14 w-14 items-center justify-center border-2 border-line bg-card">
        <Icon className="h-6 w-6 text-muted" aria-hidden="true" />
      </div>
    )}
    <h3 className="font-display text-xl font-bold uppercase tracking-[-0.03em] text-white">{title}</h3>
    {description && <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{description}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);
