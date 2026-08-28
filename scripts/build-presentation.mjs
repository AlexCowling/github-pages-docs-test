/**
 * Builds the walkthrough deck.
 *
 * Colours come from the design tokens rather than being picked again here, so
 * the deck about the system is drawn with the system. Every figure quoted is
 * one the repository can produce on demand; nothing is estimated.
 */

import pptxgen from "pptxgenjs";
import { loadTokens } from "./bundle-ts.mjs";

const { themes } = await loadTokens();
const t = themes.light;

const hex = (value) => value.replace("#", "");

const INK = hex(t.text.primary);
const MUTED = hex(t.text.secondary);
const ACCENT = hex(t.accent.default);
const RULE = hex(t.border.subtle);
const PANEL = hex(t.surface.sunken);
const DANGER = hex(t.danger.text);
const PAGE = hex(t.surface.page);

const FONT = "Segoe UI";
const MONO = "Consolas";

const pptx = new pptxgen();
// LAYOUT_WIDE is 13.33 x 7.5in. LAYOUT_16x9 is the same ratio at 10 x 5.625in,
// which would push every element positioned beyond x=10 off the slide.
pptx.layout = "LAYOUT_WIDE";
pptx.author = "Design System";
pptx.title = "Design System proof of concept";

pptx.defineSlideMaster({
  title: "BASE",
  background: { color: PAGE },
  objects: [
    { line: { x: 0.6, y: 1.18, w: 12.1, h: 0, line: { color: RULE, width: 1 } } },
    {
      text: {
        text: "alexcowling.github.io/github-pages-docs-test",
        options: {
          x: 0.6,
          y: 6.85,
          w: 8,
          h: 0.3,
          fontSize: 9,
          color: MUTED,
          fontFace: FONT,
        },
      },
    },
  ],
  slideNumber: { x: 12.2, y: 6.85, w: 0.5, h: 0.3, fontSize: 9, color: MUTED, fontFace: FONT },
});

/** Slide with a heading, a one-line standfirst, and a body built by the caller. */
function slide({ heading, standfirst, notes }) {
  const s = pptx.addSlide({ masterName: "BASE" });
  s.addText(heading, {
    x: 0.6,
    y: 0.42,
    w: 12.1,
    h: 0.5,
    fontSize: 26,
    bold: true,
    color: INK,
    fontFace: FONT,
  });
  if (standfirst) {
    s.addText(standfirst, {
      x: 0.6,
      y: 1.32,
      w: 12.1,
      h: 0.4,
      fontSize: 14,
      color: MUTED,
      fontFace: FONT,
    });
  }
  if (notes) s.addNotes(notes);
  return s;
}

const bullets = (s, items, options = {}) =>
  s.addText(
    items.map((item) => ({
      text: item,
      options: { bullet: { code: "2022" }, breakLine: true },
    })),
    {
      x: 0.75,
      y: 1.95,
      w: 12,
      h: 4.4,
      fontSize: 16,
      color: INK,
      fontFace: FONT,
      lineSpacingMultiple: 1.35,
      ...options,
    },
  );

const table = (s, rows, options = {}) =>
  s.addTable(rows, {
    x: 0.6,
    y: 1.95,
    w: 12.1,
    fontSize: 13,
    fontFace: FONT,
    color: INK,
    border: { type: "solid", color: RULE, pt: 1 },
    valign: "middle",
    ...options,
  });

const header = (cells) =>
  cells.map((text) => ({
    text,
    options: { bold: true, color: INK, fill: { color: PANEL } },
  }));

const code = (s, lines, options = {}) =>
  s.addText(lines.join("\n"), {
    x: 0.6,
    y: options.y ?? 2.0,
    w: options.w ?? 6.1,
    h: options.h ?? 3.6,
    fontSize: 12,
    fontFace: MONO,
    color: INK,
    fill: { color: PANEL },
    margin: 12,
    lineSpacingMultiple: 1.2,
    valign: "top",
  });

// ---------------------------------------------------------------- 1. Title

