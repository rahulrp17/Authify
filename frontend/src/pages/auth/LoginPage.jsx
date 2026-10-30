import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowRight, Mail } from 'lucide-react';
import { useAuth } from '../../context/auth-context';
import { applyServerErrors, getApiError } from '../../utils/apiError';
import { getFirstName } from '../../utils/format';
import { AuthHeader } from '../../components/auth/AuthHeader';
import { AuthAlert } from '../../components/common/AuthAlert';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { PasswordInput } from '../../components/common/PasswordInput';

const schema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.').max(128),
  remember: z.boolean().optional(),
});

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: location.state?.email || '',
      password: '',
      remember: false,
    },
  });

  const onSubmit = async (values) => {
    setFormError('');
    setUnverifiedEmail('');

    try {
      const user = await login(values);
      toast.success(`Welcome back, ${getFirstName(user.fullName)}.`);
      const from = location.state?.from?.pathname;
      const target = from?.startsWith('/dashboard') ? from : '/dashboard';
      navigate(target, { replace: true });
    } catch (error) {
      const apiError = getApiError(error);
      setFormError(apiError.message);
      applyServerErrors(apiError.errors, setError);

      if (apiError.code === 'EMAIL_NOT_VERIFIED') {
        setUnverifiedEmail(values.email);
      }
    }
  };

  return (
    <div>
      <AuthHeader
        code="Access // 01"
        title="Welcome back."
        description="Sign in to inspect your profile, rotate credentials, and control every active session."
      />

      <div className="space-y-4">
        {location.state?.verified && (
          <AuthAlert type="success" title="Email verified">
            Your identity is confirmed. Sign in to open the console.
          </AuthAlert>
        )}

        {location.state?.reset && (
          <AuthAlert type="success" title="Password updated">
            All previous sessions were revoked. Sign in with your new password.
          </AuthAlert>
        )}

        {formError && !unverifiedEmail && (
          <AuthAlert type="error" title="Access denied">
            {formError}
          </AuthAlert>
        )}

        {unverifiedEmail && (
          <AuthAlert
            type="warning"
            title="Email not verified"
            action={
              <Button
                to={`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`}
                variant="outline"
                size="sm"
              >
                Verify email
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            }
          >
            Verify {unverifiedEmail} before opening a session.
          </AuthAlert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="operator@domain.com"
            icon={Mail}
            error={errors.email?.message}
            required
            {...register('email')}
          />

          <PasswordInput
            label="Password"
            autoComplete="current-password"
            placeholder="Enter your password"
            error={errors.password?.message}
            required
            {...register('password')}
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-muted">
              <input
                type="checkbox"
                className="h-4 w-4 border-2 border-line bg-void accent-acid"
                {...register('remember')}
              />
              Keep me signed in for 7 days
            </label>

            <Link
              to="/forgot-password"
              className="text-[10px] font-bold uppercase tracking-[0.16em] text-acid transition-colors hover:text-white"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
            Open session
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </form>
      </div>

      <div className="mt-8 border-t-2 border-line pt-6">
        <p className="text-center text-xs text-muted">
          No identity yet?{' '}
          <Link
            to="/register"
            className="font-bold uppercase tracking-[0.12em] text-hot-pink transition-colors hover:text-white"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};
