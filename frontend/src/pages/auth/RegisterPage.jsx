import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { ArrowRight, Mail, UserRound } from 'lucide-react';
import { useAuth } from '../../context/auth-context';
import { applyServerErrors, getApiError } from '../../utils/apiError';
import { AuthHeader } from '../../components/auth/AuthHeader';
import { AuthAlert } from '../../components/common/AuthAlert';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { PasswordInput } from '../../components/common/PasswordInput';
import { PasswordStrength } from '../../components/common/PasswordStrength';

const schema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, 'Full name must be at least 2 characters.')
      .max(80, 'Full name must be at most 80 characters.'),
    email: z
      .string()
      .trim()
      .min(1, 'Email is required.')
      .email('Enter a valid email address.')
      .max(254, 'Email is too long.'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .max(128, 'Password must be at most 128 characters.')
      .regex(/[a-z]/, 'Include a lowercase letter.')
      .regex(/[A-Z]/, 'Include an uppercase letter.')
      .regex(/[0-9]/, 'Include a number.'),
    confirmPassword: z.string().min(1, 'Confirm your password.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export const RegisterPage = () => {
  const { register: registerAccount } = useAuth();
  const navigate = useNavigate();
  const [formError, setFormError] = useState('');

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = useWatch({ control, name: 'password' });

  const onSubmit = async (values) => {
    setFormError('');

    try {
      await registerAccount({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
      });

      toast.success('Identity created. Check your inbox for the verification code.');
      navigate(`/verify-email?email=${encodeURIComponent(values.email)}`, {
        replace: true,
        state: { email: values.email, justRegistered: true },
      });
    } catch (error) {
      const apiError = getApiError(error);
      setFormError(apiError.message);
      applyServerErrors(apiError.errors, setError);
    }
  };

  return (
    <div>
      <AuthHeader
        code="Enroll // 02"
        title="Create your identity."
        description="One account. Verified email. Revocable sessions. No hidden tracking, no shared credentials."
      />

      {formError && (
        <AuthAlert type="error" title="Enrollment blocked" className="mb-5">
          {formError}
        </AuthAlert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        <Input
          label="Full name"
          type="text"
          autoComplete="name"
          placeholder="Ada Lovelace"
          icon={UserRound}
          error={errors.fullName?.message}
          required
          {...register('fullName')}
        />

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

        <div>
          <PasswordInput
            label="Password"
            autoComplete="new-password"
            placeholder="Minimum 8 characters"
            error={errors.password?.message}
            required
            {...register('password')}
          />
          <PasswordStrength password={password} />
        </div>

        <PasswordInput
          label="Confirm password"
          autoComplete="new-password"
          placeholder="Repeat your password"
          error={errors.confirmPassword?.message}
          required
          {...register('confirmPassword')}
        />

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Generate identity
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>

        <p className="text-[10px] leading-5 text-muted">
          By creating an account you agree to keep your credentials private.
          AUTHIFY never stores plaintext passwords or exposes session tokens to
          the browser.
        </p>
      </form>

      <div className="mt-8 border-t-2 border-line pt-6">
        <p className="text-center text-xs text-muted">
          Already enrolled?{' '}
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
