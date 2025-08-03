import CryptoJS from "crypto-js";

// Function to encrypt text
const encryptText = (text) => {
  // Encrypting the text using AES encryption with the encryption key from environment variables
  const encrypted = CryptoJS.AES.encrypt(text, import.meta.env.VITE_ENCRYPTION_KEY);
  // Returning the encrypted text as a string (base64 encoded)
  return encrypted.toString();
};

// Function to decrypt text
const decryptText = (encryptedText) => {
  // Decrypting the text using AES decryption and the same encryption key
  const bytes = CryptoJS.AES.decrypt(encryptedText, import.meta.env.VITE_ENCRYPTION_KEY);
  // Converting the decrypted bytes into a UTF-8 string
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return decrypted;
};

export { encryptText, decryptText };
