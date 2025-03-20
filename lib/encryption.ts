const ALGORITHM = "AES-GCM"
const KEY_LENGTH = 256
const SALT_LENGTH = 16
const IV_LENGTH = 12
const ITERATION_COUNT = 100000
const HASH = "SHA-256"

/**
 * Derives an encryption key from a password using PBKDF2
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  // Convert password to key material
  const encoder = new TextEncoder()
  const passwordBuffer = encoder.encode(password)

  // Import as raw key material
  const baseKey = await window.crypto.subtle.importKey("raw", passwordBuffer, { name: "PBKDF2" }, false, ["deriveKey"])

  // Derive the actual encryption key
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: ITERATION_COUNT,
      hash: HASH,
    },
    baseKey,
    { name: ALGORITHM, length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"],
  )
}

/**
 * Encrypts an API key using AES-GCM
 * Returns an object with encrypted data, salt, and IV
 */
export async function encryptApiKey(apiKey: string): Promise<{
  encryptedData: string
  salt: string
  iv: string
}> {
  // Generate random salt and IV
  const salt = window.crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  const iv = window.crypto.getRandomValues(new Uint8Array(IV_LENGTH))

  // Use a combination of user ID and a fixed secret as the password
  // In a real implementation, you might want to use a more secure method
  // such as a user-provided password or a key from a secure key management service
  const password = "secure-encryption-password" // This would be more secure in a real implementation

  // Derive encryption key
  const key = await deriveKey(password, salt)

  // Encrypt the API key
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(apiKey)

  const encryptedBuffer = await window.crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv,
    },
    key,
    dataBuffer,
  )

  // Convert binary data to base64 strings for storage
  const encryptedData = bufferToBase64(new Uint8Array(encryptedBuffer))
  const saltBase64 = bufferToBase64(salt)
  const ivBase64 = bufferToBase64(iv)

  return {
    encryptedData,
    salt: saltBase64,
    iv: ivBase64,
  }
}

/**
 * Helper function to convert Uint8Array to Base64 string
 */
function bufferToBase64(buffer: Uint8Array): string {
  const binary = Array.from(buffer)
    .map((byte) => String.fromCharCode(byte))
    .join("")

  return btoa(binary)
}

/**
 * Helper function to convert Base64 string to Uint8Array
 */
export function base64ToBuffer(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)

  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }

  return bytes
}

