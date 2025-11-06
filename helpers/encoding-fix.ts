/**
 * Fix UTF-8 encoding issues (mojibake)
 * Đây là helper để fix trường hợp server trả về string đã bị encode sai
 */

export const fixUTF8 = (str: string): string => {
  try {
    // Check if string looks like it has encoding issues
    // Ví dụ: "å¼å±æ±è¯­" thay vì "发展汉语"

    // Method 1: Decode Latin-1 to UTF-8
    // Nếu server gửi UTF-8 bytes nhưng interpret nhầm là Latin-1
    const bytes = new Uint8Array(
      str.split("").map((char) => char.charCodeAt(0) & 0xff)
    );
    const decoded = new TextDecoder("utf-8", { fatal: false }).decode(bytes);

    // Kiểm tra xem kết quả có hợp lý không
    // UTF-8 tiếng Trung thường trong range U+4E00 to U+9FFF
    const hasChineseChars = /[\u4e00-\u9fff]/.test(decoded);

    if (hasChineseChars && decoded !== str) {
      return decoded;
    }

    return str;
  } catch (error) {
    console.warn("Failed to fix encoding:", error);
    return str;
  }
};

/**
 * Recursively fix encoding trong object
 */
export const fixObjectEncoding = <T = unknown>(obj: T): T => {
  if (typeof obj === "string") {
    return fixUTF8(obj) as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(fixObjectEncoding) as T;
  }

  if (obj && typeof obj === "object" && obj !== null) {
    const fixed = { ...obj } as Record<string, unknown>;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fixed[key] = fixObjectEncoding((obj as Record<string, unknown>)[key]);
      }
    }
    return fixed as T;
  }

  return obj;
};
