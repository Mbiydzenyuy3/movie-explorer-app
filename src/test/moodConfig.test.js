import { describe, it, expect } from "vitest";
import {
  moodConfig,
  timeOptions,
  energyLevels,
  getMoodFromEnergy,
  filterByMood
} from "../lib/moodConfig";

describe("Mood Configuration", () => {
  describe("moodConfig", () => {
    it("should have all required moods", () => {
      const expectedMoods = [
        "energetic",
        "relaxed",
        "tense",
        "adventurous",
        "nostalgic",
        "curious",
        "romantic",
        "dark"
      ];
      expectedMoods.forEach((mood) => {
        expect(moodConfig[mood]).toBeDefined();
        expect(moodConfig[mood].label).toBeDefined();
        expect(moodConfig[mood].genres).toBeInstanceOf(Array);
      });
    });

    it("should have correct color for each mood", () => {
      Object.values(moodConfig).forEach((config) => {
        expect(config.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
  });

  describe("timeOptions", () => {
    it("should have all time options", () => {
      expect(timeOptions.length).toBe(6);
      expect(timeOptions.find((t) => t.value === 0)?.label).toBe("Any length");
      expect(timeOptions.find((t) => t.value === 60)?.label).toBe("1 hour");
    });
  });

  describe("energyLevels", () => {
    it("should have low, medium, high levels", () => {
      const values = energyLevels.map((e) => e.value);
      expect(values).toContain("low");
      expect(values).toContain("medium");
      expect(values).toContain("high");
    });
  });

  describe("getMoodFromEnergy", () => {
    it("should map low energy to relaxed", () => {
      expect(getMoodFromEnergy("low")).toBe("relaxed");
    });

    it("should map medium energy to curious", () => {
      expect(getMoodFromEnergy("medium")).toBe("curious");
    });

    it("should map high energy to energetic", () => {
      expect(getMoodFromEnergy("high")).toBe("energetic");
    });

    it("should default to relaxed for unknown energy", () => {
      expect(getMoodFromEnergy("unknown")).toBe("relaxed");
    });
  });

  describe("filterByMood", () => {
    const mockMovies = [
      { id: 1, genre_ids: [28, 12], runtime: 120 }, // Action/Adventure
      { id: 2, genre_ids: [35, 10749], runtime: 90 }, // Comedy/Romance
      { id: 3, genre_ids: [27, 53], runtime: 100 } // Horror/Thriller
    ];

    it("should return all movies when no mood specified", () => {
      const result = filterByMood(mockMovies, null, 0);
      expect(result.length).toBe(3);
    });

    it("should filter by mood genres", () => {
      const result = filterByMood(mockMovies, "energetic", 0);
      // energetic matches Action (28) genre
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result.some((m) => m.id === 1)).toBe(true);
    });

    it("should filter by max runtime", () => {
      const result = filterByMood(mockMovies, "relaxed", 95);
      // relaxed matches Comedy/Romance, 90 <= 95
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it("should apply time multiplier correctly", () => {
      const shortMovies = [
        { id: 1, genre_ids: [35], runtime: 55 },
        { id: 2, genre_ids: [35], runtime: 65 }
      ];
      // relaxed has timeMultiplier 1.2, so 60 * 1.2 = 72
      const result = filterByMood(shortMovies, "relaxed", 60);
      // Both should pass since 72 >= both 55 and 65
      expect(result.length).toBe(2);
    });
  });
});
