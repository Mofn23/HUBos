/**
 * IndexedDB storage utility for full-resolution meal and progress images.
 * Bypasses localStorage 5MB quotas by using browser-native persistent IndexedDB (gigabytes of quota on iOS).
 */

const DB_NAME = 'hubos_media_db';
const DB_VERSION = 2;
const MEAL_STORE = 'meal_images';
const PROGRESS_STORE = 'progress_images';

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB no está disponible en este entorno'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e: any) => {
      const db = e.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains(MEAL_STORE)) {
        db.createObjectStore(MEAL_STORE);
      }
      if (!db.objectStoreNames.contains(PROGRESS_STORE)) {
        db.createObjectStore(PROGRESS_STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Saves a high-quality base64 image linked to a meal ID in IndexedDB.
 */
export async function saveMealImage(mealId: string, base64DataUrl: string): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(MEAL_STORE, 'readwrite');
      const store = tx.objectStore(MEAL_STORE);
      const req = store.put(base64DataUrl, mealId);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[ImageStorage] Error guardando imagen en IndexedDB:', err);
  }
}

/**
 * Retrieves a full-resolution image from IndexedDB.
 */
export async function getMealImage(mealId: string): Promise<string | null> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(MEAL_STORE, 'readonly');
      const store = tx.objectStore(MEAL_STORE);
      const req = store.get(mealId);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('[ImageStorage] Error leyendo imagen de IndexedDB:', err);
    return null;
  }
}

/**
 * Deletes an image from IndexedDB when a meal is removed.
 */
export async function deleteMealImage(mealId: string): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(MEAL_STORE, 'readwrite');
      const store = tx.objectStore(MEAL_STORE);
      const req = store.delete(mealId);

      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch (err) {
    console.warn('[ImageStorage] Error eliminando imagen de IndexedDB:', err);
  }
}

/**
 * Saves a progress photo in IndexedDB to keep the Zustand state tiny.
 */
export async function saveProgressPhoto(photoId: string, base64DataUrl: string): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(PROGRESS_STORE, 'readwrite');
      const store = tx.objectStore(PROGRESS_STORE);
      const req = store.put(base64DataUrl, photoId);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('[ImageStorage] Error guardando foto de progreso en IndexedDB:', err);
  }
}

/**
 * Retrieves a progress photo from IndexedDB.
 */
export async function getProgressPhoto(photoId: string): Promise<string | null> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(PROGRESS_STORE, 'readonly');
      const store = tx.objectStore(PROGRESS_STORE);
      const req = store.get(photoId);

      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (err) {
    console.warn('[ImageStorage] Error leyendo foto de progreso de IndexedDB:', err);
    return null;
  }
}

/**
 * Deletes a progress photo from IndexedDB.
 */
export async function deleteProgressPhoto(photoId: string): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve) => {
      const tx = db.transaction(PROGRESS_STORE, 'readwrite');
      const store = tx.objectStore(PROGRESS_STORE);
      const req = store.delete(photoId);

      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch (err) {
    console.warn('[ImageStorage] Error eliminando foto de progreso de IndexedDB:', err);
  }
}
