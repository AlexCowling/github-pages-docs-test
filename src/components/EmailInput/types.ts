import type { InputHTMLAttributes, ReactNode } from "react";
import type {
  EmailMessages,
  EmailValidationResult,
  EmailValidationRules,
} from "../../validation";

export type EmailInputSize = "sm" | "md" | "lg";

/** When the field runs its rules. `manual` defers entirely to the ref handle. */
export type ValidationTrigger = "blur" | "change" | "submit" | "manual";

export interface EmailInputHandle {
  /** Moves focus to the input, which is what a form should do on submit failure. */
  focus(options?: FocusOptions): void;
  select(): void;
  clear(): void;
  /** Runs the rules now and returns the result, without waiting for a trigger. */
  validate(): EmailValidationResult;
  readonly value: string;
  readonly element: HTMLInputElement | null;
}

type PassthroughAttributes = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "size" | "type" | "onChange" | "children"
>;

export interface EmailInputProps extends PassthroughAttributes {
  /**
   * Visible label. Required: a field without one fails WCAG 3.3.2 Labels or
   * Instructions. Use `hideLabel` when the design calls for no visible text;
   * the label stays in the accessibility tree.
   */
  label: string;
  hideLabel?: boolean;
  /** Persistent helper text, associated through `aria-describedby`. */
  description?: ReactNode;

  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onChange?: InputHTMLAttributes<HTMLInputElement>["onChange"];

  size?: EmailInputSize;

  rules?: EmailValidationRules;
  /** Overrides the built-in copy, one key per validation code. Use for translation. */
  messages?: EmailMessages;
  validateOn?: ValidationTrigger;
  /** Once a field has failed, re-checking on every keystroke is the accepted pattern. */
  revalidateOn?: "change" | "blur";
  onValidate?: (result: EmailValidationResult) => void;
  /**
   * Server-side check, run only after the synchronous rules pass. Return null
   * for success, or a message for failure. Stale responses are discarded.
   */
  asyncValidate?: (value: string) => Promise<EmailValidationResult | string | null>;

  /** Forces the invalid state, for a form library that owns validation. */
  invalid?: boolean;
  /** Forces the message shown. Implies `invalid` unless `invalid` is set to false. */
  errorMessage?: string;
  successMessage?: string;
  /** Confirms a valid entry. Off by default: most fields do not need it. */
  showSuccess?: boolean;
  /** External work in progress, such as a lookup owned by the parent. */
  busy?: boolean;

  clearable?: boolean;
  /** Accessible name for the clear button. Translate alongside `messages`. */
  clearLabel?: string;

  /**
   * Domains to compare against for typo correction, for example
   * `["gmail.com", "outlook.com"]`. Serves WCAG 3.3.3 Error Suggestion.
   */
  suggestDomains?: readonly string[];
  onSuggestionAccept?: (value: string) => void;

  /** Rendered beside the label. `null` removes it. */
  requiredIndicator?: ReactNode;
  optionalIndicator?: ReactNode;

  className?: string;
}
