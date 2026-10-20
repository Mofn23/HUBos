'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useStoredPhoto, type StoredPhotoKind } from '@/lib/useStoredPhoto';

interface StoredPhotoProps {
  kind: StoredPhotoKind;
  id?: string | null;
  /** Miniatura disponible de inmediato (la del estado persistido). */
  fallback?: string | null;
  alt: string;
  className?: string;
  /**
   * Difiere la lectura de la copia HD hasta que la imagen entra en pantalla.
   * Requiere que exista `fallback` para poder observar el elemento.
   */
  lazy?: boolean;
}

/**
 * Imagen que arranca con la miniatura y cambia a la copia HD de IndexedDB.
 * El cambio es directo (sin fundido) para evitar parpadeos; el fundido solo se
 * usa en la primera aparición.
 */
export function StoredPhoto({ kind, id, fallback, alt, className, lazy = false }: StoredPhotoProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [visible, setVisible] = useState(!lazy);
  const [loaded, setLoaded] = useState(false);

  const { src } = useStoredPhoto(kind, id, fallback, visible);

  useEffect(() => {
    // Si la imagen ya estaba en caché, el evento load no se repite.
    if (imgRef.current?.complete) setLoaded(true);
  }, [src]);

  useEffect(() => {
    if (!lazy || visible) return;
    const element = imgRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '240px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [lazy, visible]);

  if (!src) return null;

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      draggable={false}
      decoding="async"
      onLoad={() => setLoaded(true)}
      className={cn(
        'transition-opacity duration-300 ease-out motion-reduce:transition-none',
        loaded ? 'opacity-100' : 'opacity-0',
        className
      )}
    />
  );
}
