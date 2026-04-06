import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

test("globals.css defines --spacing when var(--spacing) is used", () => {
  const cssPath = resolve(process.cwd(), "app", "globals.css");
  const content = readFileSync(cssPath, "utf8");

  if (!content.includes("var(--spacing)")) {
    return;
  }

  assert.match(
    content,
    /--spacing\s*:/,
    "globals.css uses var(--spacing) but does not define --spacing",
  );
});
