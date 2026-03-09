import { describe, it, expect, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../context/AuthContext";

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    })
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("Auth Context", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("should provide initial unauthenticated state", async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("should login with valid credentials", async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      const response = await result.current.login(
        "demo@streamx.com",
        "demo123"
      );
      expect(response.success).toBe(true);
      expect(response.user).toBeDefined();
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeDefined();
  });

  it("should fail login with invalid credentials", async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    let response;
    await act(async () => {
      response = await result.current.login("invalid@test.com", "wrong");
    });

    expect(response.success).toBe(false);
    expect(response.error).toBe("Invalid email or password");
  });

  it("should logout successfully", async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // First login
    await act(async () => {
      await result.current.login("demo@streamx.com", "demo123");
    });

    expect(result.current.isAuthenticated).toBe(true);

    // Then logout
    await act(async () => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("should check isPro status correctly", async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Login as free user
    await act(async () => {
      await result.current.login("demo@streamx.com", "demo123");
    });

    expect(result.current.isPro).toBe(false);

    // Logout
    await act(() => {
      result.current.logout();
    });

    // Login as pro user
    await act(async () => {
      await result.current.login("pro@streamx.com", "pro123");
    });

    expect(result.current.isPro).toBe(true);
  });

  it("should throw error when useAuth is used outside provider", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow("useAuth must be used within an AuthProvider");

    consoleError.mockRestore();
  });
});
