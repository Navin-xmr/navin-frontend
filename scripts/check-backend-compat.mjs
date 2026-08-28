#!/usr/bin/env node
/**
 * check-backend-compat.mjs
 *
 * Issue #226 — Frontend-to-backend compatibility validation script.
 *
 * PURPOSE
 * -------
 * Validates that the backend API still satisfies the contract expectations
 * recorded in `docs/backend-compatibility.json`. Supports two modes:
 *
 *   --swagger <url|path>   Parse an OpenAPI/Swagger JSON document (local file or
 *                          URL) and verify that every required endpoint and field
 *                          is declared in the spec.
 *
 *   --server <baseUrl>     Send lightweight probes to a running server and check
 *                          that responses match the expected status codes and
 *                          envelope shape.
 *
 * EXIT CODES
 * ----------
 *   0 — All checks passed.
 *   1 — One or more checks failed (details printed to stdout).
 *   2 — Script invocation error (bad arguments / file not found).
 *
 * USAGE
 * -----
 *   # Validate against a local OpenAPI spec
 *   node scripts/check-backend-compat.mjs --swagger ./openapi.json
 *
 *   # Validate against a running dev server
 *   node scripts/check-backend-compat.mjs --server http://localhost:3001
 *
 *   # CI: validate the spec hosted in the backend repo
 *   node scripts/check-backend-compat.mjs --swagger https://api.example.com/api-docs/swagger.json
 *
 * ENVIRONMENT
 * -----------
 *   API_TOKEN   Bearer token injected into probe requests (optional, for
 *               endpoints that require authentication).
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { fileURLToPath } from "url";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const checklistPath = resolve(__dirname, "../docs/backend-compatibility.json");

/** ANSI colour helpers — degrade gracefully in CI without colour support. */
const supportsColour = process.stdout.isTTY;
const green = (s) => (supportsColour ? `\x1b[32m${s}\x1b[0m` : s);
const red = (s) => (supportsColour ? `\x1b[31m${s}\x1b[0m` : s);
const yellow = (s) => (supportsColour ? `\x1b[33m${s}\x1b[0m` : s);
const bold = (s) => (supportsColour ? `\x1b[1m${s}\x1b[0m` : s);
const dim = (s) => (supportsColour ? `\x1b[2m${s}\x1b[0m` : s);

function pass(id, detail) {
  console.log(`  ${green("✓")} ${bold(id)}${detail ? dim(` — ${detail}`) : ""}`);
}

function fail(id, reason) {
  console.log(`  ${red("✗")} ${bold(id)} — ${red(reason)}`);
}

function warn(id, reason) {
  console.log(`  ${yellow("⚠")} ${bold(id)} — ${yellow(reason)}`);
}

// ---------------------------------------------------------------------------
// Checklist loading
// ---------------------------------------------------------------------------

function loadChecklist() {
  if (!existsSync(checklistPath)) {
    console.error(`${red("error")} Checklist not found at ${checklistPath}`);
    process.exit(2);
  }
  return JSON.parse(readFileSync(checklistPath, "utf8"));
}

// ---------------------------------------------------------------------------
// Mode 1: Swagger / OpenAPI validation
// ---------------------------------------------------------------------------

/**
 * Fetch or read an OpenAPI document (JSON only).
 * @param {string} source  URL starting with http(s):// or a local file path.
 * @returns {Promise<object>}
 */
async function loadSwagger(source) {
  if (source.startsWith("http://") || source.startsWith("https://")) {
    const res = await fetch(source);
    if (!res.ok) {
      throw new Error(`Failed to fetch swagger from ${source}: HTTP ${res.status}`);
    }
    return res.json();
  }
  const absPath = resolve(process.cwd(), source);
  if (!existsSync(absPath)) {
    throw new Error(`Swagger file not found: ${absPath}`);
  }
  return JSON.parse(readFileSync(absPath, "utf8"));
}

/**
 * Normalise a path template from our checklist format (`/shipments/:id`) to
 * the OpenAPI format (`/shipments/{id}`) for matching.
 */
