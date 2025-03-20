import crypto from "crypto"

// Constants for encryption
const ALGORITHM = "aes-256-gcm"
const KEY_LENGTH = 32 // 256 bits
const IV_LENGTH = 16
const TAG_LENGTH = 16

// Environment variable for encryption key or a fallback
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default-encryption-key-min-32-chars-long"

/**
 * Encrypts data using AES-256-GCM
 * @param text The plaintext to encrypt
 * @returns Object containing encrypted data, iv, and auth tag
 */
export function encrypt(text: string): {
  encryptedData: string
  iv: string
  tag: string
} {
  try {
    // Generate a random initialization vector
    const iv = crypto.randomBytes(IV_LENGTH)

    // Create cipher using the encryption key and iv
    const cipher = crypto.createCipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY.padEnd(KEY_LENGTH).slice(0, KEY_LENGTH)),
      iv,
    )

    // Encrypt the data
    let encrypted = cipher.update(text, "utf8", "base64")
    encrypted += cipher.final("base64")

    // Get the auth tag
    const tag = cipher.getAuthTag()

    return {
      encryptedData: encrypted,
      iv: iv.toString("base64"),
      tag: tag.toString("base64"),
    }
  } catch (error) {
    console.error("Encryption error:", error)
    throw new Error("Failed to encrypt API key")
  }
}

/**
 * Decrypts data using AES-256-GCM
 * @param encryptedData The encrypted data in base64
 * @param iv The initialization vector in base64
 * @param tag The auth tag in base64
 * @returns The decrypted plaintext
 */
export function decrypt(encryptedData: string, iv: string, tag: string): string {
  try {
    // Convert base64 strings back to buffers
    const encryptedBuffer = Buffer.from(encryptedData, "base64")
    const ivBuffer = Buffer.from(iv, "base64")
    const tagBuffer = Buffer.from(tag, "base64")

    // Create decipher
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      Buffer.from(ENCRYPTION_KEY.padEnd(KEY_LENGTH).slice(0, KEY_LENGTH)),
      ivBuffer,
    )

    // Set auth tag
    decipher.setAuthTag(tagBuffer)

    // Decrypt the data
    let decrypted = decipher.update(encryptedBuffer, undefined, "utf8")
    decrypted += decipher.final("utf8")

    return decrypted
  } catch (error) {
    console.error("Decryption error:", error)
    throw new Error("Failed to decrypt API key")
  }
}

