import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import "./styles.css";
import { getRouter } from "./router";

const router = getRouter();

// Automatically recover from stale chunks when a new deployment is pushed to production
window.addEventListener("vite:preloadError", () => {
  window.location.reload();
});

class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Uncaught application error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", backgroundColor: "#080808", color: "#f8fafc", fontFamily: "system-ui, sans-serif", padding: "24px", textAlign: "center" }}>
          <div>
            <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>Welcome to GoCoupon</h1>
            <p style={{ marginTop: "12px", color: "#94a3b8", fontSize: "14px" }}>A new update has just been deployed. Click below to load the latest version.</p>
            <button
              onClick={() => window.location.reload()}
              style={{ marginTop: "16px", padding: "8px 16px", backgroundColor: "#2563eb", color: "#ffffff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 500 }}
            >
              Refresh App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const rootEl = document.getElementById("root");
if (rootEl) {
  const loader = document.getElementById("site-loader");
  if (loader) loader.remove();

  createRoot(rootEl).render(
    <StrictMode>
      <RootErrorBoundary>
        <RouterProvider router={router} />
      </RootErrorBoundary>
    </StrictMode>,
  );
}
