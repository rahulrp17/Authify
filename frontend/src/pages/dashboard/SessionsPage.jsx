import { useState } from 'react';
import {
  Laptop,
  MonitorSmartphone,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';
import { useSessions } from '../../hooks/useSessions';
import { getApiError } from '../../utils/apiError';
import { formatDate } from '../../utils/format';
import { parseUserAgent } from '../../utils/userAgent';
import { cn } from '../../utils/cn';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { Skeleton } from '../../components/common/Skeleton';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { Panel } from '../../components/dashboard/Panel';

const getDeviceIcon = (platform) => {
  if (platform === 'iPhone' || platform === 'Android') return Smartphone;
  if (platform === 'macOS' || platform === 'Linux') return Laptop;
  return MonitorSmartphone;
};

export const SessionsPage = () => {
  const { sessions, isLoading, error, refresh, revokeSession } = useSessions();
  const [target, setTarget] = useState(null);
  const [isRevoking, setIsRevoking] = useState(false);

  const handleRevoke = async () => {
    if (!target) return;

    setIsRevoking(true);

    try {
      await revokeSession(target.id);
      toast.success('Session revoked. That device must sign in again.');
      setTarget(null);
    } catch (revokeError) {
      toast.error(getApiError(revokeError).message);
    } finally {
      setIsRevoking(false);
    }
  };

  const targetDevice = parseUserAgent(target?.userAgent);

  return (
    <div>
      <PageHeader
        eyebrow="Sessions // 04"
        title="Every door. One key."
        description="Inspect where your identity is active and revoke anything you do not recognize. Revocation is immediate and server-side."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            loading={isLoading}
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            Refresh
          </Button>
        }
      />

      <div className="mb-6 flex items-start gap-3 border-2 border-acid/40 bg-acid/5 p-4">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-acid" aria-hidden="true" />
        <p className="text-xs leading-6 text-muted">
          The current session cannot be revoked from this screen. Use{' '}
          <span className="font-bold text-white">Close session</span> in the
          sidebar to end this device.
        </p>
      </div>

      {error && !isLoading && (
        <ErrorState
          title="Sessions unavailable"
          message={error}
          onRetry={refresh}
        />
      )}

      {!error && isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full" />
          ))}
        </div>
      )}

      {!error && !isLoading && sessions.length === 0 && (
        <EmptyState
          icon={MonitorSmartphone}
          title="No active sessions"
          description="No live sessions were found. Sign in again to create a fresh session."
          action={
            <Button to="/login" variant="outline" size="sm">
              Go to sign in
            </Button>
          }
        />
      )}

      {!error && !isLoading && sessions.length > 0 && (
        <div className="space-y-4">
          {sessions.map((session) => {
            const device = parseUserAgent(session.userAgent);
            const DeviceIcon = getDeviceIcon(device.platform);

            return (
              <div
                key={session.id}
                className={cn(
                  'border-2 bg-surface',
                  session.current ? 'border-acid shadow-[4px_4px_0_0_#39FF14]' : 'border-line',
                )}
              >
                <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <span
                      className={cn(
                        'flex h-12 w-12 shrink-0 items-center justify-center border-2',
                        session.current
                          ? 'border-acid bg-acid text-void'
                          : 'border-line bg-card text-muted',
                      )}
                    >
                      <DeviceIcon className="h-5 w-5" aria-hidden="true" />
                    </span>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-lg font-bold uppercase leading-none tracking-[-0.03em] text-white">
                          {device.browser}
                        </h2>
                        {session.current && (
                          <Badge variant="acid" dot>
                            This device
                          </Badge>
                        )}
                      </div>
                      <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
                        {device.platform}
                      </p>

                      <dl className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-3">
                        <div>
                          <dt className="text-[8px] font-bold uppercase tracking-[0.18em] text-muted">
                            Created
                          </dt>
                          <dd className="mt-1 text-[10px] text-white">
                            {formatDate(session.createdAt, {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[8px] font-bold uppercase tracking-[0.18em] text-muted">
                            Last used
                          </dt>
                          <dd className="mt-1 text-[10px] text-white">
                            {formatDate(session.lastUsedAt, {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-[8px] font-bold uppercase tracking-[0.18em] text-muted">
                            Expires
                          </dt>
                          <dd className="mt-1 text-[10px] text-white">
                            {formatDate(session.expiresAt, {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {session.current ? (
                      <Button variant="ghost" size="sm" disabled>
                        <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                        Protected
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setTarget(session)}
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Revoke
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Panel
        code="POLICY // SESSION"
        title="Revocation rules"
        className="mt-6"
      >
        <ul className="grid gap-3 text-xs leading-6 text-muted sm:grid-cols-2">
          <li className="border-l-2 border-acid pl-3">
            Revoking a session invalidates its JWT immediately on the server.
          </li>
          <li className="border-l-2 border-hot-pink pl-3">
            Password changes revoke every session except the one performing the
            change.
          </li>
          <li className="border-l-2 border-inferno pl-3">
            Sessions expire automatically, even if you never revoke them.
          </li>
          <li className="border-l-2 border-volt pl-3">
            Session tokens never touch local storage or JavaScript-readable
            cookies.
          </li>
        </ul>
      </Panel>

      <ConfirmDialog
        open={Boolean(target)}
        onClose={() => setTarget(null)}
        onConfirm={handleRevoke}
        title="Revoke this session?"
        description={`${targetDevice.browser} on ${targetDevice.platform} will be signed out immediately.`}
        confirmLabel="Revoke access"
        cancelLabel="Keep session"
        loading={isRevoking}
        variant="danger"
      >
        <p className="text-xs leading-6 text-muted">
          The device will need your email and password to open a new session.
          This action cannot be undone.
        </p>
      </ConfirmDialog>
    </div>
  );
};
