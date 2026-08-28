import { useEffect, useRef } from "react";
import type { ReactElement } from "react";
import { EmailInput } from "../components";
import type { EmailInputHandle, EmailInputProps } from "../components";

interface SampleProps extends EmailInputProps {
  /** Runs the rules once after mount, so the resting state of the sample is the validated one. */
  autoValidate?: boolean;
}

function Sample({ autoValidate, ...props }: SampleProps) {
  const ref = useRef<EmailInputHandle>(null);
  useEffect(() => {
    if (autoValidate) ref.current?.validate();
  }, [autoValidate]);
  return <EmailInput ref={ref} {...props} />;
}

interface StateCase {
  name: string;
  note: string;
  /** Applies a docs-only class that mirrors a rule the browser will not let us trigger. */
  force?: "hover" | "focus";
  render: () => ReactElement;
}

const label = "Work email address";

const CASES: StateCase[] = [
  {
    name: "Default",
    note: "Resting state, no value entered.",
    render: () => <EmailInput label={label} placeholder="name@example.com" />,
  },
  {
    name: "With description",
    note: "Helper text is wired through aria-describedby.",
    render: () => (
      <EmailInput label={label} description="We use this for account recovery only." />
    ),
  },
  {
    name: "Required",
    note: "Sets the native required attribute and the asterisk.",
    render: () => <EmailInput label={label} rules={{ required: true }} />,
  },
  {
    name: "Filled",
    note: "A value present but not yet validated.",
    render: () => <EmailInput label={label} defaultValue="ana.silva@example.com" />,
  },
  {
    name: "Hover",
    note: "Border darkens to border.strong. Simulated here.",
    force: "hover",
    render: () => <EmailInput label={label} placeholder="name@example.com" />,
  },
  {
    name: "Focus",
    note: "3px ring offset by 2px. Simulated here; tab to a real field to confirm.",
    force: "focus",
    render: () => <EmailInput label={label} placeholder="name@example.com" />,
  },
  {
    name: "Invalid",
    note: "Border, icon and message together, so colour is never the only signal.",
    render: () => <Sample label={label} defaultValue="ana.silva@" autoValidate />,
  },
  {
    name: "Invalid, controlled",
    note: "A form library owns the message through invalid and errorMessage.",
    render: () => (
      <EmailInput
        label={label}
        defaultValue="ana.silva@example.com"
        invalid
        errorMessage="That address is already registered."
      />
    ),
  },
  {
    name: "Valid",
    note: "Opt in with showSuccess. Off by default.",
    render: () => (
      <Sample
        label={label}
        defaultValue="ana.silva@example.com"
        showSuccess
        autoValidate
      />
    ),
  },
  {
    name: "Typo suggestion",
    note: "Offers the correction rather than only reporting a fault (WCAG 3.3.3).",
    render: () => (
      <Sample
        label={label}
        defaultValue="ana.silva@gmial.com"
        suggestDomains={["gmail.com", "outlook.com", "example.com"]}
        autoValidate
      />
    ),
  },
  {
    name: "Clearable",
    note: "Clear button is 44x44 at size md, meeting WCAG 2.5.5.",
    render: () => <EmailInput label={label} defaultValue="ana.silva@example.com" clearable />,
  },
  {
    name: "Busy",
    note: "A lookup owned by the parent is in flight.",
    render: () => <EmailInput label={label} defaultValue="ana.silva@example.com" busy />,
  },
  {
    name: "Read only",
    note: "Value is exposed to assistive technology but cannot be edited.",
    render: () => (
      <EmailInput label={label} defaultValue="ana.silva@example.com" readOnly />
    ),
  },
  {
    name: "Disabled",
    note: "Removed from the tab order. Prefer read only where the value still matters.",
    render: () => (
      <EmailInput label={label} defaultValue="ana.silva@example.com" disabled />
    ),
  },
  {
    name: "Small",
    note: "32px control. Meets WCAG 2.5.8, not 2.5.5.",
    render: () => <EmailInput label={label} size="sm" placeholder="name@example.com" />,
  },
  {
    name: "Large",
    note: "52px control, for primary single-field forms.",
    render: () => <EmailInput label={label} size="lg" placeholder="name@example.com" />,
  },
];

export function StatesGallery() {
  return (
    <ul className="states">
      {CASES.map((item) => (
        <li className="states__item" key={item.name}>
          <h3 className="states__name">{item.name}</h3>
          <p className="states__note">{item.note}</p>
          <div className={item.force ? `states__stage demo-force--${item.force}` : "states__stage"}>
            {item.render()}
          </div>
        </li>
      ))}
    </ul>
  );
}
