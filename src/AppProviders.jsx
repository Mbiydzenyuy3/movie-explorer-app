import { Outlet } from "react-router";
import { ClerkProvider } from "@clerk/clerk-react";
import { QueryClientProvider } from "@tanstack/react-query";
import PropTypes from "prop-types";

import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./context/AuthContext";
import { MoodProvider } from "./context/MoodContext";
import { AccessibilityProvider } from "./context/AccessibilityContext";
import { DetailMovieData } from "./context/movieContext";
import { useSyncUser } from "./services/userService";
import SkipLink from "./components/SkipLink/SkipLink";

/**
 * Every provider the movie app needs, as a pathless layout route.
 *
 * This module is loaded on demand, which is the point: it is the only thing
 * that pulls in Clerk, React Query and the movie contexts. /early-access sits
 * outside it and therefore never downloads any of them — see
 * docs/decisions/0002-demand-test-thresholds.md for why the landing page's
 * weight is a measurement problem and not just a performance one.
 *
 * The Clerk key check lives here rather than in main.jsx for the same reason:
 * a missing key should not blank the landing page, which does not use Clerk.
 */
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

const UserSyncWrapper = ({ children }) => {
  useSyncUser();
  return <>{children}</>;
};

UserSyncWrapper.propTypes = {
  children: PropTypes.node
};

export default function AppProviders() {
  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl='/'>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <UserSyncWrapper>
            <MoodProvider>
              <AccessibilityProvider>
                <SkipLink />
                <DetailMovieData>
                  {/* The landing page renders its own <main>, so this one is
                      scoped to the app routes to avoid two per document. */}
                  <main id='main-content' tabIndex={-1}>
                    <Outlet />
                  </main>
                </DetailMovieData>
              </AccessibilityProvider>
            </MoodProvider>
          </UserSyncWrapper>
        </AuthProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
