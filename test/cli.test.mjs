import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { buildCliInvocation, runOkfCli } from "../src/cli.mjs";

test("builds stable CLI arguments", () => {
  const invocation = buildCliInvocation("okf_search", {
    bundle: "knowledge",
    query: "runtime architecture",
    tags: ["architecture"],
    limit: 7
  }, { OKF_CLI_PATH: "custom-okf" });
  assert.equal(invocation.executable, "custom-okf");
  assert.deepEqual(invocation.args.slice(-6), [
    "search", "runtime architecture", "--tag", "architecture", "--limit", "7"
  ]);
  assert.equal(invocation.args[2], "--output");
  assert.equal(invocation.args[3], "json");
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
