import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

/**
 * Smoke tests for the parts of the component that only exist at runtime.
 *
 * The unit suite covers the validation rules and the contrast script covers the
 * palette; neither can tell whether the React island mounted, whether the ARIA
 * wiring survived into the DOM, or whether a state actually clears. Two defects
 * found by hand in the playground are pinned here as regressions.
 */

const playground = (page: Page) => page.getByTestId("playground");
const field = (page: Page) => playground(page).getByRole("textbox", { name: /Email address/ });
const toggle = (page: Page, name: string) =>
  playground(page).getByRole("checkbox", { name: new RegExp(name) });

async function blur(input: Locator) {
  await input.press("Tab");
}

test.beforeEach(async ({ page }) => {
  await page.goto("components/email-input/");
});

test("the playground island mounts and the label is associated with the input", async ({
  page,
}) => {
  await expect(field(page)).toBeVisible();
  // getByLabel resolves through the accessibility tree, so this passing means
  // the label is really associated, not merely adjacent.
  await expect(playground(page).getByLabel(/Email address/)).toBeVisible();
});

test("an empty required field reports the error on blur", async ({ page }) => {
  const input = field(page);
  await input.click();
  await blur(input);

  await expect(playground(page).getByText("Enter an email address.")).toBeVisible();
  await expect(input).toHaveAttribute("aria-invalid", "true");
});

test("the error is announced through a polite live region the input points at", async ({
  page,
}) => {
  const input = field(page);
  await input.fill("not-an-address");
  await blur(input);

  const describedBy = await input.getAttribute("aria-describedby");
  expect(describedBy).toBeTruthy();

  const messagesId = describedBy!.split(" ").find((id) => id.endsWith("-messages"));
  expect(messagesId).toBeTruthy();

  // An attribute selector rather than #id: React useId emits guillemets, which
  // are not valid in a CSS id selector unescaped, and CSS.escape is a browser
  // global that does not exist in the test runner process.
  const region = page.locator(`[id="${messagesId}"]`);
  await expect(region).toHaveAttribute("aria-live", "polite");
  await expect(region).toContainText("Enter an email address in the format");
});

test("a syntactically valid address clears the error and confirms success", async ({ page }) => {
  const input = field(page);
  await input.fill("ana@example.com");
  await blur(input);

  await expect(playground(page).getByText("Email address looks right.")).toBeVisible();
  await expect(input).not.toHaveAttribute("aria-invalid", "true");
});

// Regression: turning the allow list off left the stale domain error on screen,
// because nothing re-ran the rules after they changed.
test("turning allowedDomains off clears the domain error with no further input", async ({
  page,
}) => {
  const input = field(page);
  await toggle(page, "allowedDomains").check();

  await input.fill("ana@elsewhere.test");
  await blur(input);
  await expect(playground(page).getByText(/Use an address ending in @example\.com/)).toBeVisible();

  await toggle(page, "allowedDomains").uncheck();

  await expect(playground(page).getByText(/Use an address ending in @example\.com/)).toHaveCount(0);
  await expect(input).not.toHaveAttribute("aria-invalid", "true");
});

// Regression: Reset restored the props but not the field state, so an error
// raised before the click was still showing after it.
test("Reset returns the field to its mounted state", async ({ page }) => {
  const input = field(page);
  await input.click();
  await blur(input);
  await expect(playground(page).getByText("Enter an email address.")).toBeVisible();

  await playground(page).getByRole("button", { name: "Reset" }).click();

  await expect(playground(page).getByText("Enter an email address.")).toHaveCount(0);
  await expect(field(page)).toHaveValue("");
});

test("a mistyped domain offers a correction that can be applied", async ({ page }) => {
  const input = field(page);
  await input.fill("ana@gmial.com");
  await blur(input);

  const suggestion = playground(page).getByRole("button", { name: "ana@gmail.com" });
  await expect(suggestion).toBeVisible();

  await suggestion.click();
  await expect(field(page)).toHaveValue("ana@gmail.com");
  await expect(suggestion).toHaveCount(0);
});

test("the clear button empties the field and returns focus to it", async ({ page }) => {
  const input = field(page);
  await input.fill("ana@example.com");

  await playground(page).getByRole("button", { name: "Clear email address" }).click();

  await expect(input).toHaveValue("");
  await expect(input).toBeFocused();
});

test("the field is reachable and operable by keyboard alone", async ({ page }) => {
  const input = field(page);
  await input.focus();
  await expect(input).toBeFocused();

  await page.keyboard.type("ana@example.com");
  await expect(input).toHaveValue("ana@example.com");

  // Tab from a filled clearable field lands on the clear button.
  await page.keyboard.press("Tab");
  await expect(
    playground(page).getByRole("button", { name: "Clear email address" }),
  ).toBeFocused();
});

test("the states gallery mounts every case", async ({ page }) => {
  const items = page.getByTestId("states").locator("> li");
  await expect(items).toHaveCount(16);
  // Each case renders a real field rather than an empty shell.
  await expect(page.getByTestId("states").getByRole("textbox")).toHaveCount(16);
});

test("the theme toggle pins the theme on the root element", async ({ page }) => {
  const root = page.locator("html");
  await expect(root).not.toHaveAttribute("data-ds-theme", /.*/);

  await page.getByRole("button", { name: /^Theme:/ }).click();
  await expect(root).toHaveAttribute("data-ds-theme", "light");

  await page.getByRole("button", { name: /^Theme:/ }).click();
  await expect(root).toHaveAttribute("data-ds-theme", "dark");
});

test("the agent documentation is in the page but not rendered to the reader", async ({ page }) => {
  const notes = page.locator('script[type="application/llm+markdown"]');
  await expect(notes).toHaveCount(3);

  // Present in source, absent from what a sighted reader sees.
  const body = await page.locator("body").innerText();
  expect(body).not.toContain("Validation semantics an agent should not guess at");
});
