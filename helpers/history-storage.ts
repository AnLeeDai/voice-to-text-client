import { TranslateVoiceResInterface } from "@/api/interfaces/translate-voice-interface";

const HISTORY_KEY = "voice_translate_history";
const MAX_HISTORY_ITEMS = 50;

export interface HistoryItem extends TranslateVoiceResInterface {
  id: string;
}

export const saveToHistory = (data: TranslateVoiceResInterface): void => {
  try {
    const history = getHistory();
    const newItem: HistoryItem = {
      ...data,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    // Thêm item mới vào đầu mảng
    const updatedHistory = [newItem, ...history];

    // Giới hạn số lượng items
    const limitedHistory = updatedHistory.slice(0, MAX_HISTORY_ITEMS);

    localStorage.setItem(HISTORY_KEY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error("Error saving to history:", error);
  }
};

export const getHistory = (): HistoryItem[] => {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];

    const history = JSON.parse(stored);
    return Array.isArray(history) ? history : [];
  } catch (error) {
    console.error("Error reading history:", error);
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
