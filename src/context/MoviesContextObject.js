import { createContext } from "react";

/**
 * Shared movie context. Kept in its own module so movieContext.jsx exports only
 * a component, which is what Vite's Fast Refresh needs to preserve state.
 */
export const MoviesContext = createContext();

export default MoviesContext;
