import CryptoJS from "crypto-js";

const SECRET_KEY = process.env.NEXT_PUBLIC_CRYPTO_SECRET || "";
const TOKEN_KEY = "smart_ticket_token";

/**
 * Mã hóa dữ liệu
 */
const encrypt = (text: string): string => {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

/**
 * Giải mã dữ liệu
 */
const decrypt = (ciphertext: string): string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

/**
 * Lưu token đã mã hóa
 */
export const setToken = (token: string): void => {
  const encryptedToken = encrypt(token);
  localStorage.setItem(TOKEN_KEY, encryptedToken);
};

/**
 * Lấy và giải mã token
 */
export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  const encryptedToken = localStorage.getItem(TOKEN_KEY);
  if (!encryptedToken) return null;
  return decrypt(encryptedToken);
};

/**
 * Kiểm tra có token hay không
 */
export const hasToken = (): boolean => {
  return !!getToken();
};

/**
 * Xóa token
 */
export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Logout - xóa token và chuyển về trang login
 */
export const logout = (): void => {
  removeToken();
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};
