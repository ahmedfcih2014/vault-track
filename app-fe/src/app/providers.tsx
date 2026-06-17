import { useCallback, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { DexieAppBootstrap } from "@/infrastructure/bootstrap/dexie-app-bootstrap";
import { subscribeToDataChanges } from "@/infrastructure/sync/broadcast-sync";
import { DOMAIN_ERROR_CODES, DomainError } from "@/domain/errors";
import { CorruptDataRecovery } from "@/presentation/components/CorruptDataRecovery";
import { useAppStore } from "@/presentation/hooks/use-app-store";

const bootstrap = new DexieAppBootstrap();

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const isBootstrapped = useAppStore((state) => state.isBootstrapped);
  const isBootstrapping = useAppStore((state) => state.isBootstrapping);
  const bootstrapError = useAppStore((state) => state.bootstrapError);
  const isCorruptData = useAppStore((state) => state.isCorruptData);
  const setBootstrapping = useAppStore((state) => state.setBootstrapping);
  const setBootstrapError = useAppStore((state) => state.setBootstrapError);
  const setSnapshot = useAppStore((state) => state.setSnapshot);
  const setCorruptData = useAppStore((state) => state.setCorruptData);
  const initialLoadDone = useRef(false);

  const refreshSnapshot = useCallback(async () => {
    const snapshot = await bootstrap.getSnapshot();
    setSnapshot(snapshot);
  }, [setSnapshot]);

  useEffect(() => {
    let cancelled = false;

    async function runBootstrap() {
      if (initialLoadDone.current) {
        return;
      }

      setBootstrapping(true);
      setBootstrapError(null);
      setCorruptData(false);

      try {
        await bootstrap.ensureSeeded();
        const snapshot = await bootstrap.getSnapshot();
        if (!cancelled) {
          setSnapshot(snapshot);
          initialLoadDone.current = true;
        }
      } catch (error) {
        if (!cancelled) {
          if (error instanceof DomainError && error.code === DOMAIN_ERROR_CODES.CORRUPT_DATA) {
            setCorruptData(true, error.message);
          } else {
            const message =
              error instanceof Error ? error.message : "Failed to initialize app data";
            setBootstrapError(message);
          }
        }
      } finally {
        if (!cancelled) {
          setBootstrapping(false);
        }
      }
    }

    void runBootstrap();

    return () => {
      cancelled = true;
    };
  }, [setBootstrapping, setBootstrapError, setSnapshot, setCorruptData]);

  useEffect(() => {
    if (!isBootstrapped) {
      return;
    }

    return subscribeToDataChanges(() => {
      void refreshSnapshot().catch(() => {
        // Ignore transient refresh errors; user can reload manually.
      });
    });
  }, [isBootstrapped, refreshSnapshot]);

  if (isCorruptData) {
    return <CorruptDataRecovery message={bootstrapError ?? "Stored data is invalid."} />;
  }

  if (bootstrapError) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-950 px-6 text-center text-slate-100">
        <div>
          <h1 className="text-lg font-semibold">Unable to load Vault Track</h1>
          <p className="mt-2 text-sm text-slate-400">{bootstrapError}</p>
        </div>
      </div>
    );
  }

  if (!isBootstrapped || isBootstrapping) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-slate-950 text-sm text-slate-400">
        Loading Vault Track...
      </div>
    );
  }

  return <>{children}</>;
}
