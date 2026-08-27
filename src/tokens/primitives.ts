/**
 * Tier 1: primitives.
 *
 * Raw values with no meaning attached. Nothing outside `semantic.ts` should
 * reference these directly; product code that reaches past the semantic tier
 * loses the ability to be re-themed.
 */

export const palette = {
  white: "#ffffff",
  black: "#000000",

  grey: {
    50: "#f7f8f9",
    100: "#eef0f2",
    200: "#dfe3e7",
    300: "#c3cad2",
    400: "#98a2ad",
    500: "#6e7883",
    600: "#545d67",
    700: "#3b434b",
    800: "#252b31",
    900: "#14181c",
  },

  blue: {
    50: "#eef4fb",
    100: "#d3e4f7",
    200: "#a9c9ee",
    300: "#6da4de",
    400: "#2f7ac6",
    500: "#155799",
    600: "#0f4478",
    700: "#0b3157",
  },

  red: {
    50: "#fdf2f1",
    100: "#fadcd9",
    300: "#eb9d96",
    500: "#961a11",
    600: "#821910",
    700: "#3d0b07",
  },

  green: {
    50: "#edf6f0",
    100: "#cfe7d8",
    300: "#79bd92",
    500: "#0d5c32",
    600: "#0d5730",
    700: "#052414",
  },

  amber: {
    50: "#fdf5e6",
    100: "#f8e4bc",
    300: "#d9a441",
    500: "#6d4900",
    600: "#5f4000",
    700: "#241800",
  },
} as const;

export const scale = {
  /** 4px base. Values are rem so they respond to user font-size (WCAG 1.4.4). */
  space: {
    0: "0",
    "3xs": "0.125rem",
    "2xs": "0.25rem",
    xs: "0.375rem",
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    "2xl": "2rem",
    "3xl": "3rem",
  },

  radius: {
    none: "0",
    sm: "0.1875rem",
    md: "0.375rem",
    lg: "0.5rem",
    pill: "9999px",
  },

  border: {
    thin: "1px",
    medium: "2px",
    thick: "3px",
  },

  /**
   * Minimum interactive heights. `md` and above clear the 44x44 CSS px of
   * WCAG 2.5.5 Target Size (Enhanced, AAA); `sm` clears the 24x24 of
   * WCAG 2.5.8 Target Size (Minimum, AA).
   */
  control: {
    sm: "2rem",
    md: "2.75rem",
    lg: "3.25rem",
  },

  font: {
    family: {
      sans: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: 'ui-monospace, "Cascadia Mono", "SF Mono", Consolas, monospace',
    },
    size: {
      "2xs": "0.6875rem",
      xs: "0.75rem",
      sm: "0.875rem",
      md: "1rem",
      lg: "1.125rem",
      xl: "1.375rem",
      "2xl": "1.75rem",
      "3xl": "2.25rem",
    },
    weight: {
      regular: "400",
      medium: "500",
      semibold: "600",
    },
    lineHeight: {
      tight: "1.25",
      /** 1.5 satisfies WCAG 1.4.12 Text Spacing for body copy. */
      normal: "1.5",
      relaxed: "1.7",
    },
    letterSpacing: {
      tight: "-0.01em",
      normal: "0",
      wide: "0.02em",
    },
  },

  shadow: {
    none: "none",
    sm: "0 1px 2px rgba(20, 24, 28, 0.08)",
    md: "0 2px 8px rgba(20, 24, 28, 0.12)",
  },

  motion: {
    duration: {
      instant: "0ms",
      fast: "120ms",
      normal: "200ms",
    },
    easing: {
      standard: "cubic-bezier(0.2, 0, 0.2, 1)",
    },
  },
} as const;
