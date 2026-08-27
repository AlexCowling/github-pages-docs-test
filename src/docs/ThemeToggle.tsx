import { useEffect, useState } from "react";

type Choice = "system" | "light" | "dark";

const STORAGE_KEY = "ti-docs-theme";
const NEXT: Record<Choice, Choice> = { system: "light", light: "dark", dark: "system" };
const LABEL: Record<Choice, string> = {
  system: "Theme: system",
  light: "Theme: light",
  dark: "Theme: dark",
};

function read(): Choice {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : "system";
  } catch {
    // Private windows and blocked site data throw on access rather than returning null.
    return "system";
  }
}

/**
 * Demonstrates the theme contract: products switch themes by setting one
 * attribute, because every colour resolves through a custom property.
 */
export function ThemeToggle() {
  const [choice, setChoice] = useState<Choice>("system");

  useEffect(() => setChoice(read()), []);

  useEffect(() => {
    const root = document.documentElement;
    if (choice === "system") delete root.dataset.tiTheme;
    else root.dataset.tiTheme = choice;
    try {
      window.localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // Persisting is a convenience; the toggle still works without it.
    }
  }, [choice]);

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={() => setChoice(NEXT[choice])}
      aria-live="polite"
    >
      {LABEL[choice]}
    </button>
  );
}
