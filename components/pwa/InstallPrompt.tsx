"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, Smartphone, X } from "lucide-react";

const DISMISS_KEY = "ohms-install-dismissed";

/**
 * Minimal `beforeinstallprompt` event shape. The browser type isn't in the DOM
 * lib by default, so we describe just what we use.
 */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * Dismissible bottom banner that surfaces the browser's install prompt for the
 * OHMS PWA. Renders null until the `beforeinstallprompt` event fires, and stays
 * hidden if the user previously dismissed it (localStorage flag).
 */
export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Respect a prior dismissal.
    try {
      if (window.localStorage.getItem(DISMISS_KEY) === "1") return;
    } catch {
      // localStorage may be unavailable (private mode); fail open by ignoring.
    }

    const onBeforeInstallPrompt = (event: Event) => {
      // Stop Chrome's mini-infobar so we can show our own UI.
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    const onInstalled = () => {
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = useCallback(() => {
    setIsVisible(false);
    setDeferredPrompt(null);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Ignore storage failures; banner is already hidden for this session.
    }
  }, []);

  const install = useCallback(async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      await deferredPrompt.userChoice;
    } catch (error) {
      console.error("[OHMS] install prompt failed:", error);
    } finally {
      // The prompt can only be used once; hide regardless of outcome.
      setIsVisible(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  if (!isVisible || !deferredPrompt) return null;

  return (
    <div
      role="dialog"
      aria-label="Install OHMS"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md rounded-2xl border border-leaf-200 bg-surface p-4 shadow-lift sm:inset-x-auto sm:right-4 sm:left-auto sm:w-96"
    >
      <div className="flex items-start gap-3">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-leaf-100 text-leaf-700"
          aria-hidden="true"
        >
          <Smartphone className="h-5 w-5" strokeWidth={2} />
        </span>

        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">Install OHMS</p>
          <p className="mt-0.5 text-sm leading-snug text-muted">
            Install OHMS for a faster, app-like experience.
          </p>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={install}
              className="inline-flex items-center gap-1.5 rounded-full bg-leaf-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-leaf-700 focus-visible:outline-leaf-700"
            >
              <Download className="h-4 w-4" strokeWidth={2} />
              Install
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground"
            >
              Dismiss
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss install prompt"
          className="-mr-1 -mt-1 rounded-full p-1.5 text-muted transition-colors hover:bg-leaf-50 hover:text-foreground"
        >
          <X className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
