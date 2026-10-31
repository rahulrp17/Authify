import { useState } from 'react';
import { cn } from '../../utils/cn';

export const UserAvatar = ({
  name = '',
  src,
  alt,
  className,
  imageClassName,
}) => {
  const [failedSrc, setFailedSrc] = useState(null);
  const initial = name.trim().charAt(0).toUpperCase() || 'A';
  const showImage = Boolean(src) && failedSrc !== src;

  return (
    <span
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden border-2 border-acid bg-acid font-display font-bold uppercase text-void',
        className,
      )}
      role={showImage ? undefined : 'img'}
      aria-label={showImage ? undefined : `${name || 'User'} avatar`}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt || `${name || 'User'} profile`}
          className={cn('h-full w-full object-cover', imageClassName)}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailedSrc(src)}
        />
      ) : (
        <span aria-hidden="true">{initial}</span>
      )}
    </span>
  );
};
