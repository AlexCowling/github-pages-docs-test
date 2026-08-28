import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import type { Page } from "@playwright/test";
import type { Result } from "axe-core";

/**
 * Automated accessibility audit of the rendered DOM.
 *
 * The contrast script checks token pairs in the abstract; this checks the
 * colours that actually end up on screen, in both themes, plus everything else
 * axe can see: names, roles, relationships, headings, landmarks.
 *
 * Both themes are audited because the palette is defined twice, and a dark
 * value can regress on its own.
 */

const PAGES = [
  { name: "Overview", path: "" },
  { name: "Components", path: "components/" },
  { name: "Email input", path: "components/email-input/" },
  { name: "Tokens", path: "tokens/" },
];

const THEMES = ["light", "dark"] as const;

/** WCAG 2.2 up to and including AA. */
const AA_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

/**
 * Reduces a violation to something legible in a failure message. The raw axe
 * result is several hundred lines per finding.
 */
const summarise = (violations: Result[]) =>
  violations.map((violation) => ({
    rule: violation.id,
    impact: violation.impact,
    help: violation.help,
    elements: violation.nodes.map((node) => node.target.join(" ")),
  }));

async function open(page: Page, path: string, theme: (typeof THEMES)[number]) {
  await page.goto(path);
  // The theme control is rendered by React on every page, so its presence
  // confirms the bundle ran before anything is measured.
  await page.getByRole("button", { name: /^Theme:/ }).waitFor();
  await page.evaluate((value) => {
    document.documentElement.dataset.dsTheme = value;
  }, theme);
}

for (const { name, path } of PAGES) {
  for (const theme of THEMES) {
    test(`${name} has no WCAG A or AA violations in the ${theme} theme`, async ({ page }) => {
      await open(page, path, theme);
      const results = await new AxeBuilder({ page }).withTags(AA_TAGS).analyze();
      expect(summarise(results.violations)).toEqual([]);
    });

    test(`${name} meets WCAG 1.4.6 Contrast Enhanced in the ${theme} theme`, async ({ page }) => {
      await open(page, path, theme);
      // Enabled explicitly: axe leaves the AAA contrast rule off by default.
      const results = await new AxeBuilder({ page })
        .withRules(["color-contrast-enhanced"])
        .analyze();
      expect(summarise(results.violations)).toEqual([]);
    });
  }
}

for (const theme of THEMES) {
  test(`the invalid state has no violations in the ${theme} theme`, async ({ page }) => {
    await open(page, "components/email-input/", theme);

    const field = page.getByTestId("playground").getByRole("textbox", { name: /Email address/ });
    await field.fill("not-an-address");
    await field.press("Tab");
    await expect(page.getByTestId("playground").getByText(/Enter an email address in/)).toBeVisible();

    const results = await new AxeBuilder({ page })
      .withTags(AA_TAGS)
      .withRules(["color-contrast-enhanced"])
      .analyze();
    expect(summarise(results.violations)).toEqual([]);
  });
}
