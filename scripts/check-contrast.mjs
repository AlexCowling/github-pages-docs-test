/**
 * Verifies the colour pairs the components actually render against the WCAG
 * ratio each one is required to meet. Run by `npm run check:contrast` and by
 * CI, so a token edit that breaks contrast fails the build rather than
 * shipping.
 *
 * Ratios are computed with the WCAG 2.2 relative luminance formula
 * (https://www.w3.org/TR/WCAG22/#dfn-relative-luminance).
 */

import { loadTokens } from "./bundle-ts.mjs";

function channel(hex, offset) {
  const value = parseInt(hex.slice(offset, offset + 2), 16) / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const normalised = hex.replace("#", "");
  const expanded =
    normalised.length === 3
      ? normalised.split("").map((c) => c + c).join("")
      : normalised;
  return (
    0.2126 * channel(expanded, 0) +
    0.7152 * channel(expanded, 2) +
    0.0722 * channel(expanded, 4)
  );
}

export function contrast(foreground, background) {
  const a = luminance(foreground);
  const b = luminance(background);
  const [light, dark] = a > b ? [a, b] : [b, a];
  return (light + 0.05) / (dark + 0.05);
}

/**
 * `target` is the ratio the pair must reach.
 *   7   - WCAG 1.4.6 Contrast (Enhanced, AAA) for text below 18.66px
 *   4.5 - WCAG 1.4.3 Contrast (Minimum, AA)
 *   3   - WCAG 1.4.11 Non-text Contrast for borders, focus rings and icons
 */
const PAIRS = [
  ["text.primary", "surface.page", 7, "Field value and body copy"],
  ["text.primary", "surface.raised", 7, "Field value on a raised card"],
  ["text.primary", "surface.sunken", 7, "Body copy on a sunken panel"],
  ["text.secondary", "surface.page", 7, "Label and helper text"],
  ["text.secondary", "surface.raised", 7, "Helper text on a raised card"],
  ["text.secondary", "surface.sunken", 7, "Helper text on a sunken panel"],
  // accent.default is link text, not only an affordance, so it carries the
  // text threshold on every surface a link can sit on. Checking it at 3:1
  // as a non-text colour is what let the navigation ship below AAA.
  ["accent.default", "surface.page", 7, "Link text"],
  ["accent.default", "surface.raised", 7, "Link text in the header"],
  ["accent.default", "surface.sunken", 7, "Link text on a sunken panel"],
  ["text.placeholder", "surface.raised", 4.5, "Placeholder text"],
  ["text.onAccent", "accent.default", 4.5, "Text on an accent fill"],
  ["danger.text", "surface.page", 7, "Error message"],
  ["danger.text", "danger.surface", 7, "Error message on its own tint"],
  ["success.text", "surface.page", 7, "Success message"],
  ["success.text", "success.surface", 7, "Success message on its own tint"],
  ["warning.text", "surface.page", 7, "Warning message"],
  ["warning.text", "warning.surface", 7, "Warning message on its own tint"],
  ["border.default", "surface.page", 3, "Resting field border"],
  ["border.strong", "surface.page", 3, "Hovered field border"],
  ["danger.border", "surface.page", 3, "Invalid field border"],
  ["success.border", "surface.page", 3, "Valid field border"],
  ["focus.ring", "surface.page", 3, "Focus ring against the page"],
  ["focus.ring", "surface.raised", 3, "Focus ring against the field"],
  ["danger.text", "surface.sunken", 7, "Error message on a sunken panel"],
  ["success.text", "surface.sunken", 7, "Success message on a sunken panel"],
];

const read = (theme, path) =>
  path.split(".").reduce((node, key) => node[key], theme);

const { themes } = await loadTokens();

let failures = 0;
const rows = [];

for (const [name, theme] of Object.entries(themes)) {
  for (const [fg, bg, target, purpose] of PAIRS) {
    const ratio = contrast(read(theme, fg), read(theme, bg));
    const pass = ratio >= target;
    if (!pass) failures += 1;
    rows.push({
      theme: name,
      pair: `${fg} on ${bg}`,
      ratio: `${ratio.toFixed(2)}:1`,
      required: `${target}:1`,
      result: pass ? "pass" : "FAIL",
      purpose,
    });
  }
}

const width = (key) => Math.max(key.length, ...rows.map((r) => String(r[key]).length));
const columns = ["theme", "pair", "ratio", "required", "result"];
const widths = Object.fromEntries(columns.map((c) => [c, width(c)]));
const line = (cells) => columns.map((c, i) => String(cells[i]).padEnd(widths[c])).join("  ");

console.log(line(columns.map((c) => c.toUpperCase())));
console.log(columns.map((c) => "-".repeat(widths[c])).join("  "));
for (const row of rows) console.log(line(columns.map((c) => row[c])));

if (failures > 0) {
  console.error(`\n${failures} colour pair(s) below the required ratio.`);
  process.exit(1);
}
console.log(`\nAll ${rows.length} pairs meet their required ratio.`);
