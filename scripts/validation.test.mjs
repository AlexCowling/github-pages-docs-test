import assert from "node:assert/strict";
import test from "node:test";
import { bundleModule } from "./bundle-ts.mjs";

const { validateEmail, suggestEmailDomain, DEFAULT_RULES } = await bundleModule(
  "src/validation/index.ts",
);

test("accepts a conventional address", () => {
  const result = validateEmail("ana.silva@titanium.solutions");
  assert.equal(result.valid, true);
  assert.equal(result.code, null);
});

test("normalises case and surrounding whitespace by default", () => {
  const result = validateEmail("  Ana.Silva@Titanium.Solutions  ");
  assert.equal(result.value, "ana.silva@titanium.solutions");
  assert.equal(result.valid, true);
});

test("leaves the value untouched when normalise is off", () => {
  const result = validateEmail(" Ana@Example.com ", { normalise: false });
  assert.equal(result.value, " Ana@Example.com ");
  assert.equal(result.valid, false);
  assert.equal(result.code, "format");
});

test("an empty value passes unless required", () => {
  assert.equal(validateEmail("").valid, true);
  assert.equal(validateEmail("", { required: true }).code, "required");
});

test("rejects addresses the WHATWG production rejects", () => {
  for (const bad of ["plainstring", "no@domain@twice.com", "@example.com", "name@", "a b@example.com"]) {
    assert.equal(validateEmail(bad).valid, false, `expected ${bad} to be rejected`);
  }
});

test("requires a dot in the domain unless requireTld is off", () => {
  assert.equal(validateEmail("ana@localhost").code, "missingTld");
  assert.equal(validateEmail("ana@localhost", { requireTld: false }).valid, true);
});

test("enforces the RFC 5321 length limits", () => {
  const longLocal = `${"a".repeat(65)}@example.com`;
  assert.equal(validateEmail(longLocal).code, "localPartTooLong");

  const longAddress = `${"a".repeat(250)}@example.com`;
  assert.equal(validateEmail(longAddress).code, "tooLong");
  assert.equal(DEFAULT_RULES.maxLength, 254);
  assert.equal(DEFAULT_RULES.maxLocalPartLength, 64);
});

test("allow list and deny list are case insensitive", () => {
  const rules = { allowedDomains: ["Titanium.Solutions"] };
  assert.equal(validateEmail("ana@TITANIUM.SOLUTIONS", rules).valid, true);
  assert.equal(validateEmail("ana@example.com", rules).code, "domainNotAllowed");

  const blocked = { blockedDomains: ["Example.COM"] };
  assert.equal(validateEmail("ana@example.com", blocked).code, "domainBlocked");
});

test("the deny list is applied after the allow list", () => {
  const result = validateEmail("ana@example.com", {
    allowedDomains: ["example.com"],
    blockedDomains: ["example.com"],
  });
  assert.equal(result.code, "domainBlocked");
});

test("plus addressing can be switched off", () => {
  assert.equal(validateEmail("ana+tag@example.com").valid, true);
  assert.equal(
    validateEmail("ana+tag@example.com", { allowPlusAddressing: false }).code,
    "plusAddressingNotAllowed",
  );
});

test("messages can be replaced per code for translation", () => {
  const result = validateEmail("", { required: true }, { required: "Kia ora, we need an email." });
  assert.equal(result.message, "Kia ora, we need an email.");
});

test("message functions receive the resolved rules", () => {
  const result = validateEmail("ana@wrong.com", { allowedDomains: ["titanium.solutions"] });
  assert.match(result.message, /titanium\.solutions/);
});

test("suggests a correction for a near-miss domain", () => {
  assert.equal(suggestEmailDomain("ana@gmial.com", ["gmail.com"]), "ana@gmail.com");
  assert.equal(suggestEmailDomain("ana@outlok.com", ["gmail.com", "outlook.com"]), "ana@outlook.com");
});

test("does not suggest when the domain is already known or is far away", () => {
  assert.equal(suggestEmailDomain("ana@gmail.com", ["gmail.com"]), null);
  assert.equal(suggestEmailDomain("ana@titanium.solutions", ["gmail.com"]), null);
  assert.equal(suggestEmailDomain("no-at-sign", ["gmail.com"]), null);
});
