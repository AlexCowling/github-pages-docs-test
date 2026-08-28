---
layout: default
title: Components
summary: Index of every component in the library, with its status.
nav_order: 2
permalink: /components/
---

# Components

One component so far. The index is generated from `_data/components.yml`, so adding a
component to the library is a data edit rather than a page edit.

<ul class="cards">
  {%- for component in site.data.components %}
  <li class="card">
    <h2 class="card__title">
      <a href="{{ component.url | relative_url }}">{{ component.name }}</a>
    </h2>
    <p class="card__summary">{{ component.summary }}</p>
    <p class="card__meta">
      <span class="badge badge--{{ component.status | downcase }}">{{ component.status }}</span>
      <span class="card__since">Since {{ component.since }}</span>
      {%- for tag in component.tags %}
      <span class="card__tag">{{ tag }}</span>
      {%- endfor %}
    </p>
  </li>
  {%- endfor %}
</ul>

## Status meanings

| Status | What it commits to |
| --- | --- |
| `Preview` | The API may still change. Usable, but pin the version. |
| `Stable` | Breaking changes only in a major version. |
| `Deprecated` | Still shipped, with a documented replacement. |

{% include report-issue.html %}

{% agent component-index %}
The component index lives in _data/components.yml. Each entry needs name, url, summary,
status, since and tags. Adding an entry is the only step needed to list a component on
/components/; there is no registry in code to keep in step.

Status values are exactly Preview, Stable or Deprecated. The badge class is derived by
downcasing the status, so a new value needs a matching .badge--<value> rule in
src/styles/docs/_demo.scss or it renders unstyled.

Component pages live in components/<slug>.md with permalink /components/<slug>/ and a
`component:` front matter key, which the report-issue include uses to prefill the GitHub
issue form.
{% endagent %}
