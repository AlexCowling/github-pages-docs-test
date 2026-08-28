import {
  forwardRef,
  useCallback,
  useId,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ChangeEvent, FocusEvent } from "react";
import { suggestEmailDomain, validateEmail } from "../../validation";
import type { EmailValidationResult } from "../../validation";
import { BusyIcon, ClearIcon, ErrorIcon, SuccessIcon } from "./icons";
import type { EmailInputHandle, EmailInputProps } from "./types";

const joinIds = (...ids: (string | false | undefined | null)[]) =>
  ids.filter(Boolean).join(" ") || undefined;

export const EmailInput = forwardRef<EmailInputHandle, EmailInputProps>(function EmailInput(
  {
    label,
    hideLabel = false,
    description,
    value: controlledValue,
    defaultValue = "",
    onValueChange,
    onChange,
    onBlur,
    size = "md",
    rules,
    messages,
    validateOn = "blur",
    revalidateOn = "change",
    onValidate,
    asyncValidate,
    invalid,
    errorMessage,
    successMessage = "Email address looks right.",
    showSuccess = false,
    busy = false,
    clearable = false,
    clearLabel = "Clear email address",
    suggestDomains,
    onSuggestionAccept,
    requiredIndicator = "*",
    optionalIndicator,
    className,
    id,
    autoComplete = "email",
    ...rest
  },
  ref,
) {
  const reactId = useId();
  const inputId = id ?? `${reactId}-input`;
  const descriptionId = `${reactId}-description`;
  const messagesId = `${reactId}-messages`;

  const inputRef = useRef<HTMLInputElement>(null);
  const asyncToken = useRef(0);

  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const [result, setResult] = useState<EmailValidationResult | null>(null);
  const [touched, setTouched] = useState(false);
  const [asyncMessage, setAsyncMessage] = useState<string | null>(null);
  const [asyncPending, setAsyncPending] = useState(false);

  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;
  const required = rules?.required ?? false;

  const runValidation = useCallback(
    (next: string) => {
      const outcome = validateEmail(next, rules, messages);
      setResult(outcome);
      setTouched(true);
      setAsyncMessage(null);
      onValidate?.(outcome);
      return outcome;
    },
    // Consumers usually pass object literals, so these identities churn every
    // render. Validation only ever runs from an event, never an effect, so a
    // changing callback identity cannot cause a loop.
    [rules, messages, onValidate],
  );

  // Triggered by blur or an explicit validate() only, never by a keystroke, so
  // a remote lookup is not called once per character typed.
  const runAsyncValidation = useCallback(
    async (next: string) => {
      if (!asyncValidate) return;
      const token = asyncToken.current + 1;
      asyncToken.current = token;
      setAsyncPending(true);
      try {
        const outcome = await asyncValidate(next);
        if (token !== asyncToken.current) return;
        if (typeof outcome === "string") setAsyncMessage(outcome);
        else if (outcome && !outcome.valid) setAsyncMessage(outcome.message);
        else setAsyncMessage(null);
      } finally {
        if (token === asyncToken.current) setAsyncPending(false);
      }
    },
    [asyncValidate],
  );

  const commitValue = useCallback(
    (next: string) => {
      if (!isControlled) setUncontrolledValue(next);
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    commitValue(next);
    onChange?.(event);
    setAsyncMessage(null);
    if (validateOn === "change" || (touched && revalidateOn === "change")) {
      runValidation(next);
    }
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    onBlur?.(event);
    const shouldValidate =
      validateOn === "blur" || validateOn === "change" || (touched && revalidateOn === "blur");
    if (!shouldValidate) return;
    const outcome = runValidation(event.target.value);
    if (outcome.valid && outcome.value.length > 0) void runAsyncValidation(outcome.value);
  };

  const clear = useCallback(() => {
    commitValue("");
    setResult(null);
    setTouched(false);
    setAsyncMessage(null);
    asyncToken.current += 1;
    inputRef.current?.focus();
  }, [commitValue]);

  useImperativeHandle(
    ref,
    () => ({
      focus: (options?: FocusOptions) => inputRef.current?.focus(options),
      select: () => inputRef.current?.select(),
      clear,
      validate: () => runValidation(value),
      get value() {
        return value;
      },
      get element() {
        return inputRef.current;
      },
    }),
    [clear, runValidation, value],
  );

  const internalInvalid = (touched && result !== null && !result.valid) || asyncMessage !== null;
  const isInvalid =
    invalid ?? (errorMessage !== undefined ? errorMessage.length > 0 : internalInvalid);
  const errorText = isInvalid ? (errorMessage ?? asyncMessage ?? result?.message ?? null) : null;

  const suggestion = useMemo(() => {
    if (!suggestDomains?.length || !touched || value.length === 0) return null;
    return suggestEmailDomain(value, suggestDomains);
  }, [suggestDomains, touched, value]);

  const isSuccessful =
    showSuccess &&
    !isInvalid &&
    !asyncPending &&
    touched &&
    value.length > 0 &&
    result?.valid === true;

  const acceptSuggestion = () => {
    if (!suggestion) return;
    commitValue(suggestion);
    onSuggestionAccept?.(suggestion);
    runValidation(suggestion);
    inputRef.current?.focus();
  };

  const showBusy = busy || asyncPending;
  const hasMessages = Boolean(errorText || suggestion || (isSuccessful && successMessage));

  return (
    <div
      className={["ds-field", className].filter(Boolean).join(" ")}
      data-size={size}
      data-invalid={isInvalid || undefined}
      data-valid={isSuccessful || undefined}
      data-disabled={rest.disabled || undefined}
      data-readonly={rest.readOnly || undefined}
      data-busy={showBusy || undefined}
    >
      <label
        className={hideLabel ? "ds-field__label ds-visually-hidden" : "ds-field__label"}
        htmlFor={inputId}
      >
        {label}
        {required && requiredIndicator ? (
          <span className="ds-field__required" aria-hidden="true">
            {requiredIndicator}
          </span>
        ) : null}
        {!required && optionalIndicator ? (
          <span className="ds-field__optional">{optionalIndicator}</span>
        ) : null}
      </label>

      {description ? (
        <p className="ds-field__description" id={descriptionId}>
          {description}
        </p>
      ) : null}

      <div className="ds-field__control">
        <input
          {...rest}
          ref={inputRef}
          id={inputId}
          type="email"
          inputMode="email"
          autoComplete={autoComplete}
          spellCheck={false}
          autoCapitalize="none"
          autoCorrect="off"
          className="ds-field__input"
          value={value}
          required={required}
          aria-invalid={isInvalid || undefined}
          aria-describedby={joinIds(
            description ? descriptionId : null,
            hasMessages ? messagesId : null,
            rest["aria-describedby"],
          )}
          onChange={handleChange}
          onBlur={handleBlur}
        />

        <span className="ds-field__adornment">
          {showBusy ? <BusyIcon /> : null}
          {!showBusy && isInvalid ? <ErrorIcon /> : null}
          {!showBusy && isSuccessful ? <SuccessIcon /> : null}
          {clearable && value.length > 0 && !rest.disabled && !rest.readOnly ? (
            <button
              type="button"
              className="ds-field__clear"
              onClick={clear}
              aria-label={clearLabel}
            >
              <ClearIcon />
            </button>
          ) : null}
        </span>
      </div>

      {/*
        Rendered on every pass so assistive technology is already observing the
        region before a message arrives. Polite rather than assertive:
        validation fires on blur, where an interruption is disorienting.
      */}
      <div className="ds-field__messages" id={messagesId} aria-live="polite" aria-atomic="true">
        {errorText ? (
          <p className="ds-field__message ds-field__message--error">
            <ErrorIcon />
            <span>{errorText}</span>
          </p>
        ) : null}

        {suggestion ? (
          <p className="ds-field__message ds-field__message--suggestion">
            <span>Did you mean </span>
            <button type="button" className="ds-field__suggestion" onClick={acceptSuggestion}>
              {suggestion}
            </button>
            <span>?</span>
          </p>
        ) : null}

        {isSuccessful && successMessage ? (
          <p className="ds-field__message ds-field__message--success">
            <SuccessIcon />
            <span>{successMessage}</span>
          </p>
        ) : null}
      </div>
    </div>
  );
});
