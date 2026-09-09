/**
 * Compresses an image file to a high-definition, clear base64 string.
 * Retains high visual detail so the user can inspect ingredients and Gemini AI
 * can accurately detect portions, textures, and food items.
 *
 * @param file - The image File to compress.
 * @param maxWidth - Max dimension in pixels (default 1200 for crisp HD).
 * @param quality - JPEG quality 0-1 (default 0.80 for high fidelity).
 * @returns A data:image/jpeg;base64,... string (~150-280KB).
 */
export function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<string> {
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
 * Creates a clear, optimized preview thumbnail from a base64 data URL.
 * Used for fast rendering in dashboard meal lists without blurring or pixelation.
 *
 * @param base64DataUrl - A full data:image/...;base64,... string.
 * @param thumbSize - Max dimension for the thumbnail (default 420px for sharp previews).
 * @param quality - JPEG quality 0-1 (default 0.65).
 * @returns A crisp data:image/jpeg;base64,... preview string (~25-35KB).
 */
export function createThumbnail(base64DataUrl: string, thumbSize = 420, quality = 0.65): Promise<string> {
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
