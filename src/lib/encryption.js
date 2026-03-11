/**
 * Video Encryption Utilities
 *
 * Provides AES-128 encryption for video segments to prevent piracy.
 * In production, this would work with DRM systems like Widevine or FairPlay.
 */

// AES-128 encryption key size (16 bytes)
const KEY_SIZE = 16;

// IV size (16 bytes for AES)
const IV_SIZE = 16;

/**
 * Generate a random encryption key
 * @returns {Uint8Array} 16-byte random key
 */
export function generateEncryptionKey() {
  const key = new Uint8Array(KEY_SIZE);
  crypto.getRandomValues(key);
  return key;
}

/**
 * Generate a random initialization vector (IV)
 * @returns {Uint8Array} 16-byte random IV
 */
export function generateIV() {
  const iv = new Uint8Array(IV_SIZE);
  crypto.getRandomValues(iv);
  return iv;
}

/**
 * Convert ArrayBuffer to hex string
 * @param {ArrayBuffer} buffer
 * @returns {string} Hex string
 */
function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Convert hex string to Uint8Array
 * @param {string} hex
 * @returns {Uint8Array}
 */
// eslint-disable-next-line no-unused-vars
function hexToUint8Array(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Encrypt data using AES-128-CBC
 * @param {Uint8Array} data - Data to encrypt
 * @param {Uint8Array} key - 16-byte encryption key
 * @param {Uint8Array} iv - 16-byte initialization vector
 * @returns {Promise<Uint8Array>} Encrypted data
 */
export async function encryptSegment(data, key, iv) {
  try {
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key,
      { name: "AES-CBC" },
      false,
      ["encrypt"]
    );

    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-CBC", iv },
      cryptoKey,
      data
    );

    return new Uint8Array(encrypted);
  } catch (error) {
    console.error("Encryption error:", error);
    throw new Error("Failed to encrypt video segment");
  }
}

/**
 * Decrypt data using AES-128-CBC
 * @param {Uint8Array} encryptedData - Encrypted data
 * @param {Uint8Array} key - 16-byte encryption key
 * @param {Uint8Array} iv - 16-byte initialization vector
 * @returns {Promise<Uint8Array>} Decrypted data
 */
export async function decryptSegment(encryptedData, key, iv) {
  try {
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key,
      { name: "AES-CBC" },
      false,
      ["decrypt"]
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-CBC", iv },
      cryptoKey,
      encryptedData
    );

    return new Uint8Array(decrypted);
  } catch (error) {
    console.error("Decryption error:", error);
    throw new Error("Failed to decrypt video segment");
  }
}

/**
 * Generate encrypted segment URL with key rotation
 * @param {string} baseUrl - Base URL of the video segment
 * @param {string} keyId - Unique identifier for the encryption key
 * @param {Uint8Array} key - Encryption key
 * @returns {object} Object containing encrypted URL and key info
 */
export function createEncryptedSegmentUrl(baseUrl, keyId, key) {
  // In production, this would integrate with DRM licensing server
  const keyHex = bufferToHex(key);

  return {
    url: `${baseUrl}?keyId=${keyId}`,
    keyId,
    // For demo: include key info (in production, this comes from license server)
    // eslint-disable-next-line object-shorthand
    getLicense: () =>
      Promise.resolve({
        keyId,
        key: keyHex
      })
  };
}

/**
 * Validate encryption key format
 * @param {string|Uint8Array} key - Encryption key
 * @returns {boolean} True if valid
 */
export function isValidKey(key) {
  if (key instanceof Uint8Array) {
    return key.length === KEY_SIZE;
  }
  if (typeof key === "string") {
    // Hex string should be 32 characters (16 bytes * 2)
    return key.length === 32 && /^[0-9a-fA-F]+$/.test(key);
  }
  return false;
}

/**
 * Create encryption config for HLS manifest
 * @param {string} licenseUrl - DRM license server URL
 * @param {string} keyFormat - Key format (identity, cenc)
 * @returns {object} HLS encryption configuration
 */
export function createEncryptionConfig(licenseUrl, keyFormat = "cenc") {
  return {
    // DRM type (can be 'widevine', 'fairplay', 'playready')
    drm: "widevine",
    // License server URL
    licenseUrl,
    // Key format for HLS
    keyFormat,
    // Whether to use persistent licenses (for offline)
    persistentLicense: false,
    // Certificate URL for FairPlay
    certificateUrl: null
  };
}

/**
 * Detect if browser supports EME (Encrypted Media Extensions)
 * @returns {object} Support info for each DRM type
 */
export function getDRMSupport() {
  const video = document.createElement("video");

  return {
    // Widevine (Google) - supported on Chrome, Firefox, Edge
    widevine:
      video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"') &&
      typeof MediaKeySystemAccess !== "undefined",

    // FairPlay (Apple) - supported on Safari
    fairplay:
      video.canPlayType('video/mp4; codecs="avc1.42E01E"') &&
      typeof MediaKeySystemAccess !== "undefined",

    // PlayReady (Microsoft) - supported on Edge
    playready:
      video.canPlayType('video/mp4; codecs="avc1.42E01E"') &&
      typeof MediaKeySystemAccess !== "undefined",

    // Encrypted Media Extensions API
    eme: typeof MediaKeySystemAccess !== "undefined"
  };
}

/**
 * Get the best available DRM for the current browser
 * @returns {string|null} DRM type or null if none supported
 */
export function getBestDRM() {
  const support = getDRMSupport();

  if (support.fairplay) return "fairplay";
  if (support.widevine) return "widevine";
  if (support.playready) return "playready";

  return null;
}

/**
 * Generate key request for DRM license
 * @param {string} drmType - DRM type (widevine, fairplay, playready)
 * @param {ArrayBuffer} initData - Initialization data from media
 * @returns {Promise<ArrayBuffer>} Key request to send to license server
 */
export async function createKeyRequest(drmType, initData) {
  switch (drmType) {
    case "widevine":
      // Widevine uses PSSH box directly
      return initData;

    case "fairplay": {
      // FairPlay needs special handling
      // Extract certificate from initData
      const certData = new Uint8Array(initData);
      return certData;
    }

    case "playready":
      // PlayReady uses specific header format
      return initData;

    default:
      throw new Error(`Unsupported DRM type: ${drmType}`);
  }
}
