const MAX_AVATAR_FILE_SIZE = 5 * 1024 * 1024;
const AVATAR_SIZE = 320;

export const fileToAvatarDataUrl = (file) =>
  new Promise((resolve, reject) => {
    if (!file?.type?.startsWith('image/')) {
      reject(new Error('Choose a PNG, JPEG, or WebP image.'));
      return;
    }

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      reject(new Error('Choose a PNG, JPEG, or WebP image.'));
      return;
    }

    if (file.size > MAX_AVATAR_FILE_SIZE) {
      reject(new Error('Image must be 5 MB or smaller.'));
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Could not read that image.'));
    reader.onload = () => {
      const image = new Image();

      image.onerror = () => reject(new Error('Could not process that image.'));
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
          reject(new Error('Could not process that image.'));
          return;
        }

        const scale = Math.max(AVATAR_SIZE / image.width, AVATAR_SIZE / image.height);
        const width = image.width * scale;
        const height = image.height * scale;

        canvas.width = AVATAR_SIZE;
        canvas.height = AVATAR_SIZE;
        context.fillStyle = '#101010';
        context.fillRect(0, 0, AVATAR_SIZE, AVATAR_SIZE);
        context.drawImage(
          image,
          (AVATAR_SIZE - width) / 2,
          (AVATAR_SIZE - height) / 2,
          width,
          height,
        );

        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };

      image.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
