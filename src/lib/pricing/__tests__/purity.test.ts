import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

// Phase 2 lifts src/lib/pricing/ into a standalone service for the Telegram bot,
// and that has to be a file move rather than a rewrite (D-001). A framework
// import sneaking in is the one change that would break it, and it would not
// show up in any pricing assertion — so it gets its own guard.
const DIR = join(__dirname, "..");
const SOURCES = readdirSync(DIR).filter((f) => f.endsWith(".ts"));

const FORBIDDEN = [
  { label: "next", pattern: /from\s+["']next[/"']/ },
  { label: "react", pattern: /from\s+["']react/ },
  { label: "@prisma/client", pattern: /from\s+["']@prisma\// },
  { label: "server-only", pattern: /["']server-only["']/ },
  { label: "process.env", pattern: /process\.env/ },
];

describe("the pricing module stays framework-free", () => {
  it("has sources to check", () => {
    expect(SOURCES.length).toBeGreaterThan(0);
  });

  it.each(SOURCES)("%s imports nothing forbidden", (file) => {
    const source = readFileSync(join(DIR, file), "utf8");
    for (const { label, pattern } of FORBIDDEN) {
      expect(pattern.test(source), `${file} must not reference ${label}`).toBe(false);
    }
  });

  it.each(SOURCES)("%s only imports from within the module", (file) => {
    const source = readFileSync(join(DIR, file), "utf8");
    const imports = [...source.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => m[1]);
    for (const specifier of imports) {
      expect(specifier.startsWith("./"), `${file} imports ${specifier}`).toBe(true);
    }
  });
});