const title = pptx.addSlide();
title.background = { color: PAGE };
title.addText("Design System", {
  x: 0.9,
  y: 2.3,
  w: 11.5,
  h: 0.9,
  fontSize: 44,
  bold: true,
  color: INK,
  fontFace: FONT,
});
title.addText("A proof of concept: one component, verified end to end", {
  x: 0.9,
  y: 3.25,
  w: 11.5,
  h: 0.5,
  fontSize: 20,
  color: MUTED,
  fontFace: FONT,
});
title.addText(
  [
    { text: "React and TypeScript component library", options: { breakLine: true } },
    { text: "Tokens and validation usable without React", options: { breakLine: true } },
    { text: "alexcowling.github.io/github-pages-docs-test", options: { color: ACCENT } },
  ],
  { x: 0.9, y: 4.3, w: 11.5, h: 1.4, fontSize: 14, color: MUTED, fontFace: FONT, lineSpacingMultiple: 1.4 },
);
title.addNotes(
  "Nine minutes. Three things to take away: the layering, what the automated gates caught, and the documentation approach.",
);

// ---------------------------------------------------------------- 2. Problem

bullets(
  slide({
    heading: "The problem this is aimed at",
    standfirst: "Every product builds the same email field, and none of them agree.",
    notes:
      "Anchor on the third bullet. The client and server disagreeing is the failure people have actually seen, and it is the one this design removes.",
  }),
  [
    "The same field is implemented once per product, then diverges.",
    "Accessibility is re-argued by each team, at different depths, with no evidence trail.",
    "Client and server validation drift, so an address the browser accepts the API rejects.",
    "A brand or contrast change means editing every product that copied the CSS.",
  ],
);

// ---------------------------------------------------------------- 3. Layers

const layers = slide({
  heading: "Three layers, taken separately",
  standfirst: "A consumer imports only the layer it needs.",
  notes:
    "The bottom row is the load-bearing one. A Node service or an API imports the same validateEmail the browser runs, so the two cannot drift. That is the reason for the split, not tidiness.",
});
table(
  layers,
  [
    header(["Import path", "What it holds", "Needs React"]),
    ["@ds/ui", "React components", "Yes"],
    ["@ds/ui/tokens", "Colour, spacing, typography", "No"],
    ["@ds/ui/validation", "Rules, messages, typo suggestions", "No, and no DOM"],
  ],
  { colW: [3.4, 5.6, 3.1], rowH: 0.55 },
);
layers.addText(
  "An API project enforcing the same rules as the browser is an import, not a second implementation.",
  { x: 0.6, y: 4.6, w: 12.1, h: 0.4, fontSize: 15, color: ACCENT, fontFace: FONT, bold: true },
);

// ---------------------------------------------------------------- 4. Tokens

const tokens = slide({
  heading: "Tokens: one source, four outputs",
  standfirst: "src/tokens is edited; everything else is generated and git-ignored.",
  notes:
    "Point at the last line. Primitives deliberately never become CSS custom properties, so a stylesheet physically cannot reach past the semantic tier. That constraint is what keeps re-theming possible.",
});
code(tokens, [
  "src/tokens/*.ts",
  "   |",
  "   +-> src/styles/generated/_tokens.scss",
  "   +-> assets/tokens/tokens.css",
  "   +-> assets/tokens/tokens.json",
  "   +-> _data/tokens.json",
]);
bullets(
  tokens,
  [
    "47 dimension and 30 colour custom properties, in two themes.",
    "_data/tokens.json is read by Jekyll, so the documentation tables cannot drift from the stylesheet.",
    "Both themes implement one TypeScript interface: a colour added to light without a dark value fails typecheck.",
    "Primitives are never emitted as custom properties, so product CSS cannot bypass the semantic tier.",
  ],
  { x: 7.1, y: 2.0, w: 5.6, fontSize: 14 },
);

// ---------------------------------------------------------------- 5. Theming

const theming = slide({
  heading: "Theming is a contract, not an override war",
  standfirst: "Products set custom properties. They never target component selectors.",
  notes:
    "The three-block structure matters: set a token on :root only and dark mode reverts it. That trap is written into the agent notes on the overview page.",
});
code(
  theming,
  [
    ":root {",
    "  --ds-color-accent-default: #6b2fa0;",
    "  --ds-radius-md: 0;",
    "}",
    "",
    "<html data-ds-theme=\"dark\">",
  ],
  { w: 6.1, h: 2.6 },
);
bullets(
  theming,
  [
    "Follows the operating system by default.",
    "data-ds-theme pins light or dark and wins in both directions.",
    "Tokens are declared under three selectors, so an override must cover all three.",
    ".ds-field__* class names are not public API.",
  ],
  { x: 7.1, y: 2.0, w: 5.6, fontSize: 14 },
);

