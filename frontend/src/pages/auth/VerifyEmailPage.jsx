import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowRight, Mail, RefreshCw } from 'lucide-react';
import { authService } from '../../services/authService';
import { getApiError } from '../../utils/apiError';
import { useCountdown } from '../../hooks/useCountdown';
import { AuthHeader } from '../../components/auth/AuthHeader';
import { AuthAlert } from '../../components/common/AuthAlert';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { OTPInput } from '../../components/common/OTPInput';

export const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const initialEmail = searchParams.get('email') || location.state?.email || '';

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [formError, setFormError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const { seconds, isActive, start } = useCountdown(0);

  useEffect(() => {
    if (initialEmail) {
      start(60);
    }
  }, [initialEmail, start]);

  const handleVerify = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!email.trim()) {
      setFormError('Enter the email you enrolled with.');
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setFormError('Enter the full 6-digit verification code.');
      return;
    }

    setIsVerifying(true);

    try {
      await authService.verifyEmail({ email: email.trim(), otp });
      toast.success('Email verified. Your identity is confirmed.');
      navigate('/login', {
        replace: true,
        state: { email: email.trim(), verified: true },
      });
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
      const data = await authService.resendOtp({ email: email.trim() });
      toast.info('If the account exists, a fresh code is on its way.');
      start(data?.retryAfter || 60);
    } catch (error) {
      setFormError(getApiError(error).message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div>
      <AuthHeader
        code="Verify // 03"
        title="Check your inbox."
        description={
          email
            ? `We sent a six-digit code to ${email}. It expires in 10 minutes.`
            : 'Enter your email and the six-digit code we sent to confirm your identity.'
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
              Verification code
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
          Verify identity
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </form>

      <div className="mt-5 flex flex-col items-center gap-3 border-2 border-line bg-surface p-4 sm:flex-row sm:justify-between">
        <p className="text-[10px] uppercase tracking-[0.16em] text-muted">
          Didn&apos;t receive it?
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
          Already verified?{' '}
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
};
