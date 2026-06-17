import { create } from 'zustand';
import type { Saving, SpendingIncome } from '@vault-track/shared';

interface AppState {
  isBootstrapped: boolean;
  isBootstrapping: boolean;
  bootstrapError: string | null;
  isCorruptData: boolean;
  saving: Saving | null;
  spendingIncome: SpendingIncome | null;
  archivesRevision: number;
  setBootstrapping: (value: boolean) => void;
  setBootstrapError: (message: string | null) => void;
  setCorruptData: (value: boolean, message?: string) => void;
  setSnapshot: (snapshot: { saving: Saving; spendingIncome: SpendingIncome }) => void;
  setSaving: (saving: Saving) => void;
  setSpendingIncome: (spendingIncome: SpendingIncome) => void;
  bumpArchivesRevision: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  isBootstrapped: false,
  isBootstrapping: false,
  bootstrapError: null,
  isCorruptData: false,
  saving: null,
  spendingIncome: null,
  archivesRevision: 0,
  setBootstrapping: (value) => set({ isBootstrapping: value }),
  setBootstrapError: (message) => set({ bootstrapError: message, isCorruptData: false }),
  setCorruptData: (value, message) =>
    set({
      isCorruptData: value,
      bootstrapError: message ?? 'Stored data is invalid.',
      isBootstrapped: false,
    }),
  setSnapshot: ({ saving, spendingIncome }) =>
    set({
      saving,
      spendingIncome,
      isBootstrapped: true,
      bootstrapError: null,
      isCorruptData: false,
    }),
  setSaving: (saving) => set({ saving }),
  setSpendingIncome: (spendingIncome) => set({ spendingIncome }),
  bumpArchivesRevision: () =>
    set((state) => ({ archivesRevision: state.archivesRevision + 1 })),
}));
