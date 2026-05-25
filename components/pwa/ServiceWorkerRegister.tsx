"use client";

import { useEffect } from "react";

/**
 * Registers the OHMS service worker (/sw.js) once the window has loaded.
 * Renders nothing. Safe to mount anywhere in the tree (e.g. root layout).
 *
 * Guards for service worker support; registration failures are logged but
 * never thrown so they can't break rendering.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch((error) => {
          console.error("[OHMS] service worker registration failed:", error);
        });
    };

    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
