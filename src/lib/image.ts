/**
 * Compresses an image file to a lightweight base64 string.
 * Prevents localStorage QuotaExceededError crashes and Gemini payload limits.
 *
 * @param file - The image File to compress.
 * @param maxWidth - Max dimension in pixels (default 800).
 * @param quality - JPEG quality 0-1 (default 0.6).
 * @returns A data:image/jpeg;base64,... string.
 */
export function compressImage(file: File, maxWidth = 800, quality = 0.6): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);

      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxWidth) {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('No se pudo inicializar el contexto de imagen'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', quality);

      canvas.width = 0;
      canvas.height = 0;

      resolve(dataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Error al cargar la imagen seleccionada'));
    };

    img.src = url;
  });
}

/**
 * Creates a tiny thumbnail from a base64 data URL for localStorage persistence.
 * Full-resolution images must NOT be saved to localStorage to avoid QuotaExceededError.
 *
 * @param base64DataUrl - A full data:image/...;base64,... string.
 * @param thumbSize - Max dimension for the thumbnail (default 120px).
 * @param quality - JPEG quality 0-1 (default 0.4).
 * @returns A small data:image/jpeg;base64,... thumbnail string (~3-8KB).
 */
export function createThumbnail(base64DataUrl: string, thumbSize = 120, quality = 0.4): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > thumbSize) {
          height = Math.round((height * thumbSize) / width);
          width = thumbSize;
        }
      } else {
        if (height > thumbSize) {
          width = Math.round((width * thumbSize) / height);
          height = thumbSize;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('No se pudo crear thumbnail'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const thumbUrl = canvas.toDataURL('image/jpeg', quality);

      canvas.width = 0;
      canvas.height = 0;

      resolve(thumbUrl);
    };

    img.onerror = () => {
      reject(new Error('Error al generar thumbnail'));
    };

    img.src = base64DataUrl;
  });
}
