import { expect, test } from "@playwright/test";

test.describe("Vault Track core flow", () => {
  test("deposit, balance update, reset, and archive", async ({ page }) => {
    await page.goto("/spending");
    await expect(page.getByTestId("spending-balance")).toHaveText("0.00 EGP");

    await page.getByTestId("spending-add-button").click();
    await page.getByTestId("operation-income").click();
    await page.getByTestId("spending-amount").fill("100");
    await page.getByTestId("spending-submit").click();
    await expect(page.getByTestId("spending-balance")).toHaveText("100.00 EGP");

    await page.goto("/saving");
    await page.getByTestId("balance-usd").click();
    await page.getByTestId("saving-amount").fill("50");
    await page.getByTestId("saving-submit").click();
    await expect(page.getByTestId("balance-usd")).toContainText("$50.00");

    await page.goto("/spending");
    await page.getByTestId("spending-add-button").click();
    await page.getByTestId("operation-spending").click();
    await page.getByTestId("spending-amount").fill("25");
    await page.getByTestId("spending-submit").click();
    await expect(page.getByTestId("spending-balance")).toHaveText("75.00 EGP");

    await page.getByTestId("end-period-button").click();
    await page.getByTestId("confirm-end-period").click();
    await expect(page.getByTestId("spending-balance")).toHaveText("0.00 EGP");

    await page.goto("/archives");
    await expect(page.getByTestId("archive-item").first()).toBeVisible();
  });
});
