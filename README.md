# github-pages-docs-test

Barebones Jekyll site with a TypeScript/React bundle and SCSS, deployed to GitHub Pages
by GitHub Actions.

## How the pieces fit

| Concern | Owner | Source | Output |
| --- | --- | --- | --- |
| Pages, layouts, content | Jekyll | `index.md`, `_layouts/` | `_site/` |
| Styles | dart-sass via npm | `src/styles/` | `assets/css/main.css` |
| Interactivity | esbuild | `src/**/*.tsx` | `assets/js/bundle.js` |

Everything under `assets/` is generated and git-ignored. Jekyll compiles no SCSS of its
own; it copies the finished `assets/` directory into `_site` like any other static file.
That keeps one toolchain for all frontend assets and keeps the repository free of
generated output. The trade-off is that Liquid cannot be used inside `.scss` files, so
stylesheets reference assets by relative path rather than through `relative_url`.

React runs as islands, not as the whole page. `src/main.tsx` finds every element with a
`data-react-root` attribute and mounts `App` into it, so any Markdown page can drop one
in where it needs interactivity.

## Local development

Requires Node 22+ and Ruby 3.3 with Bundler.

```sh
npm install
bundle install
npm run build   # required once on a fresh clone: assets/ does not exist yet
```

Then two terminals:

```sh
npm run dev     # dart-sass and esbuild, both in watch mode
npm run serve   # jekyll serve --livereload
```

Jekyll watches `assets/`, so a rebuild from either watcher triggers a site rebuild and a
browser refresh. The site serves at http://127.0.0.1:4000/github-pages-docs-test/ ; the
root path 404s because of `baseurl`.

## Build order

esbuild and dart-sass must run before Jekyll, or Jekyll copies an `assets/` directory
that does not exist yet. `npm run build` covers both, and `.github/workflows/pages.yml`
runs it ahead of `bundle exec jekyll build`.

## Deployment

Both `package-lock.json` and `Gemfile.lock` are committed, so `npm ci` and `bundle
install` resolve identical versions locally and in CI, and `ruby/setup-ruby` can cache
gems against the lockfile.

On every push to `main`: `npm ci` → `npm run typecheck` → `npm run build` →
`bundle exec jekyll build` → upload → deploy.

Before the first deploy, set **Settings → Pages → Build and deployment → Source** to
**GitHub Actions**. The legacy "Deploy from a branch" option only runs Jekyll and would
skip the npm build entirely.

`baseurl` in `_config.yml` is `/github-pages-docs-test` because this is a project page.
Every internal link goes through the `relative_url` filter so it survives a change of
`baseurl`.
