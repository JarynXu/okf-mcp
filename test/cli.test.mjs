import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { buildCliInvocation, runOkfCli } from "../src/cli.mjs";

test("builds stable Library-aware search arguments", () => {
  const invocation = buildCliInvocation("okf_search", {
    bundle: "knowledge",
    registry: "state/libraries.json",
    query: "runtime architecture",
    tags: ["architecture"],
    library: "docs",
    limit: 7
  }, { OKF_CLI_PATH: "custom-okf" });
  assert.equal(invocation.executable, "custom-okf");
  assert.ok(invocation.args.includes("--registry"));
  assert.deepEqual(invocation.args.slice(-8), [
    "search", "runtime architecture", "--tag", "architecture", "--library", "docs", "--limit", "7"
  ]);
});

test("builds Library management CLI arguments with an explicit registry", () => {
  const invocation = buildCliInvocation("okf_library_mount", {
    registry: "state/libraries.json",
    id: "mcx"
  }, { OKF_CLI_PATH: "custom-okf" });
  assert.equal(invocation.executable, "custom-okf");
  assert.ok(invocation.args.includes("--registry"));
  assert.deepEqual(invocation.args.slice(-3), ["library", "mount", "mcx"]);
});

test("executes a CLI override and parses its envelope", { skip: process.platform === "win32" }, () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "okf-mcp-cli-"));
  const fake = path.join(directory, "okf");
  fs.writeFileSync(fake, `#!/usr/bin/env node\nconsole.log(JSON.stringify({schema_version:"1",ok:true,command:"list",data:[{id:"a"}]}));\n`, { mode: 0o755 });
  try {
    const result = runOkfCli("okf_list", {}, { environment: { ...process.env, OKF_CLI_PATH: fake, OKF_BUNDLE: directory } });
    assert.equal(result.isError, false);
    assert.deepEqual(result.structuredContent, [{ id: "a" }]);
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
