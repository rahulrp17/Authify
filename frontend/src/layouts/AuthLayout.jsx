import { Link, Outlet } from 'react-router-dom';
import { ArrowLeft, Fingerprint, KeyRound, ShieldCheck } from 'lucide-react';
import { Logo } from '../components/common/Logo';
import { AuthConsole } from '../components/marketing/AuthConsole';

const signals = [
  { icon: KeyRound, label: 'OTP guarded', value: '10 min expiry' },
  { icon: Fingerprint, label: 'Sessions', value: 'Individually revocable' },
  { icon: ShieldCheck, label: 'Cookies', value: 'HttpOnly + CSRF' },
];

export const AuthLayout = () => (
  <div className="relative min-h-screen bg-void">
    <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" aria-hidden="true" />
    <div className="pointer-events-none absolute inset-0 scanlines opacity-40" aria-hidden="true" />

    <div className="relative z-10 grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden border-r-2 border-line bg-surface/70 p-10 lg:flex xl:p-14">
        <div
          className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-electric/20 blur-3xl"
          aria-hidden="true"
        />

        <Link to="/" aria-label="AUTHIFY home">
          <Logo />
        </Link>

        <div className="relative my-12">
          <p className="mb-5 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.28em] text-acid">
            <span className="h-px w-8 bg-acid" />
            Identity infrastructure
          </p>
          <h2 className="max-w-xl font-display text-[clamp(2.5rem,4.5vw,4.8rem)] font-bold uppercase leading-[0.9] tracking-[-0.075em] text-white">
            Your identity.
            <br />
            <span className="text-outline">Your rules.</span>
          </h2>
          <p className="mt-6 max-w-md text-sm leading-7 text-muted">
            One account, one control plane. Verify email, rotate passwords,
            inspect sessions, and revoke access without waiting on anyone.
          </p>

          <AuthConsole className="mt-10 max-w-md" compact />
        </div>

        <div className="grid grid-cols-3 gap-4">
          {signals.map((signal) => {
            const Icon = signal.icon;
            return (
              <div key={signal.label} className="border-t-2 border-line pt-3">
                <Icon className="h-4 w-4 text-acid" aria-hidden="true" />
                <p className="mt-2 text-[9px] font-bold uppercase tracking-[0.18em] text-white">
                  {signal.label}
                </p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.14em] text-muted">
                  {signal.value}
                </p>
              </div>
            );
          })}
        </div>
      </aside>

      <main className="flex min-h-screen flex-col">
        <div className="flex items-center justify-between border-b-2 border-line p-5 lg:hidden">
          <Link to="/" aria-label="AUTHIFY home">
            <Logo />
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted transition-colors hover:text-acid"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Home
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>

        <div className="border-t-2 border-line px-5 py-4 sm:px-8 lg:px-12">
          <p className="text-center text-[9px] uppercase tracking-[0.2em] text-muted lg:text-left">
            Protected by rate limits, CSRF checks, and revocable sessions.
          </p>
        </div>
      </main>
    </div>
  </div>
);
