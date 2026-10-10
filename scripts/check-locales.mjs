#!/usr/bin/env node
/**
 * check-locales.mjs
 *
 * Issue #902 — every locale must expose the same translation keys.
 *
 * English is the reference. For each namespace file under
 * `frontend/src/locales/en`, every other locale must have the same file with
 * exactly the same key paths. A key missing from a locale silently falls back
 * to English at runtime; a key that only exists in a locale is dead copy.
 *
 * EXIT CODES
 *   0 — all locales match the reference.
 *   1 — at least one namespace file or key is missing or unexpected.
 *
 * USAGE
 *   node scripts/check-locales.mjs          # from the repo root
 *   pnpm run check:locales                  # from frontend/
 */

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REFERENCE_LOCALE = 'en';
const LOCALES_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'frontend', 'src', 'locales');

/** Flattens nested translation objects into dotted key paths. */
function keyPaths(value, prefix = '') {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return [prefix];
  }
  return Object.entries(value).flatMap(([key, child]) =>
    keyPaths(child, prefix ? `${prefix}.${key}` : key),
  );
}

function readNamespace(locale, file) {
  return JSON.parse(readFileSync(join(LOCALES_DIR, locale, file), 'utf8'));
}

function namespaceFiles(locale) {
  return readdirSync(join(LOCALES_DIR, locale))
    .filter((file) => file.endsWith('.json'))
    .sort();
}

const locales = readdirSync(LOCALES_DIR)
  .filter((entry) => statSync(join(LOCALES_DIR, entry)).isDirectory())
  .sort();

if (!locales.includes(REFERENCE_LOCALE)) {
  console.error(`Reference locale "${REFERENCE_LOCALE}" not found in ${LOCALES_DIR}`);
  process.exit(1);
}

const referenceFiles = namespaceFiles(REFERENCE_LOCALE);
const problems = [];

for (const locale of locales) {
  if (locale === REFERENCE_LOCALE) continue;

  const files = namespaceFiles(locale);
  for (const file of referenceFiles) {
    if (!files.includes(file)) problems.push(`${locale}/${file}: file is missing`);
  }
  for (const file of files) {
    if (!referenceFiles.includes(file)) {
      problems.push(`${locale}/${file}: no matching ${REFERENCE_LOCALE}/${file}`);
    }
  }

  for (const file of referenceFiles.filter((name) => files.includes(name))) {
    const expected = new Set(keyPaths(readNamespace(REFERENCE_LOCALE, file)));
    const actual = new Set(keyPaths(readNamespace(locale, file)));

    for (const key of expected) {
      if (!actual.has(key)) problems.push(`${locale}/${file}: missing key "${key}"`);
    }
    for (const key of actual) {
      if (!expected.has(key)) {
        problems.push(`${locale}/${file}: key "${key}" is not in ${REFERENCE_LOCALE}/${file}`);
      }
    }
  }
}

if (problems.length > 0) {
  console.error(`Locale check failed — ${problems.length} problem(s):\n`);
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}

console.log(
  `Locale check passed — ${locales.length} locales, ${referenceFiles.length} namespaces each.`,
);
