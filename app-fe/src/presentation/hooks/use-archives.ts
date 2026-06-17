import { useCallback, useEffect, useState } from "react";
import { appContainer } from "@/app/container";
import type { ArchiveMeta, SpendingIncome } from "@vault-track/shared";

export function useArchives() {
  const [archives, setArchives] = useState<ArchiveMeta[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadArchives = useCallback(async () => {
    setError(null);
    try {
      const list = await appContainer.archiveService.list();
      setArchives(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load archives");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function fetchArchives() {
      setError(null);
      try {
        const list = await appContainer.archiveService.list();
        if (!cancelled) {
          setArchives(list);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load archives");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void fetchArchives();

    return () => {
      cancelled = true;
    };
  }, []);

  const getArchive = useCallback(async (id: string): Promise<SpendingIncome> => {
    return appContainer.archiveService.get(id);
  }, []);

  const exportArchive = useCallback(async (id: string) => {
    await appContainer.archiveService.exportToFile(id);
  }, []);

  return {
    archives,
    isLoading,
    error,
    reload: loadArchives,
    getArchive,
    exportArchive,
  };
}
