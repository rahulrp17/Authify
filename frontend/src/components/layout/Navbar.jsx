import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/auth-context';
import { cn } from '../../utils/cn';
import { Button } from '../common/Button';
import { Logo } from '../common/Logo';
import { Marquee } from '../marketing/Marquee';

const navLinks = [
  { label: 'Platform', to: '/#platform' },
  { label: 'Security', to: '/#security' },
  { label: 'How it works', to: '/#how-it-works' },
  { label: 'FAQ', to: '/#faq' },
];

export const Navbar = () => {
  const { isAuthenticated, user } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const initial = user?.fullName?.trim()?.charAt(0)?.toUpperCase() || 'A';

  return (
    <header className="sticky top-0 z-50">
      <div className="relative overflow-hidden border-b-2 border-line bg-surface">
        <div className="ticker-lines pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
        <Marquee
          items={[
            'Encrypted by default',
            'Revocable sessions',
            'OTP guarded',
            'No token in local storage',
            'Identity is infrastructure',
          ]}
          reverse
          className="relative py-1.5 text-[9px] text-muted"
        />
      </div>

      <div
        className={cn(
          'border-b-2 border-line bg-void/95 backdrop-blur transition-colors',
          scrolled && 'bg-void',
        )}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
          <Link to="/" className="shrink-0" aria-label="AUTHIFY home">
            <Logo />
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="border-b-2 border-transparent px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted transition-colors hover:border-acid hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            {isAuthenticated ? (
              <>
                <span className="hidden items-center gap-2 border-2 border-line px-3 py-2 xl:flex">
                  <span className="flex h-5 w-5 items-center justify-center bg-acid font-display text-[10px] font-bold text-void">
                    {initial}
                  </span>
                  <span className="max-w-[9rem] truncate text-[9px] font-bold uppercase tracking-[0.16em] text-muted">
                    {user.fullName}
                  </span>
                </span>
                <Button to="/dashboard" size="sm">
                  Console
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </>
            ) : (
              <>
                <Button to="/login" variant="ghost" size="sm">
                  Log in
                </Button>
                <Button to="/register" size="sm">
                  Create account
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="flex h-10 w-10 items-center justify-center border-2 border-line text-white transition-colors hover:border-acid hover:text-acid lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div
              id="mobile-navigation"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="overflow-hidden border-t-2 border-line bg-surface lg:hidden"
            >
              <div className="space-y-1 px-5 py-5">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className="block border-b border-line py-3 text-xs font-bold uppercase tracking-[0.18em] text-muted transition-colors hover:text-acid"
                  >
                    {link.label}
                  </NavLink>
                ))}

                <div className="grid gap-3 pt-4">
                  {isAuthenticated ? (
                    <Button to="/dashboard" onClick={() => setOpen(false)}>
                      Open console
                      <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  ) : (
                    <>
                      <Button to="/register" onClick={() => setOpen(false)}>
                        Create account
                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                      </Button>
                      <Button
                        to="/login"
                        variant="outline"
                        onClick={() => setOpen(false)}
                      >
                        Log in
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
