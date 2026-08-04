import { readFileSync } from "node:fs";

// CLAUDE.md: a missing uz or ru key is a build-time failure, not a runtime
// fallback. next-intl would silently fall back, so the check lives here and
// runs from prebuild.
const locales = ["en", "uz", "ru"];
const reference = "en";

const flatten = (obj, prefix = "") =>
  Object.entries(obj).flatMap(([key, value]) =>
    value && typeof value === "object"
      ? flatten(value, `${prefix}${key}.`)
      : [`${prefix}${key}`]
  );

const keys = Object.fromEntries(
  locales.map((locale) => [
    locale,
    new Set(
      flatten(
        JSON.parse(
          readFileSync(new URL(`../src/i18n/messages/${locale}.json`, import.meta.url), "utf8")
        )
      )
    ),
  ])
);

const problems = [];
for (const locale of locales.filter((l) => l !== reference)) {
  for (const key of keys[reference]) {
    if (!keys[locale].has(key)) problems.push(`${locale}: missing ${key}`);
  }
  for (const key of keys[locale]) {
    if (!keys[reference].has(key)) problems.push(`${locale}: extra ${key}`);
  }
}

if (problems.length) {
  console.error(`Message key mismatch:\n${problems.join("\n")}`);
  process.exit(1);
}

console.log(`Messages OK — ${keys[reference].size} keys x ${locales.length} locales`);
