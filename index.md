---
layout: default
title: Home
---

# Jekyll + React, one page

Everything above and below this block is static Markdown rendered by Jekyll at build
time. The box below is a React island: `src/main.tsx` mounts into any element carrying
`data-react-root`, so a page opts in to React by placing that element in its Markdown.

<div data-react-root data-greeting="Hello from React"></div>

Pages with no `data-react-root` element ship no React work at all; the bundle mounts
nothing and exits.
