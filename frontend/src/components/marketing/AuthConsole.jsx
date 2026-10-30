import { LockKeyhole } from 'lucide-react';
import { cn } from '../../utils/cn';

const stages = [
  { step: '01', label: 'INPUT', value: 'EMAIL + PASSWORD', status: 'VALIDATED', color: 'text-acid' },
  { step: '02', label: 'HASH', value: 'BCRYPT / 12 ROUNDS', status: 'SEALED', color: 'text-acid' },
  { step: '03', label: 'TOKEN', value: 'JWT / JTI TRACKED', status: 'SIGNED', color: 'text-hot-pink' },
  { step: '04', label: 'SESSION', value: 'HTTPONLY / REVOCABLE', status: 'LOCKED', color: 'text-inferno' },
];

export const AuthConsole = ({ className, compact = false }) => (
  <div className={cn('border-2 border-line bg-void', className)}>
    <div className="flex items-center justify-between border-b-2 border-line px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 bg-error" />
        <span className="h-2 w-2 bg-volt" />
        <span className="h-2 w-2 bg-acid" />
        <span className="ml-2 text-[9px] font-bold uppercase tracking-[0.2em] text-muted">
          identity_pipeline.log
        </span>
      </div>
      <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.2em] text-acid">
        <span className="h-1.5 w-1.5 animate-blink bg-acid" />
        Live
      </span>
    </div>

    <div className={cn('divide-y divide-line', compact ? 'text-[10px]' : 'text-xs')}>
      {stages.map((stage) => (
        <div key={stage.step} className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 px-4 py-3">
          <span className="font-display font-bold text-line">{stage.step}</span>
          <div>
            <p className="font-display font-bold uppercase tracking-[0.16em] text-white">{stage.label}</p>
            <p className="mt-0.5 text-[9px] uppercase tracking-[0.16em] text-muted">{stage.value}</p>
          </div>
          <span className={cn('text-[9px] font-bold uppercase tracking-[0.18em]', stage.color)}>
            {stage.status}
          </span>
        </div>
      ))}
    </div>

    <div className="flex items-center justify-between gap-4 border-t-2 border-line bg-surface px-4 py-3">
      <span className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-muted">
        <LockKeyhole className="h-3 w-3 text-acid" aria-hidden="true" />
        CSRF shielded
      </span>
      <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted">
        no token in storage
      </span>
    </div>
  </div>
);
