---
layout: default
title: Email input
summary: A single email field with configurable validation, ten states, and verified WCAG contrast.
nav_order: 2
permalink: /components/email-input/
---

# Email input

One email address, validated. Controlled or uncontrolled, with rules that also run on the
server.

{% raw %}
```tsx
import { EmailInput } from "@ds/ui";

<EmailInput
  label="Email address"
  description="We use this for account recovery only."
  rules={{ required: true }}
  onValueChange={setEmail}
/>;
```
{% endraw %}

## Try it

Every control below maps to one prop. The snippet updates as you change them.

<div data-ds-demo="playground"></div>

{% agent playground-note %}
The playground is documentation-only code in src/docs/Playground.tsx. It is not part of
the library and must not be imported by product code.
{% endagent %}

## States

<div data-ds-demo="states"></div>

Hover and focus in that gallery are simulated with a documentation-only class, because a
static page cannot hold a real browser state. Tab into any live field to see the actual
focus ring.

## Props

The ones you will reach for:

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `label` | `string` | required | A field without one fails WCAG 3.3.2. Use `hideLabel` to hide it visually. |
| `rules` | `EmailValidationRules` | `{}` | See the table below. |
| `validateOn` | `"blur" \| "change" \| "submit" \| "manual"` | `"blur"` | Once a field has failed, `revalidateOn` takes over. |
| `onValueChange` | `(value: string) => void` | - | Fires with the raw value. Use `onValidate` for the normalised one. |
| `invalid` / `errorMessage` | `boolean` / `string` | - | Hand validation to a form library. |
| `asyncValidate` | `(value) => Promise<...>` | - | Runs after the sync rules pass, on blur only. |
| `suggestDomains` | `string[]` | - | Offers a correction for a mistyped domain. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | 32px, 44px, 52px. |
| `clearable` | `boolean` | `false` | Adds a clear button sized to the control. |
| `showSuccess` | `boolean` | `false` | Most fields do not need a success state. |

Anything not listed is forwarded to the `<input>`, so `name`, `disabled`, `readOnly`,
`autoFocus`, `placeholder` and `data-*` work as normal.

<details markdown="1">
<summary>Full API, including the ref handle</summary>

| Prop | Type | Default |
| --- | --- | --- |
| `label` | `string` | required |
| `hideLabel` | `boolean` | `false` |
| `description` | `ReactNode` | - |
| `value` | `string` | uncontrolled |
| `defaultValue` | `string` | `""` |
| `onValueChange` | `(value: string) => void` | - |
| `onChange` | `ChangeEventHandler<HTMLInputElement>` | - |
| `onValidate` | `(result: EmailValidationResult) => void` | - |
| `asyncValidate` | `(value: string) => Promise<EmailValidationResult \| string \| null>` | - |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` |
| `rules` | `EmailValidationRules` | `{}` |
| `messages` | `EmailMessages` | built-in copy |
| `validateOn` | `"blur" \| "change" \| "submit" \| "manual"` | `"blur"` |
| `revalidateOn` | `"change" \| "blur"` | `"change"` |
| `invalid` | `boolean` | derived |
| `errorMessage` | `string` | derived |
| `successMessage` | `string` | `"Email address looks right."` |
| `showSuccess` | `boolean` | `false` |
| `busy` | `boolean` | `false` |
| `clearable` | `boolean` | `false` |
| `clearLabel` | `string` | `"Clear email address"` |
| `suggestDomains` | `readonly string[]` | - |
| `onSuggestionAccept` | `(value: string) => void` | - |
| `requiredIndicator` | `ReactNode` | `"*"` |
| `optionalIndicator` | `ReactNode` | - |

The ref exposes `focus()`, `select()`, `clear()`, `validate()`, `value` and `element`.
`validate()` runs the rules immediately and returns the result, which is what a form
should call on submit before moving focus to the first failing field.

</details>

## Validation rules

| Rule | Default | Effect |
| --- | --- | --- |
| `required` | `false` | Empty values pass unless this is set. |
| `pattern` | WHATWG production | The same expression browsers apply to `type="email"`. |
| `maxLength` | `254` | RFC 5321 section 4.5.3.1. |
| `maxLocalPartLength` | `64` | RFC 5321 section 4.5.3.1. |
| `requireTld` | `true` | Rejects `user@localhost`. |
| `allowPlusAddressing` | `true` | Set false to reject `name+tag@`. |
| `allowedDomains` | `[]` | Case-insensitive allow list. |
| `blockedDomains` | `[]` | Applied after the allow list. |
| `normalise` | `true` | Trims and lowercases before validating. |

`validateEmail` returns `{ valid, code, message, value }`. Store `value`, not the raw
input: it is the trimmed, lowercased form.

Replace any message for translation, keyed by code:

{% raw %}
```tsx
<EmailInput
  label="Rangitaki īmēra"
  rules={{ required: true }}
  messages={{ required: "Whakaurua he wāhitau īmēra." }}
