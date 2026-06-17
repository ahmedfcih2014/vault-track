import { describe, expect, it, vi } from "vitest";
import { ResetSpendingIncomePeriodUseCase } from "./reset-spending-income-period";
import type { IArchiveService, ISpendingIncomeRepository } from "../ports/repositories";
import { createFreshSpendingIncome } from "../../domain/spending-income";

const PERIOD_ID = "00000000-0000-4000-8000-000000000002";

function createRepository(
  overrides: Partial<ISpendingIncomeRepository> = {},
): ISpendingIncomeRepository {
  return {
    getCurrent: vi.fn(),
    applyTransaction: vi.fn(),
    replaceWithFresh: vi.fn(),
    resetPeriodWithArchive: vi.fn(),
    ...overrides,
  };
}

function createArchiveService(overrides: Partial<IArchiveService> = {}): IArchiveService {
  return {
    save: vi.fn(),
    list: vi.fn(),
    get: vi.fn(),
    exportToFile: vi.fn(),
    ...overrides,
  };
}

describe("ResetSpendingIncomePeriodUseCase", () => {
  it("archives current period and replaces with a fresh one", async () => {
    const current = createFreshSpendingIncome(PERIOD_ID);
    current.balance = "150.00";
    current.transactions = [
      {
        id: "00000000-0000-4000-8000-000000000040",
        amount: "150.00",
        note: "",
        operationType: "deposit",
        createdAt: "2026-06-17T10:00:00+03:00",
      },
    ];

    const archiveMeta = {
      id: "00000000-0000-4000-8000-000000000050",
      filename: "spending-income-test.json",
      archivedAt: "2026-06-17T12:00:00+03:00",
    };

    const spendingIncomeRepository = createRepository({
      getCurrent: vi.fn().mockResolvedValue(current),
      resetPeriodWithArchive: vi.fn().mockImplementation(async (snapshot, freshPeriod) => {
        expect(snapshot.resetedAt).toBeTruthy();
        expect(snapshot.transactions).toHaveLength(1);
        expect(freshPeriod.balance).toBe("0");
        expect(freshPeriod.transactions).toEqual([]);
        return archiveMeta;
      }),
    });

    const archiveService = createArchiveService({
      exportToFile: vi.fn().mockResolvedValue(undefined),
    });

    const useCase = new ResetSpendingIncomePeriodUseCase(
      spendingIncomeRepository,
      archiveService,
    );

    const result = await useCase.execute();

    expect(result.archive).toEqual(archiveMeta);
    expect(result.freshPeriod.balance).toBe("0");
    expect(spendingIncomeRepository.resetPeriodWithArchive).toHaveBeenCalledOnce();
    expect(archiveService.exportToFile).toHaveBeenCalledWith(archiveMeta.id);
  });

  it("does not reset when period is already closed", async () => {
    const closed = createFreshSpendingIncome(PERIOD_ID);
    closed.resetedAt = "2026-06-17T12:00:00+03:00";

    const spendingIncomeRepository = createRepository({
      getCurrent: vi.fn().mockResolvedValue(closed),
    });
    const archiveService = createArchiveService();

    const useCase = new ResetSpendingIncomePeriodUseCase(
      spendingIncomeRepository,
      archiveService,
    );

    await expect(useCase.execute()).rejects.toThrow("Cannot reset a period that is already closed");
    expect(spendingIncomeRepository.resetPeriodWithArchive).not.toHaveBeenCalled();
  });
});
