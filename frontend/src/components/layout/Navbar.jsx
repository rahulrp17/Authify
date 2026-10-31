import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpRight,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  MonitorSmartphone,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/auth-context';
import { getApiError } from '../../utils/apiError';
import { cn } from '../../utils/cn';
import { Button } from '../common/Button';
import { Logo } from '../common/Logo';
import { UserAvatar } from '../common/UserAvatar';
import { Marquee } from '../marketing/Marquee';

const navLinks = [
  { label: 'Platform', to: '/#platform' },
  { label: 'Security', to: '/#security' },
  { label: 'How it works', to: '/#how-it-works' },
  { label: 'FAQ', to: '/#faq' },
];

const profileLinks = [
  { label: 'Profile overview', to: '/dashboard/profile', icon: UserRound },
  { label: 'Console', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Security', to: '/dashboard/security', icon: ShieldCheck },
  { label: 'Sessions', to: '/dashboard/sessions', icon: MonitorSmartphone },
];

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const profileRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!profileOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!profileRef.current?.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setProfileOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [profileOpen]);

  const handleLogout = async () => {
    setLoggingOut(true);
    setProfileOpen(false);

    try {
      await logout();
      toast.success('Session closed. Your credentials are safe.');
    } catch (error) {
      toast.error(getApiError(error).message);
    } finally {
      setLoggingOut(false);
      navigate('/login', { replace: true });
    }
  };

  return (
    <header className="sticky top-0 z-50">
      <div className="relative overflow-hidden border-b-2 border-line bg-surface">
        <motion.div
          className="ticker-lines pointer-events-none absolute inset-0 opacity-70"
          aria-hidden="true"
          animate={{ backgroundPosition: ['0px 0px', '38px 0px'] }}
          transition={{ duration: 5, ease: 'linear', repeat: Infinity }}
        />
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
          'relative border-b-2 border-line bg-void/95 backdrop-blur transition-colors',
          scrolled && 'bg-void',
        )}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:gap-6 sm:px-8">
          <Link
            to="/"
            className="shrink-0"
            aria-label="AUTHIFY home"
            onClick={() => {
              setOpen(false);
              setProfileOpen(false);
            }}
          >
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

          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setProfileOpen((current) => !current);
                  }}
                  className="flex h-10 items-center gap-2 border-2 border-line bg-card px-2 text-white transition-colors hover:border-acid sm:px-3"
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                  aria-controls="profile-menu"
                  aria-label="Open profile menu"
                >
                  <UserAvatar
                    name={user?.fullName}
                    src={user?.avatar}
                    className="h-7 w-7 text-[10px]"
                  />
                  <span className="hidden max-w-[9rem] truncate text-[9px] font-bold uppercase tracking-[0.16em] text-muted xl:block">
                    {user?.fullName}
                  </span>
                  <ChevronDown
                    className={cn(
                      'hidden h-3.5 w-3.5 text-muted transition-transform sm:block',
                      profileOpen && 'rotate-180',
                    )}
                    aria-hidden="true"
                  />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      id="profile-menu"
                      role="menu"
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: 'easeOut' }}
                      className="absolute right-0 top-[calc(100%+0.5rem)] z-[100] w-72 max-w-[calc(100vw-2.5rem)] border-2 border-line bg-surface shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
                    >
                      <div className="flex items-center gap-3 border-b-2 border-line bg-card p-4">
                        <UserAvatar
                          name={user?.fullName}
                          src={user?.avatar}
                          className="h-11 w-11 text-base"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-display text-sm font-bold uppercase tracking-[-0.02em] text-white">
                            {user?.fullName}
                          </p>
                          <p className="truncate text-[10px] text-muted">{user?.email}</p>
                        </div>
                      </div>

                      <div className="p-2">
                        {profileLinks.map((item) => {
                          const Icon = item.icon;

                          return (
                            <Link
                              key={item.to}
                              to={item.to}
                              role="menuitem"
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted transition-colors hover:bg-card hover:text-acid"
                            >
                              <Icon className="h-4 w-4" aria-hidden="true" />
                              {item.label}
                            </Link>
                          );
                        })}
                      </div>

                      <div className="border-t-2 border-line p-2">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={handleLogout}
                          disabled={loggingOut}
                          className="flex w-full items-center gap-3 px-3 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-error transition-colors hover:bg-card disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <LogOut className="h-4 w-4" aria-hidden="true" />
                          {loggingOut ? 'Closing session...' : 'Log out'}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden items-center gap-3 lg:flex">
                <Button to="/login" variant="ghost" size="sm">
                  Log in
                </Button>
                <Button to="/register" size="sm">
                  Create account
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Button>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setProfileOpen(false);
                setOpen((current) => !current);
              }}
              className="flex h-10 w-10 items-center justify-center border-2 border-line text-white transition-colors hover:border-acid hover:text-acid lg:hidden"
              aria-expanded={open}
              aria-controls="mobile-navigation"
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {open && (
            <motion.div
              id="mobile-navigation"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="absolute inset-x-0 top-full z-50 max-h-[calc(100svh-8rem)] overflow-y-auto border-y-2 border-line bg-surface shadow-[0_24px_60px_rgba(0,0,0,0.55)] lg:hidden"
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
                    <>
                      <div className="flex items-center gap-3 border-2 border-line bg-card p-3">
                        <UserAvatar
                          name={user?.fullName}
                          src={user?.avatar}
                          className="h-10 w-10 text-sm"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-display text-xs font-bold uppercase tracking-[-0.01em] text-white">
                            {user?.fullName}
                          </p>
                          <p className="truncate text-[9px] text-muted">{user?.email}</p>
                        </div>
                      </div>
                      <Button
                        to="/dashboard/profile"
                        variant="outline"
                        onClick={() => setOpen(false)}
                      >
                        Profile overview
                      </Button>
                      <Button to="/dashboard" onClick={() => setOpen(false)}>
                        Open console
                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </>
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
