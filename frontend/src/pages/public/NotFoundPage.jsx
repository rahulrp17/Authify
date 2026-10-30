import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Home } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Logo } from '../../components/common/Logo';

export const NotFoundPage = () => (
  <div className="relative flex min-h-screen flex-col overflow-hidden bg-void">
    <div className="pointer-events-none absolute inset-0 grid-bg opacity-30" aria-hidden="true" />
    <div
      className="pointer-events-none absolute -right-32 top-1/4 h-96 w-96 rounded-full bg-hot-pink/10 blur-3xl"
      aria-hidden="true"
    />

    <header className="relative z-10 border-b-2 border-line px-5 py-5 sm:px-8">
      <Link to="/" aria-label="AUTHIFY home">
        <Logo />
      </Link>
    </header>

    <main className="relative z-10 flex flex-1 items-center px-5 py-16 sm:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <p className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.28em] text-acid">
          <span className="h-px w-8 bg-acid" />
          Error // 404
        </p>

        <h1 className="mt-6 font-display text-[clamp(6rem,22vw,18rem)] font-bold uppercase leading-[0.72] tracking-[-0.1em] text-white">
          4<span className="text-outline-pink">0</span>4
        </h1>

        <div className="mt-8 grid gap-8 border-t-2 border-line pt-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <h2 className="font-display text-2xl font-bold uppercase leading-none tracking-[-0.05em] text-white sm:text-3xl">
              This route does not exist.
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-7 text-muted">
              The address you requested is not part of the identity console.
              Head home or sign in to return to your account.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button to="/" size="lg">
              <Home className="h-4 w-4" aria-hidden="true" />
              Back home
            </Button>
            <Button to="/dashboard" variant="outline" size="lg">
              Open console
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>

        <div className="mt-10 flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Check the URL or return to a known route.
        </div>
      </div>
    </main>
  </div>
);
