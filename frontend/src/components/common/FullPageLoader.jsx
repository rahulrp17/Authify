import { Loader2 } from 'lucide-react';
import { Logo } from './Logo';

export const FullPageLoader = ({ label = 'Establishing secure session' }) => (
  <div className="flex min-h-screen items-center justify-center bg-void px-6">
    <div className="flex flex-col items-center gap-6">
      <Logo />
      <div className="flex items-center gap-3 border-2 border-line bg-surface px-5 py-3">
        <Loader2 className="h-4 w-4 animate-spin text-acid" aria-hidden="true" />
        <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted">{label}</span>
      </div>
    </div>
  </div>
);
