import { useEffect, useState } from "react";
import { Button } from "@/presentation/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferredPrompt || dismissed) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-24 z-50 rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-xl">
      <p className="text-sm font-medium text-slate-100">Install Vault Track</p>
      <p className="mt-1 text-xs text-slate-400">
        Add to your home screen for quick offline access.
      </p>
      <div className="mt-3 flex gap-2">
        <Button
          className="flex-1"
          onClick={async () => {
            await deferredPrompt.prompt();
            setDismissed(true);
          }}
        >
          Install
        </Button>
        <Button variant="ghost" onClick={() => setDismissed(true)}>
          Not now
        </Button>
      </div>
    </div>
  );
}
