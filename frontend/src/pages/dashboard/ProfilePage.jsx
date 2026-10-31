import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  CalendarDays,
  Fingerprint,
  ImagePlus,
  Mail,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
} from 'lucide-react';
import { useAuth } from '../../context/auth-context';
import { userService } from '../../services/userService';
import { applyServerErrors, getApiError } from '../../utils/apiError';
import { formatDateOnly } from '../../utils/format';
import { fileToAvatarDataUrl } from '../../utils/image';
import { AuthAlert } from '../../components/common/AuthAlert';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { UserAvatar } from '../../components/common/UserAvatar';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { Panel } from '../../components/dashboard/Panel';

const schema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters.')
    .max(80, 'Full name must be at most 80 characters.'),
});

export const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [formError, setFormError] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(user.avatar || '');
  const [avatarDirty, setAvatarDirty] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { fullName: user.fullName },
  });

  useEffect(() => {
    reset({ fullName: user.fullName });
  }, [user.fullName, reset]);

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    setAvatarError('');
    setIsProcessingImage(true);

    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      setAvatarPreview(dataUrl);
      setAvatarDirty(true);
    } catch (error) {
      setAvatarError(error.message);
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview('');
    setAvatarDirty(true);
    setAvatarError('');
  };

  const handleDiscard = () => {
    reset({ fullName: user.fullName });
    setAvatarPreview(user.avatar || '');
    setAvatarDirty(false);
    setAvatarError('');
    setFormError('');
  };

  const onSubmit = async (values) => {
    setFormError('');

    try {
      const payload = { fullName: values.fullName };

      if (avatarDirty) {
        payload.avatar = avatarPreview || '';
      }

      const data = await userService.updateProfile(payload);
      updateUser(data.user);
      reset({ fullName: data.user.fullName });
      setAvatarPreview(data.user.avatar || '');
      setAvatarDirty(false);
      toast.success('Profile updated.');
    } catch (error) {
      const apiError = getApiError(error);
      const avatarFieldError = apiError.errors.find((item) => item.field === 'avatar');

      setFormError(apiError.message);

      if (avatarFieldError) {
        setAvatarError(avatarFieldError.message);
      }

      applyServerErrors(
        apiError.errors.filter((item) => item.field !== 'avatar'),
        setError,
      );
    }
  };

  const hasChanges = isDirty || avatarDirty;

  return (
    <div>
      <PageHeader
        eyebrow="Profile // 02"
        title="Your identity file."
        description="Keep your display name and profile image current. Email and verification status are controlled by the security layer."
      />

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="space-y-6">
          <Panel code="FILE // PRIMARY" title="Identity card" bodyClassName="p-0">
            <div className="relative border-b-2 border-line bg-card p-6">
              <div className="absolute right-4 top-4">
                <Badge variant="acid" dot>
                  Verified
                </Badge>
              </div>
              <UserAvatar
                name={user.fullName}
                src={user.avatar}
                className="h-20 w-20 text-3xl shadow-[4px_4px_0_0_#FF00E5]"
              />
              <h2 className="mt-6 font-display text-2xl font-bold uppercase leading-none tracking-[-0.05em] text-white">
                {user.fullName}
              </h2>
              <p className="mt-2 break-all text-xs text-muted">{user.email}</p>
            </div>

            <dl className="divide-y divide-line">
              <div className="flex items-center justify-between gap-4 px-5 py-3.5">
                <dt className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-muted">
                  <Fingerprint className="h-3.5 w-3.5" aria-hidden="true" />
                  User ID
                </dt>
                <dd className="text-right font-mono text-[10px] text-white">{user.userId}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 px-5 py-3.5">
                <dt className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-muted">
                  <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                  Email
                </dt>
                <dd className="text-right text-[10px] text-white">{user.email}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 px-5 py-3.5">
                <dt className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-muted">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                  Joined
                </dt>
                <dd className="text-right text-[10px] text-white">
                  {formatDateOnly(user.createdAt)}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 px-5 py-3.5">
                <dt className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-muted">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  Password
                </dt>
                <dd className="text-right text-[10px] text-white">
                  Rotated {formatDateOnly(user.passwordChangedAt)}
                </dd>
              </div>
            </dl>
          </Panel>

          <div className="border-2 border-line bg-card p-5">
            <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-inferno">
              Immutable field
            </p>
            <p className="mt-2 text-xs leading-6 text-muted">
              Your email address is tied to verification and recovery. Changing
              it requires a dedicated re-verification flow and is not exposed
              here.
            </p>
          </div>
        </div>

        <Panel
          code="EDIT // DISPLAY"
          title="Update profile"
          description="Update your display name and profile image. Both appear across the console."
        >
          {formError && (
            <AuthAlert type="error" title="Update failed" className="mb-5">
              {formError}
            </AuthAlert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
                Profile image
              </p>
              <div className="flex flex-col gap-4 border-2 border-line bg-void p-4 sm:flex-row sm:items-center">
                <UserAvatar
                  name={user.fullName}
                  src={avatarPreview}
                  className="h-20 w-20 text-2xl shadow-[4px_4px_0_0_#FF00E5]"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 border-2 border-line bg-transparent px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white transition-colors hover:border-acid hover:text-acid">
                      <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" />
                      {avatarPreview ? 'Change image' : 'Upload image'}
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="sr-only"
                        onChange={handleAvatarChange}
                        disabled={isProcessingImage || isSubmitting}
                      />
                    </label>
                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        disabled={isProcessingImage || isSubmitting}
                        className="inline-flex items-center gap-2 border-2 border-transparent px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-error transition-colors hover:border-error/50 hover:bg-error/10 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        Remove
                      </button>
                    )}
                  </div>
                  <p className="mt-2 text-[10px] leading-5 text-muted">
                    PNG, JPEG, or WebP. Images are cropped to a square and resized
                    to 320px before upload.
                  </p>
                  {isProcessingImage && (
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-acid">
                      Processing image...
                    </p>
                  )}
                  {avatarError && (
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-error">
                      {avatarError}
                    </p>
                  )}
                </div>
              </div>
            </div>

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

            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
                Email
              </p>
              <div className="flex items-center justify-between gap-3 border-2 border-line bg-void px-4 py-3.5">
                <span className="truncate text-sm text-muted">{user.email}</span>
                <Badge variant="acid" dot>
                  Locked
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t-2 border-line pt-5">
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={!hasChanges || isProcessingImage}
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                Save profile
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleDiscard}
                disabled={!hasChanges || isSubmitting || isProcessingImage}
              >
                Discard changes
              </Button>
            </div>
          </form>
        </Panel>
      </div>
    </div>
  );
};
