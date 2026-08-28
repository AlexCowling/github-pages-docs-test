# Design System

Proof of concept for a shared React component library: token-driven theming, one email
input built to production standard, and documentation that serves developers and agents
from the same Markdown source.

Published at
<https://alexcowling.github.io/github-pages-docs-test/>.

## Layers

| Subpath | Contains | React required |
| --- | --- | --- |
| `src/components` | React components | Yes |
| `src/tokens` | Colour, spacing, typography | No |
| `src/validation` | Validation rules and messages | No |

The split is the point. An API project can import `validateEmail` and enforce byte-identical
rules to the browser without pulling React into its dependency tree.

## Build pipeline

```
src/tokens/*.ts  --scripts/build-tokens.mjs-->  src/styles/generated/_tokens.scss
                                                assets/tokens/tokens.{css,json}
                                                _data/tokens.json
src/styles/*.scss  --dart-sass-->  assets/css/main.css
src/**/*.tsx       --esbuild--->   assets/js/bundle.js
*.md + _layouts    --jekyll---->   _site/
```

Order matters: tokens, then CSS, then JS, then Jekyll. `npm run build` does the first
three; CI runs Jekyll after. Everything under `assets/`, `src/styles/generated/` and
`_data/tokens.json` is generated and git-ignored.

`_data/tokens.json` is why the token tables in the documentation cannot drift: Jekyll
renders them from the same file the stylesheet was generated from.

## Verification

Nothing about accessibility is asserted in prose without a script behind it.

| Command | Checks |
| --- | --- |
| `npm run check:contrast` | 50 colour pairs against the WCAG ratio each one needs, both themes |
| `npm test` | 16 tests over the validation rules |
| `npm run typecheck` | Types, including that both themes define every semantic token |
| `npm run test:e2e` | 30 Playwright tests over the built site: behaviour, two pinned regressions, and an axe audit of every page in both themes |
| `npm run verify` | Typecheck, unit tests and contrast together; what CI runs before building |

A token edit that drops a pair below its ratio fails the deploy rather than shipping. The
e2e suite runs in CI against the built `_site`, after Jekyll and before the upload, so a
broken island blocks the deploy too. It needs a browser locally:
`npx playwright install chromium`.

## Local development

Requires Node 22+ and Ruby 3.3 with Bundler.

```sh
npm install
bundle install
npm run build     # required once on a fresh clone
```

Then two terminals:

```sh
npm run dev       # tokens once, then dart-sass and esbuild in watch mode
npm run serve     # jekyll serve --livereload
```

Served at <http://127.0.0.1:4000/github-pages-docs-test/>; the root path 404s because of
`baseurl`. Editing anything in `src/tokens` needs `npm run build:tokens`, since the
watchers only follow SCSS and TSX.

## Documentation for agents

Content inside `{% raw %}{% agent %}{% endraw %}` blocks in a Markdown page is written to
the HTML as a `<script type="application/llm+markdown">` element. No browser renders or
executes it, so a developer reading the page sees only the concise prose, while anything
fetching the HTML gets the full detail in source order beside the section it describes.

The same content is collected into `/llms.txt` and `/llms-full.txt`, following the
convention at llmstxt.org.

This works because the site is built by `.github/workflows/pages.yml` rather than by the
legacy GitHub Pages Jekyll build, which ignores `_plugins`.

## Deployment

On every push to `main`: `npm ci` → `npm run verify` → `npm run build` →
`bundle exec jekyll build` → upload → deploy.

Both lockfiles are committed. `Gemfile.lock` records `x86_64-linux` alongside
`x64-mingw-ucrt`, because `ruby/setup-ruby` runs Bundler in frozen mode and a
Windows-only lockfile fails on the runner. Any gem added on Windows needs
`bundle lock --add-platform x86_64-linux` before it will build in CI.
