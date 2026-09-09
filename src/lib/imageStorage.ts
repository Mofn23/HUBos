/**
 * IndexedDB storage utility for full-resolution meal and progress images.
 * Bypasses localStorage 5MB quotas by using browser-native persistent IndexedDB (gigabytes of quota on iOS).
 */

const DB_NAME = 'hubos_media_db';
const DB_VERSION = 1;
const STORE_NAME = 'meal_images';

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB no está disponible en este entorno'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e: any) => {
      const db = e.target.result as IDBDatabase;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
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
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
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
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
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
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(mealId);

      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch (err) {
    console.warn('[ImageStorage] Error eliminando imagen de IndexedDB:', err);
  }
}