/>
```
{% endraw %}

{% agent validation-contract %}
Validation semantics an agent should not guess at:

- An empty string is VALID unless rules.required is true. This is deliberate: an optional
  field must not error when left blank. Do not add a required check in product code.
- Rules are evaluated in a fixed order and the first failure wins:
  required, maxLength, pattern, maxLocalPartLength, allowPlusAddressing, requireTld,
  allowedDomains, blockedDomains. blockedDomains is checked AFTER allowedDomains, so a
  domain on both lists is rejected.
- result.value is the normalised value. result.message is null when valid.
- Codes: required | format | tooLong | localPartTooLong | missingTld | domainNotAllowed |
  domainBlocked | plusAddressingNotAllowed | custom.
- asyncValidate runs ONLY on blur and on ref.validate(), never per keystroke. Returning a
  string marks the field invalid with that string. Returning null marks it valid. Stale
  responses are discarded by token comparison, so a slow first request cannot overwrite a
  fast second one. A rejected promise leaves the previous state in place; catch inside
  asyncValidate if the product needs to surface transport failures.
- The component does NOT set maxLength on the input element. Truncating a paste silently
  is worse than reporting it, so over-length values are reported through the tooLong code.

Server-side parity: import validateEmail from @ds/ui/validation and pass the same
rules object. Same input, same result, no React needed.
{% endagent %}

## Accessibility

| Criterion | How it is met |
| --- | --- |
| 1.3.5 Identify Input Purpose (AA) | `autocomplete="email"` by default |
| 1.4.1 Use of Colour (A) | Every state carries an icon and text, not just a border colour |
| 1.4.6 Contrast Enhanced (AAA) | Label, value, helper and message text at 7:1 or better |
| 1.4.11 Non-text Contrast (AA) | Borders and focus ring at 3:1 or better |
| 2.4.13 Focus Appearance (AAA) | 3px ring, offset 2px, at 7.79:1 against the field |
| 2.5.5 Target Size Enhanced (AAA) | 44px control at `md`, 52px at `lg` |
| 3.3.1 Error Identification (A) | Error text in a `polite` live region, `aria-invalid` on the input |
| 3.3.2 Labels or Instructions (A) | `label` is a required prop |
| 3.3.3 Error Suggestion (AA) | Messages say what to do; `suggestDomains` offers the fix |

Two honest exceptions:

- `size="sm"` gives a 32px control. That clears WCAG 2.5.8 Target Size Minimum (24px, AA)
  but not 2.5.5 Enhanced (44px, AAA). Use `md` or `lg` where AAA is mandated.
- The field sets the native `required` attribute. Put `noValidate` on the form so the
  browser bubble does not compete with the component message.

{% agent accessibility-implementation %}
Accessibility wiring, so an agent editing the component does not undo it:

- aria-describedby is composed in source order: description id, then messages id, then any
  consumer-supplied aria-describedby. The messages id is only included when a message is
  actually present, but the container is rendered on EVERY pass. Do not conditionally
  render the container itself; a live region that appears at the same moment as its
  content is not announced.
- The live region is aria-live="polite" with aria-atomic="true". It is NOT role="alert".
  Validation fires on blur, where an assertive interruption cuts across the user moving to
  the next field.
- The required asterisk is aria-hidden. Required state reaches assistive technology from
  the native required attribute, not from the glyph. Do not add aria-required as well.
- Status icons are aria-hidden and decorative. The meaning is in the message text.
- The clear button is a real button with an aria-label from clearLabel, sized to the full
  control height so its hit area matches the field.
- -webkit-text-fill-color is set on the disabled input because Safari ignores `color` on a
  disabled input, which would drop the value below contrast.
- A forced-colors block restates borders and outlines in system keywords. Authored colours
  are discarded in Windows High Contrast; without it the field loses its boundary.

Two layers check this rather than one. scripts/check-contrast.mjs computes 25 token pairs per
theme against the ratio each one needs. e2e/accessibility.spec.ts then runs axe over the
rendered DOM of every page in both themes, at WCAG A and AA plus the 1.4.6 AAA contrast
rule, which is what catches a colour used somewhere the token check never anticipated.
{% endagent %}

## Recipes

Handing validation to a form library:

```tsx
<EmailInput
  label="Email address"
  validateOn="manual"
  value={field.value}
  onValueChange={field.onChange}
  invalid={Boolean(fieldState.error)}
  errorMessage={fieldState.error?.message}
/>
```

Checking an address against a service, without a request per keystroke:

{% raw %}
```tsx
<EmailInput
  label="Email address"
  rules={{ required: true }}
  asyncValidate={async (value) => {
    const response = await fetch(`/api/email/available?value=${encodeURIComponent(value)}`);
    const { available } = await response.json();
    return available ? null : "That address is already registered.";
  }}
/>
```
{% endraw %}

Focusing the first failing field on submit:

```tsx
const emailRef = useRef<EmailInputHandle>(null);

const onSubmit = (event: FormEvent) => {
  event.preventDefault();
  const result = emailRef.current?.validate();
  if (!result?.valid) return emailRef.current?.focus();
  submit({ email: result.value });
};
```
