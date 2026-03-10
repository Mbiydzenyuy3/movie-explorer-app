import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback
} from "react";
import PropTypes from "prop-types";

const AuthContext = createContext(null);

// Token storage keys
const TOKEN_KEY = "streamx_auth_token";
const REFRESH_TOKEN_KEY = "streamx_refresh_token";
const USER_KEY = "streamx_user";

// Token expiry time (15 minutes) - used for auto-logout logic
// eslint-disable-next-line no-unused-vars
const ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000;

/**
 * JWT Token utilities
 */
const tokenUtils = {
  /**
   * Decode JWT token without verification (for client-side use)
   */
  decode: (token) => {
    try {
      const payload = token.split(".")[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  },

  /**
   * Check if token is expired
   */
  isExpired: (token) => {
    const payload = tokenUtils.decode(token);
    if (!payload || !payload.exp) return true;
    return Date.now() >= payload.exp * 1000;
  },

  /**
   * Get token expiry time
   */
  getExpiryTime: (token) => {
    const payload = tokenUtils.decode(token);
    if (!payload || !payload.exp) return 0;
    return payload.exp * 1000;
  }
};

/**
 * Mock user data (replace with real auth in production)
 */
const mockUsers = [
  {
    id: 1,
    email: "demo@streamx.com",
    password: "demo123",
    name: "Demo User",
    plan: "free"
  },
  {
    id: 2,
    email: "pro@streamx.com",
    password: "pro123",
    name: "Pro User",
    plan: "pro"
  }
];

/**
 * Auth Provider Component
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (storedToken && storedUser && !tokenUtils.isExpired(storedToken)) {
          setUser(JSON.parse(storedUser));
        } else {
          // Clear invalid tokens
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Generate mock JWT token
   */
  const generateToken = (userData, expiryMinutes = 15) => {
    const header = { alg: "HS256", typ: "JWT" };
    const payload = {
      sub: userData.id,
      email: userData.email,
      name: userData.name,
      plan: userData.plan,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + expiryMinutes * 60
    };

    // Simple base64 encoding (use real JWT library in production)
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = btoa("mock_signature");

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  };

  /**
   * Login function
   */
  const login = useCallback(async (email, password) => {
    setError(null);
    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Find user (mock authentication)
      const foundUser = mockUsers.find(
        (u) => u.email === email && u.password === password
      );

      if (!foundUser) {
        throw new Error("Invalid email or password");
      }

      // Generate tokens
      const accessToken = generateToken(foundUser, 15);
      const refreshToken = generateToken(foundUser, 60 * 24 * 7); // 7 days

      // Store tokens
      localStorage.setItem(TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(foundUser));

      setUser(foundUser);
      return { success: true, user: foundUser };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout function
   */
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  /**
   * Register function
   */
  const register = useCallback(async (email, password, name) => {
    setError(null);
    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Check if user exists
      const exists = mockUsers.some((u) => u.email === email);
      if (exists) {
        throw new Error("User already exists");
      }

      // Create new user (mock)
      const newUser = {
        id: mockUsers.length + 1,
        email,
        name,
        plan: "free"
      };

      // Generate tokens
      const accessToken = generateToken(newUser, 15);
      const refreshToken = generateToken(newUser, 60 * 24 * 7);

      // Store tokens
      localStorage.setItem(TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      localStorage.setItem(USER_KEY, JSON.stringify(newUser));

      setUser(newUser);
      return { success: true, user: newUser };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Check if user has pro plan
   */
  const isPro = user?.plan === "pro";

  /**
   * Get current access token
   */
  const getToken = () => localStorage.getItem(TOKEN_KEY);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    isPro,
    error,
    login,
    logout,
    register,
    getToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

/**
 * Hook to use auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
