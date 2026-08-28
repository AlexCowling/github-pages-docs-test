/**
 * Tier 2: semantic tokens.
 *
 * Every theme must supply the whole `SemanticTokens` shape, so a colour added
 * to light without a dark counterpart is a compile error rather than a
 * runtime hole.
 */

import { palette } from "./primitives";

export interface SemanticTokens {
  surface: {
    page: string;
    raised: string;
    sunken: string;
    disabled: string;
    inverse: string;
  };
  text: {
    primary: string;
    secondary: string;
    placeholder: string;
    disabled: string;
    onAccent: string;
    inverse: string;
  };
  border: {
    subtle: string;
    default: string;
    strong: string;
    disabled: string;
  };
  accent: {
    default: string;
    hover: string;
    active: string;
    surface: string;
  };
  focus: {
    ring: string;
    /** Painted between the control and the ring so the ring stays visible on any surface. */
    offset: string;
  };
  danger: { text: string; border: string; surface: string };
  success: { text: string; border: string; surface: string };
  warning: { text: string; border: string; surface: string };
}

export const light: SemanticTokens = {
  surface: {
    page: palette.white,
    raised: palette.white,
    sunken: palette.grey[50],
    disabled: palette.grey[100],
    inverse: palette.grey[900],
  },
  text: {
    primary: palette.grey[900],
    secondary: palette.grey[700],
    placeholder: palette.grey[600],
    disabled: palette.grey[600],
    onAccent: palette.white,
    inverse: palette.white,
  },
  border: {
    subtle: palette.grey[200],
    default: palette.grey[500],
    strong: palette.grey[700],
    disabled: palette.grey[300],
  },
  accent: {
    default: palette.blue[500],
    hover: palette.blue[600],
    active: palette.blue[700],
    surface: palette.blue[50],
  },
  focus: {
    ring: palette.blue[500],
    offset: palette.white,
  },
  danger: {
    text: palette.red[500],
    border: palette.red[500],
    surface: palette.red[50],
  },
  success: {
    text: palette.green[500],
    border: palette.green[500],
    surface: palette.green[50],
  },
  warning: {
    text: palette.amber[500],
    border: palette.amber[500],
    surface: palette.amber[50],
  },
};

export const dark: SemanticTokens = {
  surface: {
    page: palette.grey[900],
    raised: palette.grey[800],
    sunken: palette.black,
    disabled: palette.grey[800],
    inverse: palette.grey[50],
  },
  text: {
    primary: palette.grey[50],
    secondary: palette.grey[300],
    placeholder: palette.grey[400],
    disabled: palette.grey[400],
    onAccent: palette.grey[900],
    inverse: palette.grey[900],
  },
  border: {
    subtle: palette.grey[700],
    default: palette.grey[400],
    strong: palette.grey[300],
    disabled: palette.grey[600],
  },
  accent: {
    default: palette.blue[200],
    hover: palette.blue[100],
    active: palette.blue[50],
    surface: palette.blue[700],
  },
  focus: {
    ring: palette.blue[300],
    offset: palette.grey[900],
  },
  danger: {
    text: palette.red[300],
    border: palette.red[300],
    surface: palette.red[700],
  },
  success: {
    text: palette.green[300],
    border: palette.green[300],
    surface: palette.green[700],
  },
  warning: {
    text: palette.amber[300],
    border: palette.amber[300],
    surface: palette.amber[700],
  },
};

export const themes = { light, dark } as const;
export type ThemeName = keyof typeof themes;
