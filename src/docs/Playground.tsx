import { useId, useMemo, useRef, useState } from "react";
import { EmailInput } from "../components";
import type { EmailInputHandle, EmailInputSize, ValidationTrigger } from "../components";

interface DemoState {
  size: EmailInputSize;
  validateOn: ValidationTrigger;
  required: boolean;
  disabled: boolean;
  readOnly: boolean;
  clearable: boolean;
  showSuccess: boolean;
  busy: boolean;
  hideLabel: boolean;
  withDescription: boolean;
  restrictDomain: boolean;
  suggestTypos: boolean;
  forceInvalid: boolean;
}

const INITIAL: DemoState = {
  size: "md",
  validateOn: "blur",
  required: true,
  disabled: false,
  readOnly: false,
  clearable: true,
  showSuccess: true,
  busy: false,
  hideLabel: false,
  withDescription: true,
  restrictDomain: false,
  suggestTypos: true,
  forceInvalid: false,
};

const SUGGEST_DOMAINS = ["gmail.com", "outlook.com", "titanium.solutions"];
const ALLOWED_DOMAINS = ["titanium.solutions"];

const TOGGLES: { key: keyof DemoState; label: string; hint: string }[] = [
  { key: "required", label: "required", hint: "rules.required" },
  { key: "disabled", label: "disabled", hint: "native attribute" },
  { key: "readOnly", label: "readOnly", hint: "native attribute" },
  { key: "clearable", label: "clearable", hint: "shows a clear button" },
  { key: "showSuccess", label: "showSuccess", hint: "confirms a valid entry" },
  { key: "busy", label: "busy", hint: "parent-owned pending state" },
  { key: "hideLabel", label: "hideLabel", hint: "label stays in the a11y tree" },
  { key: "withDescription", label: "description", hint: "helper text" },
  { key: "restrictDomain", label: "allowedDomains", hint: "titanium.solutions only" },
  { key: "suggestTypos", label: "suggestDomains", hint: "typo correction" },
  { key: "forceInvalid", label: "invalid", hint: "override from a form library" },
];

function snippetFor(state: DemoState): string {
  const lines: string[] = ["<EmailInput"];
  lines.push('  label="Work email address"');
  if (state.hideLabel) lines.push("  hideLabel");
  if (state.withDescription) lines.push('  description="We use this for account recovery only."');
  if (state.size !== "md") lines.push(`  size="${state.size}"`);
  if (state.validateOn !== "blur") lines.push(`  validateOn="${state.validateOn}"`);

  const rules: string[] = [];
  if (state.required) rules.push("required: true");
  if (state.restrictDomain) rules.push(`allowedDomains: ["${ALLOWED_DOMAINS.join('", "')}"]`);
  if (rules.length > 0) lines.push(`  rules={{ ${rules.join(", ")} }}`);

  if (state.suggestTypos) lines.push(`  suggestDomains={${JSON.stringify(SUGGEST_DOMAINS)}}`);
  if (state.clearable) lines.push("  clearable");
  if (state.showSuccess) lines.push("  showSuccess");
  if (state.busy) lines.push("  busy");
  if (state.disabled) lines.push("  disabled");
  if (state.readOnly) lines.push("  readOnly");
  if (state.forceInvalid) {
    lines.push("  invalid");
    lines.push('  errorMessage="That address is already registered."');
  }
  lines.push("  onValueChange={setEmail}");
  lines.push("/>");
  return lines.join("\n");
}

export function Playground() {
  const [state, setState] = useState<DemoState>(INITIAL);
  const [copied, setCopied] = useState(false);
  const fieldRef = useRef<EmailInputHandle>(null);
  const legendId = useId();

  const snippet = useMemo(() => snippetFor(state), [state]);
  const set = <K extends keyof DemoState>(key: K, value: DemoState[K]) =>
    setState((current) => ({ ...current, [key]: value }));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="demo">
      <div className="demo__stage">
        <EmailInput
          ref={fieldRef}
          label="Work email address"
          hideLabel={state.hideLabel}
          description={
            state.withDescription ? "We use this for account recovery only." : undefined
          }
          size={state.size}
          validateOn={state.validateOn}
          rules={{
            required: state.required,
            allowedDomains: state.restrictDomain ? ALLOWED_DOMAINS : undefined,
          }}
          suggestDomains={state.suggestTypos ? SUGGEST_DOMAINS : undefined}
          clearable={state.clearable}
          showSuccess={state.showSuccess}
          busy={state.busy}
          disabled={state.disabled}
          readOnly={state.readOnly}
          invalid={state.forceInvalid || undefined}
          errorMessage={state.forceInvalid ? "That address is already registered." : undefined}
          placeholder="name@example.com"
        />
        <p className="demo__hint">
          Type an address and move focus away to see validation. Try{" "}
          <code>name@gmial.com</code> for the typo suggestion.
        </p>
      </div>

      <div className="demo__controls">
        <fieldset className="demo__group">
          <legend className="demo__legend" id={legendId}>
            Props
          </legend>

          <div className="demo__row">
            <label className="demo__label" htmlFor={`${legendId}-size`}>
              size
            </label>
            <select
              className="demo__select"
              id={`${legendId}-size`}
              value={state.size}
              onChange={(event) => set("size", event.target.value as EmailInputSize)}
            >
              <option value="sm">sm</option>
              <option value="md">md</option>
              <option value="lg">lg</option>
            </select>
          </div>

          <div className="demo__row">
            <label className="demo__label" htmlFor={`${legendId}-trigger`}>
              validateOn
            </label>
            <select
              className="demo__select"
              id={`${legendId}-trigger`}
              value={state.validateOn}
              onChange={(event) => set("validateOn", event.target.value as ValidationTrigger)}
            >
              <option value="blur">blur</option>
              <option value="change">change</option>
              <option value="submit">submit</option>
              <option value="manual">manual</option>
            </select>
          </div>

          <ul className="demo__toggles">
            {TOGGLES.map(({ key, label, hint }) => (
              <li key={key}>
                <label className="demo__toggle">
                  <input
                    type="checkbox"
                    checked={Boolean(state[key])}
                    onChange={(event) => set(key, event.target.checked as never)}
                  />
                  <span className="demo__toggle-text">
                    <code>{label}</code>
                    <span className="demo__toggle-hint">{hint}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>

          <div className="demo__actions">
            <button
              type="button"
              className="demo__button"
              onClick={() => fieldRef.current?.validate()}
            >
              ref.validate()
            </button>
            <button
              type="button"
              className="demo__button"
              onClick={() => fieldRef.current?.clear()}
            >
              ref.clear()
            </button>
            <button type="button" className="demo__button" onClick={() => setState(INITIAL)}>
              Reset
            </button>
          </div>
        </fieldset>
      </div>

      <div className="demo__code">
        <div className="demo__code-header">
          <h3 className="demo__code-title">Generated usage</h3>
          <button type="button" className="demo__button" onClick={copy}>
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <pre>
          <code>{snippet}</code>
        </pre>
        <p className="demo__status" role="status">
          {copied ? "Snippet copied to the clipboard." : ""}
        </p>
      </div>
    </div>
  );
}
