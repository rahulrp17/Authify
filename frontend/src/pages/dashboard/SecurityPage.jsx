import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  AlertTriangle,
  KeyRound,
  MailCheck,
  MonitorSmartphone,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../../context/auth-context';
import { userService } from '../../services/userService';
import { applyServerErrors, getApiError } from '../../utils/apiError';
import { AuthAlert } from '../../components/common/AuthAlert';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { PasswordInput } from '../../components/common/PasswordInput';
import { PasswordStrength } from '../../components/common/PasswordStrength';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { Panel } from '../../components/dashboard/Panel';

const schema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required.').max(128),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .max(128, 'Password must be at most 128 characters.')
      .regex(/[a-z]/, 'Include a lowercase letter.')
      .regex(/[A-Z]/, 'Include an uppercase letter.')
      .regex(/[0-9]/, 'Include a number.'),
    confirmPassword: z.string().min(1, 'Confirm your new password.'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

const stack = [
  {
    icon: MailCheck,
    title: 'Email verification',
    value: '6-digit OTP / 10 min expiry',
  },
  {
    icon: KeyRound,
    title: 'Password hashing',
    value: 'bcrypt / 12 rounds',
  },
  {
    icon: MonitorSmartphone,
    title: 'Session tokens',
    value: 'JWT + JTI / HttpOnly cookie',
  },
  {
    icon: ShieldCheck,
    title: 'Request integrity',
    value: 'CSRF double-submit / rate limits',
  },
];

export const SecurityPage = () => {
  const { user, refreshUser, setUser } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const newPassword = useWatch({ control, name: 'newPassword' });

  const onSubmit = async (values) => {
    setFormError('');

    try {
      await userService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      await refreshUser();
      reset();
      toast.success('Password rotated. All other sessions were revoked.');
    } catch (error) {
      const apiError = getApiError(error);
      setFormError(apiError.message);
      applyServerErrors(apiError.errors, setError);
    }
  };

  const openDeleteDialog = () => {
    setDeletePassword('');
    setDeleteError('');
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    setDeleteError('');

    if (!deletePassword) {
      setDeleteError('Enter your password to confirm deletion.');
      return;
    }

    setIsDeleting(true);

    try {
      await userService.deleteAccount({ password: deletePassword });
      setUser(null);
      toast.success('Account deleted. Your identity has been removed.');
      navigate('/', { replace: true });
    } catch (error) {
      setDeleteError(getApiError(error).message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Security // 03"
        title="Lock it down."
        description="Rotate your password, inspect the protections around your account, or destroy the identity entirely."
      />

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <Panel
          code="CREDENTIAL // ROTATE"
          title="Change password"
          description="Rotating your password immediately revokes every other session."
        >
          {formError && (
            <AuthAlert type="error" title="Rotation failed" className="mb-5">
              {formError}
            </AuthAlert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <PasswordInput
              label="Current password"
              autoComplete="current-password"
              placeholder="Prove it is you"
              error={errors.currentPassword?.message}
              required
              {...register('currentPassword')}
            />

            <div>
              <PasswordInput
                label="New password"
                autoComplete="new-password"
                placeholder="Minimum 8 characters"
                error={errors.newPassword?.message}
                required
                {...register('newPassword')}
              />
              <PasswordStrength password={newPassword} />
            </div>

            <PasswordInput
              label="Confirm new password"
              autoComplete="new-password"
              placeholder="Repeat your new password"
              error={errors.confirmPassword?.message}
              required
              {...register('confirmPassword')}
            />

            <div className="flex flex-wrap items-center gap-3 border-t-2 border-line pt-5">
              <Button type="submit" loading={isSubmitting}>
                <KeyRound className="h-4 w-4" aria-hidden="true" />
                Rotate password
              </Button>
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
                Last rotated {new Date(user.passwordChangedAt).toLocaleDateString()}
              </p>
            </div>
          </form>
        </Panel>

        <div className="space-y-6">
          <Panel code="STACK // ACTIVE" title="Protection stack">
            <ul className="divide-y divide-line">
              {stack.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.title} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-line bg-card">
                      <Icon className="h-4 w-4 text-acid" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white">
                        {item.title}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted">
                        {item.value}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </Panel>

          <div className="border-2 border-hot-pink/60 bg-hot-pink/5 p-5">
            <p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.22em] text-hot-pink">
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Zero compromise
            </p>
            <p className="mt-3 text-xs leading-6 text-muted">
              We never store plaintext passwords, never return session tokens to
              the browser, and never keep OTPs in readable form.
            </p>
          </div>
        </div>
      </div>

      <Panel
        code="DANGER // IRREVERSIBLE"
        title="Destroy identity"
        description="Deleting your account removes the user record, every session, and all pending OTPs."
        className="mt-6 border-error/70"
        actions={
          <Button variant="danger" size="sm" onClick={openDeleteDialog}>
            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            Delete account
          </Button>
        }
      >
        <div className="flex items-start gap-3 border-2 border-error/40 bg-error/5 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-error" aria-hidden="true" />
          <p className="text-xs leading-6 text-muted">
            This action cannot be undone. You will be signed out immediately and
            lose access to this identity forever.
          </p>
        </div>
      </Panel>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteError('');
          setDeletePassword('');
        }}
        onConfirm={handleDelete}
        title="Destroy this identity?"
        description="Enter your password to confirm. Every session and recovery code will be revoked."
        confirmLabel="Delete forever"
        cancelLabel="Keep account"
        loading={isDeleting}
        variant="danger"
      >
        <PasswordInput
          label="Current password"
          autoComplete="current-password"
          placeholder="Confirm with your password"
          value={deletePassword}
          onChange={(event) => setDeletePassword(event.target.value)}
          error={deleteError}
          autoFocus
        />
      </ConfirmDialog>
    </div>
  );
};
