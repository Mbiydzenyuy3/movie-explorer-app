import { createContext, useContext } from "react";
import PropTypes from "prop-types";
import { useUser, useAuth as useClerkAuth } from "@clerk/clerk-react";

const AuthContext = createContext(null);

/**
 * Auth Provider Component - Powered by Clerk
 */
export const AuthProvider = ({ children }) => {
  const { isLoaded, isSignedIn, user } = useUser();
  const { getToken, signOut } = useClerkAuth();

  // Map Clerk user to our existing user interface
  const mappedUser = user ? {
    id: user.id,
    email: user.primaryEmailAddress?.emailAddress,
    name: user.fullName || user.username || "User",
    imageUrl: user.imageUrl,
    // Plan can be derived from metadata if pro/free tier is implemented in Clerk
    plan: user.publicMetadata?.plan || "free"
  } : null;

  /**
   * Check if user has pro plan
   */
  const isPro = mappedUser?.plan === "pro";

  const value = {
    user: mappedUser,
    isLoading: !isLoaded,
    isAuthenticated: !!isSignedIn,
    isPro,
    error: null,
    logout: signOut,
    getToken // Clerk's getToken for Supabase/API calls
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
