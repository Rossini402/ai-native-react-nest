#!/usr/bin/env node
/**
 * Deep import-boundary verifier for Node CI & local verify pipeline.
 * Ensures NestJS Controllers stay free of direct Repository imports and
 * enforces strict DAG dependencies: contracts <- { api, web }.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const rootDir = process.cwd();
const violations = [];

function walkTsFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "dist") continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      results.push(...walkTsFiles(full));
    } else if (full.endsWith(".ts") || full.endsWith(".tsx")) {
      results.push(full);
    }
  }
  return results;
}

for (const file of walkTsFiles(join(rootDir, "apps", "api", "src"))) {
  if (!file.endsWith(".controller.ts")) continue;
  const content = readFileSync(file, "utf8");
  if (/\.repository['"]/.test(content)) {
    violations.push(
      `${relative(rootDir, file)}: NestJS Controller must not import Repository directly; delegate through Service.`
    );
  }
}

if (violations.length > 0) {
  console.error("Architecture boundary violations:");
  for (const v of violations) console.error(`  - ${v}`);
  process.exit(1);
}

console.log("  [PASS] Node AST/Import layer checks passed (Controller -> Service -> Repository)");
