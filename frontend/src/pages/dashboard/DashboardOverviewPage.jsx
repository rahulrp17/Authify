import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Fingerprint,
  KeyRound,
  MonitorSmartphone,
  ShieldCheck,
  ShieldEllipsis,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../../context/auth-context';
import { useSessions } from '../../hooks/useSessions';
import { formatDateOnly, getFirstName } from '../../utils/format';
import { parseUserAgent } from '../../utils/userAgent';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { UserAvatar } from '../../components/common/UserAvatar';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { Panel } from '../../components/dashboard/Panel';
import { StatCard } from '../../components/dashboard/StatCard';

export const DashboardOverviewPage = () => {
  const { user } = useAuth();
  const { sessions, isLoading, error } = useSessions();
  const currentSession = sessions.find((session) => session.current);
  const currentDevice = parseUserAgent(currentSession?.userAgent);

  const posture = [
    {
      label: 'Email verification',
      value: user.isAccountVerified ? 'Confirmed' : 'Pending',
      ok: user.isAccountVerified,
      icon: BadgeCheck,
    },
    {
      label: 'Password rotation',
      value: `Last ${formatDateOnly(user.passwordChangedAt)}`,
      ok: true,
      icon: KeyRound,
    },
    {
      label: 'Session control',
      value: error
        ? 'Unavailable'
        : isLoading
          ? 'Scanning'
          : `${sessions.length} active`,
      ok: !error,
      icon: MonitorSmartphone,
    },
    {
      label: 'CSRF shield',
      value: 'Enforced',
      ok: true,
      icon: ShieldCheck,
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Overview // 01"
        title={`Welcome back, ${getFirstName(user.fullName)}.`}
        description="Your identity is active. Review posture, inspect account facts, and move directly into the controls that matter."
        actions={
          <>
            <Button to="/dashboard/profile" variant="outline" size="sm">
              Edit profile
            </Button>
            <Button to="/dashboard/sessions" size="sm">
              Manage sessions
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Identity status"
          value={user.isAccountVerified ? 'Verified' : 'Pending'}
          hint={`ID ${user.userId}`}
          icon={BadgeCheck}
          accent="acid"
        />
        <StatCard
          label="Active sessions"
          value={isLoading ? '--' : String(sessions.length).padStart(2, '0')}
          hint={error ? 'Could not load sessions' : 'Revocable at any time'}
          icon={MonitorSmartphone}
          accent="pink"
        />
        <StatCard
          label="Last access"
          value={formatDateOnly(user.lastLoginAt)}
          hint="Most recent successful sign-in"
          icon={Clock3}
          accent="orange"
        />
        <StatCard
          label="Member since"
          value={formatDateOnly(user.createdAt)}
          hint={`Updated ${formatDateOnly(user.updatedAt)}`}
          icon={CalendarDays}
          accent="volt"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <Panel
            code="POSTURE // LIVE"
            title="Security posture"
            description="Signals sourced directly from your account record."
          >
            <ul className="divide-y divide-line">
              {posture.map((item) => {
                const Icon = item.icon;
                return (
                  <li
                    key={item.label}
                    className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center border-2 border-line bg-card">
                        <Icon className="h-4 w-4 text-muted" aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                          {item.label}
                        </p>
                        <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-muted">
                          {item.value}
                        </p>
                      </div>
                    </div>

                    {item.ok ? (
                      <CheckCircle2 className="h-4 w-4 text-acid" aria-label="Healthy" />
                    ) : (
                      <XCircle className="h-4 w-4 text-error" aria-label="Needs attention" />
                    )}
                  </li>
                );
              })}
            </ul>
          </Panel>

          <Panel
            code="ACTIONS // 03"
            title="Control shortcuts"
            description="Every path leads to a real, immediate action."
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <Link
                to="/dashboard/profile"
                className="group border-2 border-line bg-card p-4 transition-colors hover:border-acid"
              >
                <Fingerprint className="h-5 w-5 text-acid" aria-hidden="true" />
                <p className="mt-6 font-display text-sm font-bold uppercase tracking-[-0.02em] text-white">
                  Profile
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted">
                  Update display name
                </p>
              </Link>

              <Link
                to="/dashboard/security"
                className="group border-2 border-line bg-card p-4 transition-colors hover:border-hot-pink"
              >
                <ShieldEllipsis className="h-5 w-5 text-hot-pink" aria-hidden="true" />
                <p className="mt-6 font-display text-sm font-bold uppercase tracking-[-0.02em] text-white">
                  Security
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted">
                  Rotate password
                </p>
              </Link>

              <Link
                to="/dashboard/sessions"
                className="group border-2 border-line bg-card p-4 transition-colors hover:border-inferno"
              >
                <MonitorSmartphone className="h-5 w-5 text-inferno" aria-hidden="true" />
                <p className="mt-6 font-display text-sm font-bold uppercase tracking-[-0.02em] text-white">
                  Sessions
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-muted">
                  Revoke access
                </p>
              </Link>
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel code="IDENTITY // FILE" title="Account facts">
            <div className="mb-5 flex items-center gap-4">
              <UserAvatar
                name={user.fullName}
                src={user.avatar}
                className="h-14 w-14 text-xl"
              />
              <div className="min-w-0">
                <p className="truncate font-display text-lg font-bold uppercase tracking-[-0.03em] text-white">
                  {user.fullName}
                </p>
                <p className="truncate text-xs text-muted">{user.email}</p>
              </div>
            </div>

            <dl className="space-y-3 border-t-2 border-line pt-4">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted">
                  User ID
                </dt>
                <dd className="text-right font-mono text-[10px] text-white">{user.userId}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted">
                  Created
                </dt>
                <dd className="text-right text-[10px] text-white">
                  {formatDateOnly(user.createdAt)}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted">
                  Updated
                </dt>
                <dd className="text-right text-[10px] text-white">
                  {formatDateOnly(user.updatedAt)}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted">
                  Current device
                </dt>
                <dd className="text-right text-[10px] text-white">
                  {isLoading
                    ? 'Scanning'
                    : currentSession
                      ? `${currentDevice.browser} / ${currentDevice.platform}`
                      : 'Unavailable'}
                </dd>
              </div>
            </dl>
          </Panel>

          <div className="border-2 border-acid bg-acid p-5 text-void">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-[0.24em]">
                Session integrity
              </span>
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            </div>
            <p className="mt-4 font-display text-2xl font-bold uppercase leading-none tracking-[-0.05em]">
              No token in storage.
            </p>
            <p className="mt-3 text-xs leading-5 text-void/70">
              Sessions live in HttpOnly cookies. Revocation is immediate and
              server-side.
            </p>
            <Badge variant="neutral" className="mt-4 border-void/30 bg-void text-acid">
              HttpOnly / CSRF
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};
