/**
 * Pipeline de imagen de HUBos.
 *
 * - `compressImage` genera la copia en alta definición que se guarda en IndexedDB
 *   (borde largo 1600px, calidad 0.88) para que la foto se vea nítida al abrirla.
 * - `createThumbnail` deriva copias ligeras: miniaturas para las listas y el
 *   payload reducido que se envía a Gemini.
 *
 * La decodificación usa `createImageBitmap` cuando el WebView lo soporta, de modo
 * que el trabajo pesado no bloquea el hilo principal en el iPhone.
 */

const JPEG_MIME = 'image/jpeg';

/** Borde largo de la copia HD guardada en IndexedDB. */
export const HD_MAX_EDGE = 1600;
/** Calidad JPEG de la copia HD. */
export const HD_QUALITY = 0.88;

/** Miniatura que vive dentro del estado de Zustand (ligera, para listas). */
export const PREVIEW_MAX_EDGE = 320;
export const PREVIEW_QUALITY = 0.58;

/** Copia optimizada que se envía a Gemini: suficiente detalle, pocos KB. */
export const AI_MAX_EDGE = 896;
export const AI_QUALITY = 0.72;

function fitWithin(width: number, height: number, maxEdge: number) {
  if (width <= 0 || height <= 0) return { width: maxEdge, height: maxEdge };
  if (width >= height && width > maxEdge) {
    return { width: maxEdge, height: Math.max(1, Math.round((height * maxEdge) / width)) };
  }
  if (height > width && height > maxEdge) {
    return { width: Math.max(1, Math.round((width * maxEdge) / height)), height: maxEdge };
  }
  return { width, height };
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Error al cargar la imagen'));
    img.src = src;
  });
}

type DecodedImage = { source: CanvasImageSource; width: number; height: number; release: () => void };

async function decodeFile(file: File): Promise<DecodedImage> {
  if (typeof createImageBitmap === 'function') {
    // `imageOrientation: from-image` respeta el EXIF de las fotos de la cámara.
    const candidates: ImageBitmapOptions[] = [{ imageOrientation: 'from-image' }, {}];
    for (const options of candidates) {
      try {
        const bitmap = await createImageBitmap(file, options);
        return {
          source: bitmap,
          width: bitmap.width,
          height: bitmap.height,
          release: () => bitmap.close(),
        };
      } catch {
        // WebKit antiguo: probamos la siguiente variante o el fallback con <img>.
      }
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await loadHtmlImage(url);
    return {
      source: img,
      width: img.naturalWidth || img.width,
      height: img.naturalHeight || img.height,
      release: () => {},
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Codifica el canvas de forma asíncrona (`toBlob` + FileReader) para no bloquear
 * el hilo principal como lo haría `toDataURL` con imágenes grandes.
 */
function encodeCanvas(canvas: HTMLCanvasElement, quality: number): Promise<string> {
  return new Promise((resolve) => {
    const fallback = () => resolve(canvas.toDataURL(JPEG_MIME, quality));

    if (typeof canvas.toBlob !== 'function' || typeof FileReader === 'undefined') {
      fallback();
      return;
    }

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          fallback();
          return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = fallback;
        reader.readAsDataURL(blob);
      },
      JPEG_MIME,
      quality
    );
  });
}

function drawToCanvas(decoded: DecodedImage, maxEdge: number): HTMLCanvasElement {
  const { width, height } = fitWithin(decoded.width, decoded.height, maxEdge);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo inicializar el contexto de imagen');

  ctx.imageSmoothingEnabled = true;
  if ('imageSmoothingQuality' in ctx) {
    (ctx as CanvasRenderingContext2D & { imageSmoothingQuality: ImageSmoothingQuality }).imageSmoothingQuality = 'high';
  }

  ctx.drawImage(decoded.source, 0, 0, width, height);
  return canvas;
}

/**
 * Comprime una foto a alta definición y la devuelve como data URL JPEG.
 * Esta es la copia que se guarda en IndexedDB y se muestra al abrir la imagen.
 *
 * @param file - Archivo elegido en el input.
 * @param maxEdge - Borde largo máximo en píxeles (1600 por defecto).
 * @param quality - Calidad JPEG 0-1 (0.88 por defecto).
 */
export async function compressImage(
  file: File,
  maxEdge = HD_MAX_EDGE,
  quality = HD_QUALITY
): Promise<string> {
  const decoded = await decodeFile(file);
  try {
    const canvas = drawToCanvas(decoded, maxEdge);
    const dataUrl = await encodeCanvas(canvas, quality);
    canvas.width = 0;
    canvas.height = 0;
    return dataUrl;
  } finally {
    decoded.release();
  }
}

/**
 * Genera una versión reducida a partir de una data URL existente.
 * Se usa para las miniaturas del estado y para el payload de Gemini.
 *
 * @param base64DataUrl - Imagen original en data URL.
 * @param maxEdge - Borde largo máximo (360 por defecto).
 * @param quality - Calidad JPEG 0-1 (0.60 por defecto).
 */
export async function createThumbnail(
  base64DataUrl: string,
  maxEdge = PREVIEW_MAX_EDGE,
  quality = PREVIEW_QUALITY
): Promise<string> {
  const img = await loadHtmlImage(base64DataUrl);
  const decoded: DecodedImage = {
    source: img,
    width: img.naturalWidth || img.width,
    height: img.naturalHeight || img.height,
    release: () => {},
  };
  const canvas = drawToCanvas(decoded, maxEdge);
  const thumbUrl = await encodeCanvas(canvas, quality);
  canvas.width = 0;
  canvas.height = 0;
  return thumbUrl;
}
