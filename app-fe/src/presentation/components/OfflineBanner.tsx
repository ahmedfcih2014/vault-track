import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { cn } from "@/presentation/lib/utils";

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-2",
        "bg-amber-950 px-4 py-2 text-sm text-amber-100",
        "pt-[max(0.5rem,env(safe-area-inset-top))]",
      )}
      role="status"
    >
      <WifiOff className="h-4 w-4" aria-hidden />
      <span>Offline — your data is saved locally</span>
    </div>
  );
}
