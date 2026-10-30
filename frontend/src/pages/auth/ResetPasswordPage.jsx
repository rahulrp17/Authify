import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowRight, Mail, RefreshCw } from 'lucide-react';
import { authService } from '../../services/authService';
import { applyServerErrors, getApiError } from '../../utils/apiError';
import { useCountdown } from '../../hooks/useCountdown';
import { AuthHeader } from '../../components/auth/AuthHeader';
import { AuthAlert } from '../../components/common/AuthAlert';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { OTPInput } from '../../components/common/OTPInput';
import { PasswordInput } from '../../components/common/PasswordInput';
import { PasswordStrength } from '../../components/common/PasswordStrength';

const schema = z
  .object({
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

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialEmail = searchParams.get('email') || '';

  const [step, setStep] = useState('verify');
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [formError, setFormError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { seconds, isActive, start } = useCountdown(0);

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const newPassword = useWatch({ control, name: 'newPassword' });

  useEffect(() => {
    if (initialEmail) {
      start(60);
    }
  }, [initialEmail, start]);

  const handleVerify = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!email.trim()) {
      setFormError('Enter the email that requested the reset.');
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setFormError('Enter the full 6-digit reset code.');
      return;
    }

    setIsVerifying(true);

    try {
      const data = await authService.verifyResetOtp({
        email: email.trim(),
        otp,
      });
      setResetToken(data.resetToken);
      setStep('reset');
      setFormError('');
      toast.success('Code verified. Create your new password.');
    } catch (error) {
      setFormError(getApiError(error).message);
      setOtp('');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setFormError('');

    if (!email.trim()) {
      setFormError('Enter your email first so we know where to send the code.');
      return;
    }

    setIsResending(true);

    try {
      const data = await authService.forgotPassword({ email: email.trim() });
      toast.info('If the account exists, a fresh reset code is on its way.');
      start(data?.retryAfter || 60);
    } catch (error) {
      setFormError(getApiError(error).message);
    } finally {
      setIsResending(false);
    }
  };

  const onReset = async (values) => {
    setFormError('');

    try {
      await authService.resetPassword({
        email: email.trim(),
        resetToken,
        newPassword: values.newPassword,
      });
      toast.success('Password updated. Every previous session was revoked.');
      navigate('/login', {
        replace: true,
        state: { email: email.trim(), reset: true },
      });
    } catch (error) {
      const apiError = getApiError(error);
      setFormError(apiError.message);
      applyServerErrors(apiError.errors, setError);
    }
  };

  if (step === 'reset') {
    return (
      <div>
        <AuthHeader
          code="Reset // 06"
          title="Set a new password."
          description={`Recovery verified for ${email}. Choose a password you have never used here before.`}
        />

        {formError && (
          <AuthAlert type="error" title="Reset failed" className="mb-5">
            {formError}
            {formError.toLowerCase().includes('expired') && (
              <div className="mt-3">
                <Link
                  to={`/reset-password?email=${encodeURIComponent(email)}`}
                  className="text-[10px] font-bold uppercase tracking-[0.16em] text-acid hover:text-white"
                  onClick={() => {
                    setStep('verify');
                    setResetToken('');
                    setOtp('');
                  }}
                >
                  Request a fresh code
                </Link>
              </div>
            )}
          </AuthAlert>
        )}

        <form onSubmit={handleSubmit(onReset)} className="space-y-5" noValidate>
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

          <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
            Commit new password
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </form>

        <div className="mt-8 border-t-2 border-line pt-6">
          <p className="text-center text-xs text-muted">
            Remembered your password?{' '}
            <Link
              to="/login"
              className="font-bold uppercase tracking-[0.12em] text-acid transition-colors hover:text-white"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AuthHeader
        code="Recover // 05"
        title="Verify the code."
        description={
          email
            ? `Enter the six-digit reset code sent to ${email}.`
            : 'Enter the email that requested the reset and the six-digit code we sent.'
        }
      />

      {formError && (
        <AuthAlert type="error" title="Verification failed" className="mb-5">
          {formError}
        </AuthAlert>
      )}

      <form onSubmit={handleVerify} className="space-y-5" noValidate>
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="operator@domain.com"
          icon={Mail}
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
              Reset code
            </span>
            <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-hot-pink">
              6 digits
            </span>
          </div>
          <OTPInput
            value={otp}
            onChange={setOtp}
            disabled={isVerifying}
            error={Boolean(formError)}
            autoFocus={Boolean(initialEmail)}
          />
        </div>

        <Button type="submit" size="lg" className="w-full" loading={isVerifying}>
          Verify reset code
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </form>

      <div className="mt-5 flex flex-col items-center gap-3 border-2 border-line bg-surface p-4 sm:flex-row sm:justify-between">
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
          Code expired?
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleResend}
          disabled={isActive || isResending}
          loading={isResending}
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          {isActive ? `Resend in ${seconds}s` : 'Resend code'}
        </Button>
      </div>

      <div className="mt-8 border-t-2 border-line pt-6">
        <p className="text-center text-xs text-muted">
          No code yet?{' '}
          <Link
            to="/forgot-password"
            className="font-bold uppercase tracking-[0.12em] text-acid transition-colors hover:text-white"
          >
            Start over
          </Link>
        </p>
      </div>
    </div>
  );
};