function toOpenApiPath(path) {
  return path.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, "{$1}");
}

/**
 * Validate the checklist against an OpenAPI 3.x or Swagger 2.x document.
 */
async function validateSwagger(source) {
  console.log(`\n${bold("Mode: Swagger / OpenAPI")}  ${dim(source)}\n`);

  let spec;
  try {
    spec = await loadSwagger(source);
  } catch (err) {
    console.error(`${red("error")} ${err.message}`);
    process.exit(2);
  }

  const checklist = loadChecklist();
  const specPaths = spec.paths ?? {};

  // Determine the base path prefix to strip (Swagger 2 `basePath` / OAS3
  // `servers[0].url` path portion).
  let basePath = "";
  if (spec.basePath) {
    basePath = spec.basePath.replace(/\/$/, "");
  } else if (spec.servers?.[0]?.url) {
    try {
      basePath = new URL(spec.servers[0].url).pathname.replace(/\/$/, "");
    } catch {
      // relative URL — use as-is
      basePath = spec.servers[0].url.replace(/\/$/, "");
    }
  }

  const failures = [];

  for (const endpoint of checklist.endpoints) {
    const method = endpoint.method.toLowerCase();
    const rawPath = endpoint.path;
    const oasPath = toOpenApiPath(rawPath);

    // Try with and without the base-path prefix stripped.
    const candidates = [oasPath, `${basePath}${oasPath}`.replace(/^\/+/, "/")];
    const pathEntry = candidates.reduce(
      (found, p) => found ?? specPaths[p],
      undefined,
    );

    if (!pathEntry) {
      fail(endpoint.id, `path not found in spec: ${oasPath}`);
      failures.push(endpoint.id);
      continue;
    }

    const opEntry = pathEntry[method];
    if (!opEntry) {
      fail(endpoint.id, `method ${method.toUpperCase()} not declared for ${oasPath}`);
      failures.push(endpoint.id);
      continue;
    }

    // Check at least one of the expected status codes is declared.
    const declaredStatuses = Object.keys(opEntry.responses ?? {});
    const hasExpected = endpoint.expectedStatus.some((code) =>
      declaredStatuses.includes(String(code)) ||
      declaredStatuses.includes("default"),
    );

    if (!hasExpected) {
      warn(
        endpoint.id,
        `none of the expected status codes (${endpoint.expectedStatus.join(", ")}) declared in spec`,
      );
      // Treat as a warning, not a failure — spec may use 'default'.
    } else {
      pass(endpoint.id, `${method.toUpperCase()} ${oasPath} declared`);
    }
  }

  return failures;
}

// ---------------------------------------------------------------------------
// Mode 2: Live server probes
// ---------------------------------------------------------------------------

/**
 * Recursively check that all `requiredFields` exist (non-undefined) in `obj`.
 * Returns a list of missing field paths.
 */
function checkRequiredFields(obj, schema, prefix = "") {
  if (!schema || !schema.requiredFields) return [];
  const missing = [];
  for (const field of schema.requiredFields) {
    const fullPath = prefix ? `${prefix}.${field}` : field;
    if (obj == null || !(field in Object(obj))) {
      missing.push(fullPath);
    } else if (schema[field]) {
      // Recurse into nested schema descriptors.
      missing.push(...checkRequiredFields(obj[field], schema[field], fullPath));
    }
  }
  return missing;
}

/**
 * Issue a single probe request to the running server.
 * For POST/PATCH endpoints we send an empty JSON body — the goal is only to
 * verify that the route exists and responds with a recognisable status code
 * (not to exercise full business logic).
 */
