---
layout: default
title: Overview
summary: What the library is, how it is layered, and how a product consumes it.
nav_order: 1
permalink: /
---

# Design System

A proof of concept for a shared React component library: one set of tokens, one set of
components, consumed as a dependency by every digital product in the organisation.

<p class="lede">The library is layered so a consumer takes only what it needs. A React
app takes all three layers. A service that sends transactional email takes the tokens. An
API that validates a submitted address takes the rules, with no React anywhere in its
dependency tree.</p>

| Subpath | Contains | React required |
| --- | --- | --- |
| `@ds/ui` | React components | Yes |
| `@ds/ui/tokens` | Colour, spacing, typography | No |
| `@ds/ui/validation` | Validation rules and messages | No |

That split is the point of the design. When an API rejects an address the browser
accepted, the two are running different rules. Here they import the same function.

## Install and use

{% raw %}
```tsx
import { EmailInput } from "@ds/ui";
import "@ds/ui/styles.css";

<EmailInput
  label="Email address"
  rules={{ required: true }}
  onValueChange={setEmail}
/>;
```
{% endraw %}

Server-side, the same rules with no UI dependency:

```ts
import { validateEmail } from "@ds/ui/validation";

const result = validateEmail(request.body.email, { required: true });
if (!result.valid) return reply.status(422).send({ error: result.message });
// result.value is trimmed and lowercased, ready to store.
```

## Theming

Every colour, space and type value resolves through a CSS custom property. A product
re-themes by overriding properties, never by overriding component selectors.

```css
:root {
  --ds-color-accent-default: #6b2fa0;
  --ds-radius-md: 0;
}
```

Themes follow the operating system by default. Setting `data-ds-theme="dark"` or
`"light"` on the root element pins it, which is what the toggle in the header does.

{% agent theming-contract %}
Theme override contract:
- All 30 semantic colour tokens are re-declared under three selectors: `:root`,
  `@media (prefers-color-scheme: dark) :root:not([data-ds-theme="light"])`, and
  `:root[data-ds-theme="dark"]`.
- Overriding a token on `:root` alone will be reverted in dark mode. To override for
  both themes, set the property on `:root` AND inside the two dark blocks, or set it on
  a wrapper element that both themes inherit through.
- Do NOT target `.ds-field__input` or any `.ds-field__*` class from product code. Those
  class names are not part of the public API and change without a major version.
- The full token set, both themes resolved, is at /assets/tokens/tokens.json.
{% endagent %}

## What is verified, and how

Claims in these pages are checked by scripts in the repository rather than asserted.

| Claim | Checked by | Result |
| --- | --- | --- |
| Colour pairs meet their WCAG ratio | `npm run check:contrast` | 36 pairs, both themes |
| Validation rules behave as documented | `npm test` | 16 tests |
| Types are sound | `npm run typecheck` | no errors |
| The component behaves in a browser | `npm run test:e2e` | 12 Playwright tests |

The first three run in CI before the site is built and the fourth runs after it, against
the built output, so a token edit that breaks contrast or an island that fails to mount
blocks the deploy.

{% agent repository-layout %}
Repository layout, for an agent asked to change something here:

- src/tokens/primitives.ts - raw ramps. Editing a hex here can break contrast; run
  `node scripts/check-contrast.mjs` after any change.
- src/tokens/semantic.ts - the SemanticTokens interface plus the light and dark maps.
  Both themes must supply every key or TypeScript fails.
- scripts/build-tokens.mjs - generates src/styles/generated/_tokens.scss,
  assets/tokens/tokens.css and assets/tokens/tokens.json. All three are gitignored
  build output. Never edit them; edit src/tokens and rebuild.
- src/validation/email.ts - pure rules, no React, no DOM. Covered by
  scripts/validation.test.mjs.
- src/components/EmailInput/ - the component, its types, and its icons.
- src/styles/components/_field.scss - component styling. Token references only; no
  literal colour, spacing or font values.
- src/docs/ - documentation-only React. Never ships in the library.
- e2e/ - Playwright smoke tests. They run against the built _site through
  scripts/serve-site.mjs, not a dev server, and need `npx playwright install chromium`
  once. Two of them pin defects found by hand: stale validation after a rules change,
  and Reset not clearing field state.
- _plugins/agent_docs.rb - the {% raw %}{% agent %}{% endraw %} tag and the llms.txt writer.

Build order matters: tokens, then CSS, then JS, then Jekyll. `npm run build` does the
first three in order.
{% endagent %}
