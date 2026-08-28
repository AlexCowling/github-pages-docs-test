---
layout: default
title: Tokens
summary: The generated colour, spacing and typography tokens, both themes.
nav_order: 3
permalink: /tokens/
---

# Tokens

Three tiers. Primitives are raw ramps, semantic tokens name a job, and the component
layer reads only the semantic tier. Product code overrides the semantic tier.

Everything below is generated from `src/tokens` at build time, so it cannot drift from
what the stylesheet actually emits. Machine-readable copy:
[tokens.json]({{ '/assets/tokens/tokens.json' | relative_url }}).

## Colour

{{ site.data.tokens.themes.light | size }} semantic colours, each defined in both themes.

<div class="table-scroll" markdown="1">

| Token | Light | Dark |
| --- | --- | --- |
{% for pair in site.data.tokens.themes.light -%}
| `--ds-{{ pair[0] }}` | <span class="swatch" style="background: {{ pair[1] }}"></span> `{{ pair[1] }}` | <span class="swatch" style="background: {{ site.data.tokens.themes.dark[pair[0]] }}"></span> `{{ site.data.tokens.themes.dark[pair[0]] }}` |
{% endfor %}

</div>

## Spacing, radius and control height

<div class="table-scroll" markdown="1">

| Token | Value |
| --- | --- |
{% for pair in site.data.tokens.dimensions -%}
{% if pair[0] contains "space-" or pair[0] contains "radius-" or pair[0] contains "control-height-" or pair[0] contains "border-width-" -%}
| `--ds-{{ pair[0] }}` | `{{ pair[1] }}` |
{% endif -%}
{% endfor %}

</div>

Spacing is in `rem`, so the whole scale responds to the browser font size, which is what
WCAG 1.4.4 Resize Text asks for.

## Typography

<div class="table-scroll" markdown="1">

| Token | Value |
| --- | --- |
{% for pair in site.data.tokens.dimensions -%}
{% if pair[0] contains "font-" or pair[0] contains "line-height-" or pair[0] contains "letter-spacing-" -%}
| `--ds-{{ pair[0] }}` | `{{ pair[1] }}` |
{% endif -%}
{% endfor %}

</div>

{% agent token-usage %}
Rules for using tokens in component styles:

- Component stylesheets reference var(--ds-*) only. A literal hex, px or rem value in
  src/styles/components/ is a defect: it cannot be themed and it is not contrast-checked.
- Never reference a primitive from a stylesheet. Primitives are not emitted as CSS custom
  properties precisely to prevent this. They exist only in tokens.json for tooling.
- Adding a colour means adding it to the SemanticTokens interface in src/tokens/semantic.ts
  and to BOTH the light and dark maps. TypeScript enforces this.
- After any token edit, run `node scripts/check-contrast.mjs`. If the new colour is used
  for text or a border, add it to the PAIRS list in that script too, or it is unchecked.
- Rebuild with `npm run build:tokens`. The generated files
  (src/styles/generated/_tokens.scss, assets/tokens/*, _data/tokens.json) are gitignored
  build output.

Naming: --ds-color-<group>-<role>, --ds-space-<step>, --ds-font-size-<step>,
--ds-control-height-<size>, --ds-radius-<step>, --ds-border-width-<weight>,
--ds-line-height-<name>, --ds-duration-<name>, --ds-easing-<name>.
{% endagent %}
