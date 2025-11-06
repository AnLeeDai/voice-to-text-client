import { TranslateVoiceResInterface } from "@/api/interfaces/translate-voice-interface";

const HISTORY_KEY = "voice_translate_history";
const MAX_HISTORY_ITEMS = 50;

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

export const saveToHistory = (data: TranslateVoiceResInterface): void => {
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

    const history = getHistory();

    // Normalize dữ liệu trước khi lưu
    const newItem = normalizeHistoryItem(data);

    // Thêm item mới vào đầu mảng
    const updatedHistory = [newItem, ...history];

    // Giới hạn số lượng items
    const limitedHistory = updatedHistory.slice(0, MAX_HISTORY_ITEMS);

    // Stringify với replacer để xử lý đúng Unicode
    const jsonString = JSON.stringify(limitedHistory, null, 0);

    localStorage.setItem(HISTORY_KEY, jsonString);
  } catch (error) {
    console.error("Error saving to history:", error);

    // Thử xóa localStorage nếu bị lỗi và thử lại
    try {
      localStorage.removeItem(HISTORY_KEY);
      const newItem = normalizeHistoryItem(data);
      localStorage.setItem(HISTORY_KEY, JSON.stringify([newItem]));
    } catch (retryError) {
      console.error("Retry failed:", retryError);
    }
  }
};

export const getHistory = (): HistoryItem[] => {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];

    const history = JSON.parse(stored);

    // Validate data structure
    if (!Array.isArray(history)) {
      console.warn("Invalid history format, clearing...");
      localStorage.removeItem(HISTORY_KEY);
      return [];
    }

    // Validate và normalize each item
    const validHistory = history
      .filter((item: unknown): item is HistoryItem => {
        if (!item || typeof item !== "object") return false;
        const obj = item as Record<string, unknown>;
        return !!(
          obj.id &&
          obj.aiResponse &&
          typeof obj.aiResponse === "object" &&
          obj.aiResponse !== null &&
          (obj.aiResponse as Record<string, unknown>).china &&
          (obj.aiResponse as Record<string, unknown>).pinyin &&
          (obj.aiResponse as Record<string, unknown>).vietnamese
        );
      })
      .map((item: HistoryItem) => {
        // Normalize text khi đọc ra
        return {
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
        };
      });

    // If some items were invalid, save the cleaned version
    if (validHistory.length !== history.length) {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(validHistory));
    }

    return validHistory;
  } catch (error) {
    console.error("Error reading history:", error);
    // Clear corrupted data
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch (e) {
      console.error("Failed to clear corrupted history:", e);
    }
    return [];
  }
};

export const clearHistory = (): void => {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error("Error clearing history:", error);
  }
};

export const deleteHistoryItem = (id: string): void => {
  try {
    const history = getHistory();
    const updatedHistory = history.filter((item) => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Error deleting history item:", error);
  }
};

// Helper function to detect actual localStorage quota (async to avoid blocking)
const detectLocalStorageQuota = async (): Promise<number> => {
  return new Promise((resolve) => {
    // Use setTimeout to make it non-blocking
    setTimeout(() => {
      try {
        const testKey = "__storage_test__";
        let detectedQuota = 0;

        // Try different chunk sizes to find the actual limit
        const testSizes = [
          100 * 1024, // 100KB
          500 * 1024, // 500KB
          1024 * 1024, // 1MB
          2 * 1024 * 1024, // 2MB
          5 * 1024 * 1024, // 5MB
          10 * 1024 * 1024, // 10MB
          20 * 1024 * 1024, // 20MB
        ];

        // Find the maximum size we can store
        for (const size of testSizes) {
          try {
            // Create test data (each char is 2 bytes in UTF-16)
            const testData = "a".repeat(size / 2);
            localStorage.setItem(testKey, testData);
            localStorage.removeItem(testKey);
            detectedQuota = size;
          } catch {
            // Can't store this size, so the quota is between previous and this
            break;
          }
        }

        // If we detected something, use binary search for precision
        if (detectedQuota > 0) {
          let low = detectedQuota;
          let high = detectedQuota * 2;
          let quota = detectedQuota;

          while (high - low > 1024) {
            // Stop when range is < 1KB
            const mid = Math.floor((low + high) / 2);
            try {
              const testData = "a".repeat(mid / 2);
              localStorage.setItem(testKey, testData);
              localStorage.removeItem(testKey);
              low = mid;
              quota = mid;
            } catch {
              high = mid;
            }
          }

          resolve(quota);
        } else {
          // Could not detect any quota - return 0
          console.warn("Could not detect localStorage quota");
          resolve(0);
        }
      } catch (error) {
        // If detection completely fails, return 0
        console.error("Error detecting localStorage quota:", error);
        resolve(0);
      }
    }, 0);
  });
};

// Cache the quota to avoid repeated detection
let cachedQuota: number | null = null;
let quotaDetectionPromise: Promise<number> | null = null;

// Initialize quota detection in background
export const initializeQuotaDetection = async (): Promise<void> => {
  if (cachedQuota === null && quotaDetectionPromise === null) {
    quotaDetectionPromise = detectLocalStorageQuota();
    cachedQuota = await quotaDetectionPromise;
    quotaDetectionPromise = null;
  }
};

// Helper function to format bytes
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Function to calculate localStorage usage (sync, returns null if quota not ready)
export const getLocalStorageUsage = (): {
  used: number;
  total: number;
  percentage: number;
  usedFormatted: string;
  totalFormatted: string;
} | null => {
  try {
    // Return null if quota is not yet calculated
    if (cachedQuota === null) {
      return null;
    }

    // Return null if quota detection failed (returned 0)
    if (cachedQuota === 0) {
      console.warn("localStorage quota is 0 - detection failed");
      return null;
    }

    const TOTAL_STORAGE = cachedQuota;

    let totalUsed = 0;

    // Calculate total size of all items in localStorage
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        const item = localStorage.getItem(key) || "";
        // Each character in JavaScript string is 2 bytes (UTF-16)
        totalUsed += key.length * 2 + item.length * 2;
      }
    }

    const percentage = (totalUsed / TOTAL_STORAGE) * 100;

    return {
      used: totalUsed,
      total: TOTAL_STORAGE,
      percentage: Math.min(percentage, 100),
      usedFormatted: formatBytes(totalUsed),
      totalFormatted: formatBytes(TOTAL_STORAGE),
    };
  } catch (error) {
    console.error("Error calculating localStorage usage:", error);
    return null;
  }
};