// ---------------------------------------------------------------- 6. Component

const component = slide({
  heading: "EmailInput",
  standfirst: "One field, built to the standard every other component would inherit.",
  notes:
    "Do not read the list. Say: controlled or uncontrolled, validation is configurable rather than hardcoded, and there is a ref handle so a form can focus the first failing field on submit.",
});
bullets(component, [
  "Controlled and uncontrolled, with a ref handle: validate(), clear(), focus(), select(), value, element.",
  "Nine configurable rules; nine result codes; every message replaceable for translation.",
  "Async validation runs on blur only, never per keystroke, with stale responses discarded.",
  "Typo correction offers the fix rather than only reporting the fault.",
  "Sixteen documented states, each rendered live on the component page.",
]);

// ---------------------------------------------------------------- 7. Validation

const validation = slide({
  heading: "The rules, and where they run",
  standfirst: "First failure wins, in a fixed order, in the browser and on the server.",
  notes:
    "The order is documented because it is observable: a domain on both the allow list and the deny list is rejected, and someone will eventually depend on that.",
});
table(
  validation,
  [
    header(["Rule", "Default", "Notes"]),
    ["required", "false", "An empty optional field must not error"],
    ["pattern", "WHATWG production", "What browsers apply to type=email"],
    ["maxLength / local part", "254 / 64", "RFC 5321 section 4.5.3.1"],
    ["requireTld", "true", "Rejects user@localhost"],
    ["allowedDomains / blockedDomains", "empty", "Deny list applied after allow list"],
  ],
  { colW: [4.2, 3.0, 4.9], rowH: 0.5 },
);

// ---------------------------------------------------------------- 8. A11y

const a11y = slide({
  heading: "Accessibility, including where it falls short",
  standfirst: "Claimed against named success criteria, with the exceptions stated.",
  notes:
    "Spend time on the exceptions. A design system that claims blanket AAA is not being read carefully; naming the two gaps is what makes the rest credible.",
});
table(
  a11y,
  [
    header(["Criterion", "How"]),
    ["1.4.1 Use of Colour (A)", "Every state carries an icon and text, not only a border colour"],
    ["1.4.6 Contrast Enhanced (AAA)", "Label, value, helper and message text at 7:1 or better"],
    ["2.4.13 Focus Appearance (AAA)", "3px ring, offset 2px, at 7.79:1 against the field"],
    ["3.3.1 Error Identification (A)", "Polite live region, aria-invalid, aria-describedby"],
    ["3.3.3 Error Suggestion (AA)", "Messages say what to do; typo correction offers the fix"],
  ],
  { colW: [4.6, 7.5], rowH: 0.48 },
);
a11y.addText(
  [
    {
      text: "Two exceptions, documented on the page: ",
      options: { bold: true, color: DANGER },
    },
    {
      text: 'size="sm" is a 32px control, which meets 2.5.8 (AA) but not 2.5.5 (AAA). The native required attribute needs noValidate on the form.',
      options: { color: INK },
    },
  ],
  { x: 0.6, y: 5.5, w: 12.1, h: 0.8, fontSize: 13, fontFace: FONT },
);

// ---------------------------------------------------------------- 9. Gates

const gates = slide({
  heading: "Four gates, all of them blocking",
  standfirst: "Nothing about accessibility is asserted in prose without a script behind it.",
  notes:
    "The point is not the count. It is that these run in CI before the upload, so a token edit that breaks contrast or an island that fails to mount does not reach the live page.",
});
table(
  gates,
  [
    header(["Gate", "Covers", "Now"]),
    ["npm run check:contrast", "Token pairs against the ratio each one needs", "50 pairs, 25 per theme"],
    ["npm test", "Validation rules, no browser needed", "16 tests"],
    ["npm run typecheck", "Two projects: library and test tooling", "0 errors"],
    ["npm run test:e2e", "Behaviour, plus axe on every page in both themes", "30 tests, 4 pages"],
  ],
  { colW: [3.5, 5.6, 3.0], rowH: 0.55 },
);