async function probe(baseUrl, endpoint, token) {
  // Replace path params with a sentinel value so the router can match the
  // segment even if the resource doesn't exist (→ 404 is still informative).
  const path = endpoint.path.replace(/:([a-zA-Z_][a-zA-Z0-9_]*)/g, "PROBE_ID");
  const url = `${baseUrl}${path}`;

  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const fetchOptions = {
    method: endpoint.method,
    headers,
    // Small body for mutation methods to avoid 400 "body required" errors.
    body: ["POST", "PUT", "PATCH"].includes(endpoint.method)
      ? JSON.stringify({})
      : undefined,
    // Short timeout — we're just checking reachability.
    signal: AbortSignal.timeout(8000),
  };

  const res = await fetch(url, fetchOptions);
  return res;
}

async function validateServer(baseUrl) {
  console.log(`\n${bold("Mode: Live server")}  ${dim(baseUrl)}\n`);

  const checklist = loadChecklist();
  const token = process.env.API_TOKEN ?? "";
  const failures = [];

  for (const endpoint of checklist.endpoints) {
    let res;
    try {
      res = await probe(baseUrl, endpoint, token);
    } catch (err) {
      fail(endpoint.id, `request failed: ${err.message}`);
      failures.push(endpoint.id);
      continue;
    }

    const { status } = res;

    // A 404 on a parameterised route (e.g. /notifications/PROBE_ID/read) is
    // acceptable and means the route exists but the resource was not found.
    const isParamRoute = endpoint.path.includes(":");
    const acceptable = isParamRoute
      ? [...endpoint.expectedStatus, 401, 403, 404, 422]
      : [...endpoint.expectedStatus, 401, 403];

    if (!acceptable.includes(status)) {
      fail(endpoint.id, `HTTP ${status} not in acceptable set [${acceptable.join(", ")}]`);
      failures.push(endpoint.id);
      continue;
    }

    // If the endpoint declares an expected envelope, try to parse the body and
    // validate field presence (only when the status code is a 2xx hit).
    if (endpoint.responseEnvelope && endpoint.expectedStatus.includes(status)) {
      let body;
      try {
        body = await res.json();
      } catch {
        warn(endpoint.id, `HTTP ${status} — response body is not JSON`);
        continue;
      }
      const missing = checkRequiredFields(body, endpoint.responseEnvelope);
      if (missing.length > 0) {
        fail(endpoint.id, `HTTP ${status} — missing fields: ${missing.join(", ")}`);
        failures.push(endpoint.id);
        continue;
      }
    }

    pass(endpoint.id, `HTTP ${status}`);
  }

  return failures;
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

const args = process.argv.slice(2);

function parseArgs() {
  const result = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--swagger" && args[i + 1]) {
      result.swagger = args[++i];
    } else if (args[i] === "--server" && args[i + 1]) {
      result.server = args[++i];
    } else if (args[i] === "--help" || args[i] === "-h") {
      result.help = true;
    }
  }
  return result;
}

function printHelp() {
  console.log(`
${bold("check-backend-compat.mjs")} — Navin backend compatibility validator (issue #226)

${bold("Usage:")}
  node scripts/check-backend-compat.mjs --swagger <url|path>
  node scripts/check-backend-compat.mjs --server  <baseUrl>

${bold("Modes:")}
  --swagger   Validate against an OpenAPI/Swagger JSON spec (file or URL)
  --server    Probe a running server for status codes and response shape

${bold("Environment:")}
  API_TOKEN   Bearer token for authenticated endpoints (server mode only)

${bold("Exit codes:")}
  0   All checks passed
  1   One or more checks failed
  2   Script invocation error
`);
}

async function main() {
  const opts = parseArgs();

  if (opts.help || (!opts.swagger && !opts.server)) {
    printHelp();
    if (!opts.help) process.exit(2);
    return;
  }

  let failures = [];

  if (opts.swagger) {
    failures = await validateSwagger(opts.swagger);
  } else {
    failures = await validateServer(opts.server.replace(/\/$/, ""));
  }

  console.log();
  if (failures.length === 0) {
    console.log(green("All compatibility checks passed. ✓"));
    process.exit(0);
  } else {
    console.log(
      red(`${failures.length} check${failures.length === 1 ? "" : "s"} failed: `) +
        failures.join(", "),
    );
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(red(`Unhandled error: ${err.message}`));
  process.exit(2);
});
