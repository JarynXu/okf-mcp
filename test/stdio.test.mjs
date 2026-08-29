import assert from "node:assert/strict";
import path from "node:path";
import { spawn } from "node:child_process";
import test from "node:test";

const server = path.resolve("src/server.mjs");

test("stdio transport emits one compact JSON response per request line", async () => {
  const child = spawn(process.execPath, [server], { stdio: ["pipe", "pipe", "pipe"] });
  const lines = [];
  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (chunk) => lines.push(...chunk.trim().split("\n").filter(Boolean)));
  child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id: 1, method: "server/discover", params: { _meta: {} } })}\n`);
  child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list" })}\n`);
  child.stdin.end();
  await new Promise((resolve, reject) => {
    child.on("close", resolve);
    child.on("error", reject);
  });
  assert.equal(lines.length, 2);
  assert.equal(JSON.parse(lines[0]).id, 1);
  assert.equal(JSON.parse(lines[1]).result.tools.length, 15);
});
