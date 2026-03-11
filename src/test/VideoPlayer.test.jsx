import { describe, it, expect } from "vitest";

// Tests for encryption utilities
import {
  generateEncryptionKey,
  generateIV,
  isValidKey,
  getDRMSupport,
  getBestDRM,
  createEncryptionConfig
} from "../lib/encryption";

describe("Video Player Utilities", () => {
  describe("Encryption", () => {
    it("should generate a 16-byte encryption key", () => {
      const key = generateEncryptionKey();
      expect(key).toBeInstanceOf(Uint8Array);
      expect(key.length).toBe(16);
    });

    it("should generate a 16-byte IV", () => {
      const iv = generateIV();
      expect(iv).toBeInstanceOf(Uint8Array);
      expect(iv.length).toBe(16);
    });

    it("should validate correct key format", () => {
      // Test Uint8Array key
      const keyArray = new Uint8Array(16);
      expect(isValidKey(keyArray)).toBe(true);

      // Test hex string key (32 chars = 16 bytes)
      const hexKey = "0123456789abcdef0123456789abcdef";
      expect(isValidKey(hexKey)).toBe(true);
    });

    it("should reject invalid key format", () => {
      // Test wrong length Uint8Array
      const wrongArray = new Uint8Array(8);
      expect(isValidKey(wrongArray)).toBe(false);

      // Test invalid hex string
      expect(isValidKey("not-a-hex-string")).toBe(false);
      expect(isValidKey("abc")).toBe(false);
    });

    it("should create encryption config", () => {
      const config = createEncryptionConfig(
        "https://license.server.com",
        "cenc"
      );
      expect(config).toHaveProperty("drm", "widevine");
      expect(config).toHaveProperty("licenseUrl", "https://license.server.com");
      expect(config).toHaveProperty("keyFormat", "cenc");
      expect(config).toHaveProperty("persistentLicense", false);
    });

    it("should detect DRM support", () => {
      const support = getDRMSupport();
      expect(support).toHaveProperty("widevine");
      expect(support).toHaveProperty("fairplay");
      expect(support).toHaveProperty("playready");
      expect(support).toHaveProperty("eme");
    });

    it("should get best available DRM", () => {
      const drm = getBestDRM();
      // Should return a string or null depending on browser support
      if (drm !== null) {
        expect(["widevine", "fairplay", "playready"]).toContain(drm);
      }
    });
  });
});
