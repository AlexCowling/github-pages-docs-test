import type { ComponentType } from "react";
import { Playground } from "./Playground";
import { StatesGallery } from "./StatesGallery";
import { ThemeToggle } from "./ThemeToggle";

/**
 * Every interactive island the documentation can mount. A Markdown page opts
 * in by placing an element with a matching data-ds-demo value, so pages stay
 * plain Markdown and no page ships React it does not use.
 */
export const DEMOS: Record<string, ComponentType> = {
  playground: Playground,
  states: StatesGallery,
  "theme-toggle": ThemeToggle,
};
