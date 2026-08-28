/**
 * Email validation rules, with no dependency on React or the DOM.
 *
 * This module is the reason the library is safe to depend on from a service or
 * API project: the same rules that colour a field red in the browser can be
 * enforced on the server, so the two cannot drift.
 */

export type EmailValidationCode =
  | "required"
  | "format"
  | "tooLong"
  | "localPartTooLong"
  | "missingTld"
  | "domainNotAllowed"
  | "domainBlocked"
  | "plusAddressingNotAllowed"
  | "custom";

export interface EmailValidationRules {
  /** Reject an empty value. Defaults to false. */
  required?: boolean;
  /**
   * Overrides the default syntax check. The default is the WHATWG HTML
   * "valid e-mail address" production, which is what browsers apply to
   * `<input type="email">`, so client, server and browser agree.
   */
  pattern?: RegExp;
  /** Whole-address limit. Defaults to 254, the practical maximum from RFC 5321 section 4.5.3.1. */
  maxLength?: number;
  /** Local-part limit. Defaults to 64 octets, RFC 5321 section 4.5.3.1. */
  maxLocalPartLength?: number;
  /** Require at least one dot in the domain, rejecting `user@localhost`. Defaults to true. */
  requireTld?: boolean;
  /** Allow `user+tag@example.com`. Defaults to true. */
  allowPlusAddressing?: boolean;
  /** Case-insensitive allow list. An empty or absent list permits any domain. */
  allowedDomains?: readonly string[];
  /** Case-insensitive deny list, applied after the allow list. */
  blockedDomains?: readonly string[];
  /** Trim surrounding whitespace and lowercase before validating. Defaults to true. */
  normalise?: boolean;
}

export interface EmailValidationResult {
  valid: boolean;
  code: EmailValidationCode | null;
  message: string | null;
  /** The value after normalisation, which is what should be submitted and stored. */
  value: string;
}

export interface EmailMessageContext {
  value: string;
  rules: Required<Omit<EmailValidationRules, "pattern">> & { pattern: RegExp };
}

export type EmailMessages = Partial<
  Record<EmailValidationCode, string | ((context: EmailMessageContext) => string)>
>;

/** https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address */
export const WHATWG_EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export const DEFAULT_RULES = {
  required: false,
  pattern: WHATWG_EMAIL_PATTERN,
  maxLength: 254,
  maxLocalPartLength: 64,
  requireTld: true,
  allowPlusAddressing: true,
  allowedDomains: [] as readonly string[],
  blockedDomains: [] as readonly string[],
  normalise: true,
} satisfies Required<EmailValidationRules>;

/**
 * Wording follows WCAG 3.3.3 Error Suggestion: each message says what is wrong
 * and what to do about it, rather than only that the value is invalid.
 */
export const DEFAULT_MESSAGES: Required<EmailMessages> = {
  required: "Enter an email address.",
  format: "Enter an email address in the format name@example.com.",
  tooLong: ({ rules }) => `Use ${rules.maxLength} characters or fewer.`,
  localPartTooLong: ({ rules }) =>
    `Use ${rules.maxLocalPartLength} characters or fewer before the @ sign.`,
  missingTld: "Include a domain ending, for example .com or .nz.",
  domainNotAllowed: ({ rules }) =>
    rules.allowedDomains.length === 1
      ? `Use an address ending in @${rules.allowedDomains[0]}.`
      : `Use an address from one of these domains: ${rules.allowedDomains.join(", ")}.`,
  domainBlocked: "That domain is not accepted. Use a different email address.",
  plusAddressingNotAllowed: "Remove the + and anything after it from the part before the @ sign.",
  custom: "Enter a valid email address.",
};

const domainOf = (value: string) => value.slice(value.lastIndexOf("@") + 1).toLowerCase();

const resolve = (
  code: EmailValidationCode,
  messages: EmailMessages,
  context: EmailMessageContext,
): string => {
  const template = messages[code] ?? DEFAULT_MESSAGES[code];
  return typeof template === "function" ? template(context) : template;
};

/**
 * Merges over the defaults treating an explicit `undefined` as "not specified".
 * A plain spread would let `{ allowedDomains: undefined }` overwrite the default
 * empty array, which is the shape produced by every conditional prop of the form
 * `allowedDomains={enabled ? list : undefined}`.
 */
function resolveRules(rules: EmailValidationRules): Required<EmailValidationRules> {
  const resolved = { ...DEFAULT_RULES };
  for (const [key, value] of Object.entries(rules)) {
    if (value !== undefined) {
      (resolved as Record<string, unknown>)[key] = value;
    }
  }
  return resolved;
}

export function validateEmail(
  input: string,
  rules: EmailValidationRules = {},
  messages: EmailMessages = {},
): EmailValidationResult {
  const resolved = resolveRules(rules);
  const value = resolved.normalise ? input.trim().toLowerCase() : input;
  const context: EmailMessageContext = { value, rules: resolved };

  const fail = (code: EmailValidationCode): EmailValidationResult => ({
    valid: false,
    code,
    message: resolve(code, messages, context),
    value,
  });

  if (value.length === 0) {
    return resolved.required ? fail("required") : { valid: true, code: null, message: null, value };
  }
  if (value.length > resolved.maxLength) return fail("tooLong");
  if (!resolved.pattern.test(value)) return fail("format");

  const localPart = value.slice(0, value.lastIndexOf("@"));
  if (localPart.length > resolved.maxLocalPartLength) return fail("localPartTooLong");
  if (!resolved.allowPlusAddressing && localPart.includes("+")) {
    return fail("plusAddressingNotAllowed");
  }

  const domain = domainOf(value);
  if (resolved.requireTld && !domain.includes(".")) return fail("missingTld");

  const allowed = resolved.allowedDomains.map((d) => d.toLowerCase());
  if (allowed.length > 0 && !allowed.includes(domain)) return fail("domainNotAllowed");

  const blocked = resolved.blockedDomains.map((d) => d.toLowerCase());
  if (blocked.includes(domain)) return fail("domainBlocked");

  return { valid: true, code: null, message: null, value };
}

/** Damerau-Levenshtein distance, capped for cheap early exit. */
function distance(a: string, b: string, cap: number): number {
  if (Math.abs(a.length - b.length) > cap) return cap + 1;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      const substitution = previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1);
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, substitution);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        current[j] = Math.min(current[j], previous[j - 2] + 1);
      }
    }
    if (Math.min(...current) > cap) return cap + 1;
    previous = current;
  }
  return previous[b.length];
}

/**
 * Suggests a correction for a mistyped domain. Serves WCAG 3.3.3 Error
 * Suggestion by offering the fix rather than only reporting the fault.
 * Returns null when the domain is already known or nothing is close enough.
 */
export function suggestEmailDomain(
  value: string,
  domains: readonly string[],
  maxDistance = 2,
): string | null {
  const at = value.lastIndexOf("@");
  if (at < 1) return null;

  const domain = value.slice(at + 1).toLowerCase();
  if (domain.length === 0 || domains.some((d) => d.toLowerCase() === domain)) return null;

  let best: { domain: string; score: number } | null = null;
  for (const candidate of domains) {
    const score = distance(domain, candidate.toLowerCase(), maxDistance);
    if (score <= maxDistance && (best === null || score < best.score)) {
      best = { domain: candidate, score };
    }
  }
  return best ? `${value.slice(0, at + 1)}${best.domain}` : null;
}
