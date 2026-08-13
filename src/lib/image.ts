/**
 * Compresses an image file to a lightweight base64 string with a maximum dimension and quality.
 * Prevents localStorage QuotaExceededError crashes and Gemini 4MB payload limits.
 */
export function compressImage(file: File, maxWidth = 800, quality = 0.7): Promise<string> {
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
