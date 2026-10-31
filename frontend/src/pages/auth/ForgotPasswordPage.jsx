import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowRight, Mail } from 'lucide-react';
import { authService } from '../../services/authService';
import { applyServerErrors, getApiError } from '../../utils/apiError';
import { AuthHeader } from '../../components/auth/AuthHeader';
import { AuthAlert } from '../../components/common/AuthAlert';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

const schema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .email('Enter a valid email address.'),
});

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [sentTo, setSentTo] = useState('');
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values) => {
    setFormError('');

    try {
      await authService.forgotPassword({ email: values.email });
      setSentTo(values.email);
      toast.success('Recovery code sent. Check your inbox.');
    } catch (error) {
      const apiError = getApiError(error);
      setFormError(apiError.message);
      applyServerErrors(apiError.errors, setError);
    }
  };

  return (
    <div>
      <AuthHeader
        code="Recover // 04"
        title="Recover access."
        description="We will send a one-time code to your verified email. The code expires in 10 minutes."
      />

      {sentTo ? (
        <div className="space-y-5">
          <AuthAlert type="success" title="Recovery signal sent">
            If an account exists for <span className="font-bold text-white">{sentTo}</span>,
            a six-digit reset code is on its way.
          </AuthAlert>

          <Button
            size="lg"
            className="w-full"
            onClick={() =>
              navigate(`/reset-password?email=${encodeURIComponent(sentTo)}`)
            }
          >
            Enter reset code
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => setSentTo('')}
          >
            Use a different email
          </Button>
        </div>
      ) : (
        <>
          {formError && (
            <AuthAlert type="error" title="Request failed" className="mb-5">
              {formError}
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

            <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
              Send reset code
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </form>
        </>
      )}

      <div className="mt-8 border-t-2 border-line pt-6">
        <p className="text-center text-xs text-muted">
          Remembered it?{' '}
          <Link
            to="/login"
            className="font-bold uppercase tracking-[0.12em] text-acid transition-colors hover:text-white"
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
};
