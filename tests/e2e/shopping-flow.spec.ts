import { test, expect } from "@playwright/test";

// End-to-end happy path: browse → product → add to cart → checkout (mock pay) → confirmation.
// Runs against mock payment mode (no Razorpay keys), which settles via /api/v1/payments/mock-confirm.
test("guest can browse, add to cart and complete a mock checkout", async ({ page }) => {
  // Home
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  // Go to catalog and open the first product
  await page.goto("/catalog");
  await expect(page.locator("a[href^='/product/']").first()).toBeVisible();
  await page.locator("a[href^='/product/']").first().click();

  // Product page → add to cart
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.getByRole("button", { name: /add to cart/i }).click();
  await expect(page.getByText(/added to cart/i)).toBeVisible();

  // Checkout
  await page.goto("/checkout");
  await page.getByLabel("Email").fill("e2e@nova.test");
  await page.getByLabel("Full name").fill("E2E Tester");
  await page.getByLabel("Address line 1").fill("1 Future Street");
  await page.getByLabel("City").fill("Bengaluru");
  await page.getByLabel("State").fill("Karnataka");
  await page.getByLabel("Postal code").fill("560001");

  await page.getByRole("button", { name: /pay/i }).click();

  // Confirmation page
  await expect(page).toHaveURL(/\/order\/NOVA-/, { timeout: 20_000 });
  await expect(page.getByText(/order confirmed|order received/i)).toBeVisible();
});