// ---------------------------------------------------------------- 10. Caught

const caught = slide({
  heading: "What the gates actually caught",
  standfirst: "Five of these were live defects, not hypotheticals.",
  notes:
    "This is the slide worth dwelling on. The second one is the most instructive: the token was correct for the job I had written down and wrong for the job it was doing. A token-level check could not have found it; auditing the rendered page did.",
});
bullets(caught, [
  "First contrast run: five colour pairs below target, including success text at 6.49:1 against a 7:1 requirement.",
  "accent.default was checked at 3:1 as an affordance, but it is link text. Dark navigation was shipping at 5.46:1. Found by axe, not by the token check.",
  "Turning a rule off left the old error on screen, because nothing re-ran validation when the rules changed.",
  "An explicit undefined rule overwrote its default, the shape every conditional prop produces.",
  "A find-and-replace collapsed two domains in a test, so it asserted that an allowed domain was rejected.",
]);

// ---------------------------------------------------------------- 11. Docs

const docs = slide({
  heading: "Documentation for developers and for agents",
  standfirst: "One Markdown source, two audiences, no duplicated maintenance.",
  notes:
    "Show the live page if there is time: the rendered page is short, and view-source shows the full contract sitting next to the section it describes.",
});
code(
  docs,
  [
    "{% agent validation-contract %}",
    "An empty string is VALID unless",
    "rules.required is true...",
    "{% endagent %}",
    "",
    "renders as",
    "",
    '<script type="application/llm+markdown">',
  ],
  { w: 6.1, h: 3.2 },
);
bullets(
  docs,
  [
    "No browser renders or executes it, so the page stays short for developers.",
    "Anything fetching the HTML gets the full contract, in source order, beside the prose.",
    "Collected into /llms.txt and /llms-full.txt.",
    "Seven notes across four pages today.",
  ],
  { x: 7.1, y: 2.0, w: 5.6, fontSize: 14 },
);

// ---------------------------------------------------------------- 12. Pipeline

const pipeline = slide({
  heading: "Build and deploy",
  standfirst: "Order matters, and the legacy GitHub Pages build cannot do this.",
  notes:
    "Worth saying plainly: the built-in Pages Jekyll build runs no npm step and ignores _plugins, so it would deploy a site with no CSS, no JavaScript and no agent notes. GitHub Actions is a requirement here, not a preference.",
});
code(
  pipeline,
  [
    "npm ci",
    "npm run verify      # types, rules, contrast",
    "npm run build       # tokens -> css -> js",
    "bundle exec jekyll build",
    "npx playwright test # against the built _site",
    "upload + deploy",
  ],
  { w: 7.2, h: 2.9 },
);
bullets(
  pipeline,
  [
    "Everything generated is git-ignored.",
    "Both lockfiles committed; Gemfile.lock records the Linux platform.",
    "Roughly one minute end to end.",
  ],
  { x: 8.2, y: 2.0, w: 4.5, fontSize: 14 },
);

// ---------------------------------------------------------------- 13. Limits

const limits = slide({
  heading: "What this is not, and what comes next",
  standfirst: "Status is Preview. The API can still change.",
  notes:
    "Close on the ask, not on the summary. The decision needed is whether the layering and the verification bar are right, because everything after this repeats them at scale.",
});
table(
  limits,
  [
    header(["Not built", "Next"]),
    ["Not published to npm; consumed from source", "Publish, with the three subpath exports"],
    ["One component", "Second component to test the pattern holds"],
    ["No visual regression testing", "Screenshot diffing on the state gallery"],
    ["Screen readers not tested by hand", "NVDA and VoiceOver pass on the field"],
    ["No RTL support", "Logical properties are in place; needs a real audit"],
  ],
  { colW: [6.05, 6.05], rowH: 0.5 },
);

const fileName = "presentation/design-system.pptx";
await pptx.writeFile({ fileName });
console.log(`Wrote ${fileName}`);
