'use client';

import { useEffect, useState } from 'react';
import { getMealImage, getProgressPhoto } from '@/lib/imageStorage';

export type StoredPhotoKind = 'meal' | 'progress';

/**
 * Resuelve la foto en alta definición guardada en IndexedDB.
 *
 * El estado persistido solo guarda una miniatura ligera; al abrir o listar una
 * foto, este hook recupera la copia HD y la devuelve en cuanto está disponible.
 * Mientras llega, se usa la miniatura como fallback para evitar saltos de layout.
 *
 * @param enabled - Permite diferir la lectura hasta que la imagen es visible.
 */
export function useStoredPhoto(
  kind: StoredPhotoKind,
  id?: string | null,
  fallback?: string | null,
  enabled = true
): { src: string | null; isHd: boolean } {
  const [hdSrc, setHdSrc] = useState<string | null>(null);

  useEffect(() => {
    setHdSrc(null);
    if (!id || !enabled) return;

    let cancelled = false;
    const load = kind === 'meal' ? getMealImage : getProgressPhoto;

    load(id)
      .then((image) => {
        if (!cancelled && image) setHdSrc(image);
      })
      .catch(() => {
        // Sin copia HD disponible: se mantiene la miniatura.
      });

    return () => {
      cancelled = true;
    };
  }, [kind, id, enabled]);

  return { src: hdSrc || fallback || null, isHd: Boolean(hdSrc) };
}
