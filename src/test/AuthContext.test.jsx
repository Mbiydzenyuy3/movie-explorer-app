import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

// AuthContext is a thin adapter over Clerk, so Clerk's hooks are the seam we mock.
const mockUseUser = vi.fn();
const mockSignOut = vi.fn();
const mockGetToken = vi.fn();

vi.mock("@clerk/clerk-react", () => ({
  useUser: () => mockUseUser(),
  useAuth: () => ({ getToken: mockGetToken, signOut: mockSignOut })
}));

const { AuthProvider } = await import("../context/AuthContext");
const { useAuth } = await import("../hooks/useAuth");

const clerkUser = (overrides = {}) => ({
  id: "user_123",
  primaryEmailAddress: { emailAddress: "sarah@example.com" },
  fullName: "Sarah A",
  username: "sarah",
  imageUrl: "https://img.clerk.com/sarah.png",
  publicMetadata: {},
  ...overrides
});

describe("Auth Context", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reports loading until Clerk has loaded", () => {
    mockUseUser.mockReturnValue({ isLoaded: false, isSignedIn: false, user: null });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    expect(result.current.isLoading).toBe(true);
  });

  it("provides an unauthenticated state when nobody is signed in", () => {
    mockUseUser.mockReturnValue({ isLoaded: true, isSignedIn: false, user: null });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.isPro).toBe(false);
  });

  it("maps a Clerk user onto the app's user shape", () => {
    mockUseUser.mockReturnValue({ isLoaded: true, isSignedIn: true, user: clerkUser() });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual({
      id: "user_123",
      email: "sarah@example.com",
      name: "Sarah A",
      imageUrl: "https://img.clerk.com/sarah.png",
      plan: "free"
    });
  });

  it("falls back to username when the user has no full name", () => {
    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: clerkUser({ fullName: null })
    });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    expect(result.current.user.name).toBe("sarah");
  });

  it("derives isPro from Clerk public metadata", () => {
    mockUseUser.mockReturnValue({
      isLoaded: true,
      isSignedIn: true,
      user: clerkUser({ publicMetadata: { plan: "pro" } })
    });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    expect(result.current.user.plan).toBe("pro");
    expect(result.current.isPro).toBe(true);
  });

  it("delegates logout to Clerk", () => {
    mockUseUser.mockReturnValue({ isLoaded: true, isSignedIn: true, user: clerkUser() });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    result.current.logout();

    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it("exposes Clerk's getToken for authenticated Supabase calls", () => {
    mockUseUser.mockReturnValue({ isLoaded: true, isSignedIn: true, user: clerkUser() });

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    expect(result.current.getToken).toBe(mockGetToken);
  });

  it("throws when useAuth is used outside the provider", () => {
    mockUseUser.mockReturnValue({ isLoaded: true, isSignedIn: false, user: null });
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => renderHook(() => useAuth())).toThrow(
      "useAuth must be used within an AuthProvider"
    );

    consoleError.mockRestore();
  });
});
