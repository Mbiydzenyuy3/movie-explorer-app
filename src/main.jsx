import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./style/index.css";
import "./style/accessibility.css";
import App from "./App.jsx";

// ClerkProvider now lives in AppProviders, which is a lazily loaded chunk, so
// that /early-access does not download an authentication SDK it never uses.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
