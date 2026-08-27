/**
 * Status glyphs. All are decorative: every state they mark is also carried in
 * text, so nothing depends on shape or colour alone (WCAG 1.4.1).
 */

const base = {
  width: 20,
  height: 20,
  viewBox: "0 0 20 20",
  "aria-hidden": true,
  focusable: "false",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export const ErrorIcon = () => (
  <svg {...base} className="ti-field__icon">
    <circle cx="10" cy="10" r="7.5" />
    <path d="M10 6v4.5" />
    <path d="M10 13.6v.01" />
  </svg>
);

export const SuccessIcon = () => (
  <svg {...base} className="ti-field__icon">
    <circle cx="10" cy="10" r="7.5" />
    <path d="M6.5 10.2l2.4 2.4 4.6-5" />
  </svg>
);

export const ClearIcon = () => (
  <svg {...base} className="ti-field__icon">
    <path d="M5.5 5.5l9 9" />
    <path d="M14.5 5.5l-9 9" />
  </svg>
);

export const BusyIcon = () => (
  <svg {...base} className="ti-field__icon ti-field__icon--busy">
    <circle cx="10" cy="10" r="7.5" opacity="0.25" />
    <path d="M17.5 10a7.5 7.5 0 0 0-7.5-7.5" />
  </svg>
);
