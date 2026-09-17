import { Preferences } from '@capacitor/preferences';
import { StateStorage } from 'zustand/middleware';

/**
 * In-memory cache to guarantee synchronous-like read performance,
 * preventing UI stutter and allowing zero-latency lookups.
 */
const memoryCache = new Map<string, string>();

/**
 * Maximum safe payload size in characters (~1.5MB).
 * Prevents QuotaExceededError and iOS UserDefaults payload limits.
 */
const MAX_SAFE_PAYLOAD_CHARS = 1_500_000;

/**
 * Sanitizes large JSON state strings before writing to native storage.
 * If the string contains unexpectedly huge data (e.g. leftover uncompressed 4K base64 images),
 * it strips base64 payloads longer than 20KB to ensure the core state ALWAYS persists without failing.
 */
function sanitizePayload(rawJson: string): string {
  if (rawJson.length < MAX_SAFE_PAYLOAD_CHARS) {
    return rawJson;
  }

  try {
    console.warn(`[nativeStorage] Payload size (${(rawJson.length / 1024).toFixed(1)} KB) exceeds safe threshold. Trimming heavy media strings.`);
    const parsed = JSON.parse(rawJson);

    // If it's a state object with meals or photos
    if (parsed && typeof parsed === 'object' && parsed.state) {
      const state = parsed.state;

      // Clean large base64 in meals
      if (Array.isArray(state.meals)) {
        state.meals = state.meals.map((meal: any) => {
          if (typeof meal.imageBase64 === 'string' && meal.imageBase64.length > 25_000) {
            return { ...meal, imageBase64: undefined };
          }
          return meal;
        });
      }

      // Clean large base64 in progress photos (these are in IndexedDB)
      if (Array.isArray(state.photos)) {
        state.photos = state.photos.map((photo: any) => {
          if (typeof photo.imageBase64 === 'string' && photo.imageBase64.length > 25_000) {
            return { ...photo, imageBase64: '' };
          }
          return photo;
        });
      }

      // Clean large base64 in training logs
      if (Array.isArray(state.trainingLogs)) {
        state.trainingLogs = state.trainingLogs.map((log: any) => {
          if (typeof log.screenshotBase64 === 'string' && log.screenshotBase64.length > 25_000) {
            return { ...log, screenshotBase64: undefined };
          }
          return log;
        });
      }

      return JSON.stringify(parsed);
    }
  } catch (err) {
    console.error('[nativeStorage] Error during payload sanitization:', err);
  }

  return rawJson;
}

/**
 * Universal Native Storage Adapter for Zustand.
 *
 * 1. Primary Engine: @capacitor/preferences
 *    - On iOS, uses native NSUserDefaults / Library/Preferences/<bundle-id>.plist.
 *    - Preserved across app updates, SideStore / AltStore IPA refreshes, and device reboots.
 *    - Flushes to native disk immediately, immune to WebKit kill-on-exit issues.
 *
 * 2. Secondary Mirror: localStorage
 *    - Dual-written for web dev environment and instant backup.
 *
 * 3. Transparent Migration:
 *    - On first launch, if a key is absent from Preferences, it reads from localStorage
 *      and automatically writes it to Preferences, ensuring zero data loss for existing users.
 */
export const nativeStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    // SSR Protection
    if (typeof window === 'undefined') return null;

    // 1. Check memory cache first
    if (memoryCache.has(name)) {
      return memoryCache.get(name)!;
    }

    try {
      // 2. Read from native Preferences (iOS NSUserDefaults)
      const { value } = await Preferences.get({ key: name });
      if (value !== null && value !== undefined && value !== '') {
        memoryCache.set(name, value);
        return value;
      }

      // 3. Fallback & Migration: Check localStorage
      try {
        const localValue = localStorage.getItem(name);
        if (localValue) {
          memoryCache.set(name, localValue);
          // Migrate to native Preferences in background
          Preferences.set({ key: name, value: localValue }).catch((migErr) => {
            console.warn(`[nativeStorage] Migration error for ${name}:`, migErr);
          });
          return localValue;
        }
      } catch (localErr) {
        console.warn(`[nativeStorage] Error reading localStorage fallback for ${name}:`, localErr);
      }
    } catch (prefErr) {
      console.error(`[nativeStorage] Preferences.get failed for ${name}:`, prefErr);
      // Fallback to localStorage if native bridge fails
      try {
        return localStorage.getItem(name);
      } catch {
        return null;
      }
    }

    return null;
  },

  setItem: async (name: string, value: string): Promise<void> => {
    if (typeof window === 'undefined') return;

    const sanitizedValue = sanitizePayload(value);

    // 1. Immediate memory cache update
    memoryCache.set(name, sanitizedValue);

    // 2. Synchronous write to localStorage as immediate mirror
    try {
      localStorage.setItem(name, sanitizedValue);
    } catch {
      // Ignore localStorage QuotaExceededError — native Preferences handles it!
    }

    // 3. Immediate native write to iOS NSUserDefaults (Preferences)
    try {
      await Preferences.set({ key: name, value: sanitizedValue });
    } catch (err) {
      console.error(`[nativeStorage] Failed to write ${name} to Preferences:`, err);
    }
  },

  removeItem: async (name: string): Promise<void> => {
    if (typeof window === 'undefined') return;

    memoryCache.delete(name);

    try {
      localStorage.removeItem(name);
    } catch {}

    try {
      await Preferences.remove({ key: name });
    } catch (err) {
      console.error(`[nativeStorage] Failed to remove ${name} from Preferences:`, err);
    }
  },
};

/**
 * Synchronous read helper from memory cache if already populated.
 */
export function getCachedStoreValue(name: string): string | null {
  if (typeof window === 'undefined') return null;
  return memoryCache.get(name) || (typeof localStorage !== 'undefined' ? localStorage.getItem(name) : null);
}

/**
 * Export all HUBos persistent keys for backup / restore.
 */
export async function exportAllHubosData(): Promise<Record<string, any>> {
  const keys = ['hubos_main_v1', 'hubos_recomp_v1', 'hubos_subs_v1', 'hubos_schedule_store_v1'];
  const backup: Record<string, any> = {};

  for (const key of keys) {
    const raw = await nativeStorage.getItem(key);
    if (raw) {
      try {
        backup[key] = JSON.parse(raw);
      } catch {
        backup[key] = raw;
      }
    }
  }

  return backup;
}

/**
 * Import and restore all HUBos persistent keys from a backup object.
 */
export async function importAllHubosData(backupData: Record<string, any>): Promise<void> {
  for (const [key, val] of Object.entries(backupData)) {
    const serialized = typeof val === 'string' ? val : JSON.stringify(val);
    await nativeStorage.setItem(key, serialized);
  }
}
