import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  House,
  LayoutDashboard,
  LogOut,
  Menu,
  MonitorSmartphone,
  ShieldCheck,
  UserRound,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/auth-context';
import { getApiError } from '../utils/apiError';
import { cn } from '../utils/cn';
import { Button } from '../components/common/Button';
import { Logo } from '../components/common/Logo';
import { UserAvatar } from '../components/common/UserAvatar';
import { Badge } from '../components/common/Badge';

const navigation = [
  { to: '/', label: 'Home', icon: House, code: '00', end: true },
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, code: '01', end: true },
  { to: '/dashboard/profile', label: 'Profile', icon: UserRound, code: '02' },
  { to: '/dashboard/security', label: 'Security', icon: ShieldCheck, code: '03' },
  { to: '/dashboard/sessions', label: 'Sessions', icon: MonitorSmartphone, code: '04' },
];

const getSectionLabel = (pathname) => {
  if (pathname === '/dashboard') return 'Overview';
  return navigation.find((item) => !item.end && pathname.startsWith(item.to))?.label || 'Console';
};

const SidebarContent = ({ onNavigate, onLogout, loggingOut }) => {
  const { user } = useAuth();

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-20 shrink-0 items-center border-b-2 border-line px-6">
        <Link
          to="/"
          onClick={onNavigate}
          className="inline-flex"
          aria-label="AUTHIFY home"
        >
          <Logo />
        </Link>
      </div>

      <div className="border-b-2 border-line px-6 py-5">
        <div className="flex items-center justify-between">
          <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-muted">
            Access console
          </span>
          <Badge variant="acid" dot>
            Online
          </Badge>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Dashboard">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 border-2 px-3 py-3 transition-all',
                  isActive
                    ? 'border-acid bg-acid text-void shadow-[3px_3px_0_0_#FF00E5]'
                    : 'border-transparent text-muted hover:border-line hover:bg-card hover:text-white',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className="flex-1 text-[10px] font-bold uppercase tracking-[0.18em]">
                    {item.label}
                  </span>
                  <span
                    className={cn(
                      'font-display text-[9px] font-bold',
                      isActive ? 'text-void/60' : 'text-line group-hover:text-muted',
                    )}
                  >
                    {item.code}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t-2 border-line p-3">
        <div className="mb-3 border-2 border-line bg-card p-3">
          <div className="flex items-center gap-3">
            <UserAvatar
              name={user?.fullName}
              src={user?.avatar}
              className="h-9 w-9 text-xs"
            />
            <div className="min-w-0">
              <p className="truncate font-display text-xs font-bold uppercase tracking-[-0.01em] text-white">
                {user?.fullName}
              </p>
              <p className="truncate text-[9px] text-muted">{user?.email}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[8px] font-bold uppercase tracking-[0.18em] text-acid">
            <span className="h-1.5 w-1.5 bg-acid" />
            Account verified
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onLogout}
          loading={loggingOut}
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
          Close session
        </Button>
      </div>
    </div>
  );
};

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  const handleLogout = async () => {
    setLoggingOut(true);

    try {
      await logout();
      toast.success('Session closed. Your credentials are safe.');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(getApiError(error).message);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-void">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r-2 border-line bg-surface lg:block">
        <SidebarContent
          onNavigate={() => setMobileOpen(false)}
          onLogout={handleLogout}
          loggingOut={loggingOut}
        />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[90] bg-void/85 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setMobileOpen(false);
            }}
          >
            <motion.aside
              className="h-full w-[86%] max-w-xs border-r-2 border-line bg-surface"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.24, ease: 'easeOut' }}
            >
              <div className="relative h-full">
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="absolute right-3 top-5 z-10 flex h-9 w-9 items-center justify-center border-2 border-line text-muted transition-colors hover:border-acid hover:text-acid"
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
                <SidebarContent
                  onNavigate={() => setMobileOpen(false)}
                  onLogout={handleLogout}
                  loggingOut={loggingOut}
                />
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b-2 border-line bg-void/95 px-5 backdrop-blur lg:h-20 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center border-2 border-line text-white transition-colors hover:border-acid hover:text-acid lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.24em] text-muted">
                Console / {getSectionLabel(location.pathname)}
              </p>
              <p className="mt-0.5 font-display text-sm font-bold uppercase tracking-[-0.02em] text-white">
                {user?.fullName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="acid" dot className="hidden sm:inline-flex">
              Secure session
            </Badge>
            <Link
              to="/dashboard/profile"
              aria-label="Open profile"
              className="inline-flex"
            >
              <UserAvatar
                name={user?.fullName}
                src={user?.avatar}
                className="h-9 w-9 text-xs"
              />
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
