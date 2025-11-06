import { TranslateVoiceResInterface } from "@/api/interfaces/translate-voice-interface";

const DB_NAME = "VoiceTranslateDB";
const DB_VERSION = 1;
const STORE_NAME = "history";
const MAX_HISTORY_ITEMS = 50;

// IndexedDB instance
let dbInstance: IDBDatabase | null = null;

// Initialize IndexedDB
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("IndexedDB error:", request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        // Create index on timestamp for sorting
        objectStore.createIndex("timestamp", "timestamp", { unique: false });
      }
    };
  });
};

export interface HistoryItem {
  id: string;
  message: string;
  audioInfo: {
    fileName: string;
    fileSize: number;
    fileSizeFormatted: string;
    mimeType: string;
    url: string;
  };
  aiResponse: {
    pinyin: string;
    china: string;
    vietnamese: string;
  };
  model: string;
  timestamp: string;
  hasAudioFile: boolean;
}

// Helper function để normalize Unicode strings (NFC normalization)
const normalizeText = (text: string): string => {
  try {
    // Normalize Unicode để đảm bảo consistency
    return text.normalize("NFC");
  } catch {
    return text;
  }
};

// Helper function để clean và normalize object
const normalizeHistoryItem = (
  item: TranslateVoiceResInterface
): HistoryItem => {
  // aiResponse should always be defined here due to validation in saveToHistory
  if (!item.aiResponse) {
    throw new Error("Cannot normalize item without valid aiResponse");
  }

  return {
    id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    message: item.message,
    audioInfo: {
      ...item.audioInfo,
      fileName: normalizeText(item.audioInfo.fileName),
    },
    aiResponse: {
      china: normalizeText(item.aiResponse.china),
      pinyin: normalizeText(item.aiResponse.pinyin),
      vietnamese: normalizeText(item.aiResponse.vietnamese),
    },
    model: item.model || "",
    timestamp: item.timestamp,
    hasAudioFile: item.hasAudioFile,
  };
};

export const saveToHistory = async (
  data: TranslateVoiceResInterface
): Promise<void> => {
  try {
    // Kiểm tra xem có aiResponse hợp lệ không trước khi lưu
    if (
      !data.aiResponse ||
      !data.aiResponse.china ||
      !data.aiResponse.pinyin ||
      !data.aiResponse.vietnamese
    ) {
      console.warn("Skipping save to history: Invalid or missing aiResponse");
      return;
    }

    const db = await initDB();

    // Normalize dữ liệu trước khi lưu
    const newItem = normalizeHistoryItem(data);

    // Get all current items
    const history = await getHistory();

    // Add new item
    const updatedHistory = [newItem, ...history];

    // Limit items
    const limitedHistory = updatedHistory.slice(0, MAX_HISTORY_ITEMS);

    // Clear and save all items
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const objectStore = transaction.objectStore(STORE_NAME);

    // Clear all existing items
    await new Promise<void>((resolve, reject) => {
      const clearRequest = objectStore.clear();
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    });

    // Add all limited items
    for (const item of limitedHistory) {
      await new Promise<void>((resolve, reject) => {
        const addRequest = objectStore.add(item);
        addRequest.onsuccess = () => resolve();
        addRequest.onerror = () => reject(addRequest.error);
      });
    }

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error("Error saving to history:", error);
  }
};

export const getHistory = async (): Promise<HistoryItem[]> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const objectStore = transaction.objectStore(STORE_NAME);
    const index = objectStore.index("timestamp");

    return new Promise((resolve, reject) => {
      const request = index.openCursor(null, "prev"); // Sort by timestamp descending
      const items: HistoryItem[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const item = cursor.value as HistoryItem;
          // Normalize text when reading
          items.push({
            ...item,
            audioInfo: {
              ...item.audioInfo,
              fileName: normalizeText(item.audioInfo.fileName),
            },
            aiResponse: {
              china: normalizeText(item.aiResponse.china),
              pinyin: normalizeText(item.aiResponse.pinyin),
              vietnamese: normalizeText(item.aiResponse.vietnamese),
            },
          });
          cursor.continue();
        } else {
          resolve(items);
        }
      };

      request.onerror = () => {
        console.error("Error reading history:", request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error("Error reading history:", error);
    return [];
  }
};

export const clearHistory = async (): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const objectStore = transaction.objectStore(STORE_NAME);

    await new Promise<void>((resolve, reject) => {
      const request = objectStore.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error clearing history:", error);
  }
};

export const deleteHistoryItem = async (id: string): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const objectStore = transaction.objectStore(STORE_NAME);

    await new Promise<void>((resolve, reject) => {
      const request = objectStore.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error("Error deleting history item:", error);
  }
};

// Helper function to detect IndexedDB quota
const detectIndexedDBQuota = async (): Promise<number> => {
  try {
    // Use StorageManager API if available (modern browsers)
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      if (estimate.quota) {
        return estimate.quota;
      }
    }

    // Fallback: return 0 if can't detect
    console.warn("Could not detect IndexedDB quota");
    return 0;
  } catch (error) {
    console.error("Error detecting IndexedDB quota:", error);
    return 0;
  }
};

// Helper function to calculate IndexedDB usage
const calculateIndexedDBUsage = async (): Promise<number> => {
  try {
    // Use StorageManager API if available
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      if (estimate.usage) {
        return estimate.usage;
      }
    }

    // Fallback: try to calculate manually
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const objectStore = transaction.objectStore(STORE_NAME);

    return new Promise((resolve) => {
      const request = objectStore.getAll();
      request.onsuccess = () => {
        const items = request.result;
        // Rough estimate: stringify and calculate size
        const jsonString = JSON.stringify(items);
        // Each char is 2 bytes in UTF-16
        resolve(jsonString.length * 2);
      };
      request.onerror = () => {
        console.error("Error calculating usage:", request.error);
        resolve(0);
      };
    });
  } catch (error) {
    console.error("Error calculating IndexedDB usage:", error);
    return 0;
  }
};

// Cache the quota to avoid repeated detection
let cachedQuota: number | null = null;
let quotaDetectionPromise: Promise<number> | null = null;

// Initialize quota detection in background
export const initializeQuotaDetection = async (): Promise<void> => {
  if (cachedQuota === null && quotaDetectionPromise === null) {
    quotaDetectionPromise = detectIndexedDBQuota();
    cachedQuota = await quotaDetectionPromise;
    quotaDetectionPromise = null;
  }
};

// Helper function to format bytes
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Function to calculate storage usage (async)
export const getStorageUsage = async (): Promise<{
  used: number;
  total: number;
  percentage: number;
  usedFormatted: string;
  totalFormatted: string;
} | null> => {
  try {
    // Return null if quota is not yet calculated
    if (cachedQuota === null) {
      return null;
    }

    // Return null if quota detection failed (returned 0)
    if (cachedQuota === 0) {
      console.warn("Storage quota is 0 - detection failed");
      return null;
    }

    const TOTAL_STORAGE = cachedQuota;
    const totalUsed = await calculateIndexedDBUsage();

    const percentage = (totalUsed / TOTAL_STORAGE) * 100;

    return {
      used: totalUsed,
      total: TOTAL_STORAGE,
      percentage: Math.min(percentage, 100),
      usedFormatted: formatBytes(totalUsed),
      totalFormatted: formatBytes(TOTAL_STORAGE),
    };
  } catch (error) {
    console.error("Error calculating storage usage:", error);
    return null;
  }
};
