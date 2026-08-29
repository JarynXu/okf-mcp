import assert from "node:assert/strict";
import test from "node:test";

import { handleMessage } from "../src/protocol.mjs";

const request = (id, method, params) => ({ jsonrpc: "2.0", id, method, ...(params === undefined ? {} : { params }) });

test("supports modern discovery and legacy initialization", () => {
  const discover = handleMessage(request(1, "server/discover", { _meta: {} }));
  assert.deepEqual(discover.result.supportedVersions.slice(0, 2), ["2026-07-28", "2025-11-25"]);
  assert.deepEqual(discover.result.capabilities, { tools: {} });

  const initialize = handleMessage(request(2, "initialize", {
    protocolVersion: "2025-11-25",
    capabilities: {},
    clientInfo: { name: "test", version: "1" }
  }));
  assert.equal(initialize.result.protocolVersion, "2025-11-25");
});

test("lists tools deterministically with valid object schemas", () => {
  const response = handleMessage(request(1, "tools/list"));
  assert.deepEqual(response.result.tools.map((tool) => tool.name), [
    "okf_validate",
    "okf_list",
    "okf_get",
    "okf_inspect",
    "okf_search",
    "okf_graph",
    "okf_library_add",
    "okf_library_update",
    "okf_library_remove",
    "okf_library_mount",
    "okf_library_unmount",
    "okf_library_list"
  ]);
  for (const tool of response.result.tools) assert.equal(tool.inputSchema.type, "object");
  assert.equal(response.result.cacheScope, "public");
});

test("tool calls return text and structured content", () => {
  const calls = [];
  const response = handleMessage(request(7, "tools/call", {
    name: "okf_search",
    arguments: { query: "runtime", limit: 5 }
  }), {
    runCli(name, args) {
      calls.push({ name, args });
      return { isError: false, text: "1 result", structuredContent: [{ id: "runtime" }] };
    }
  });
  assert.deepEqual(calls, [{ name: "okf_search", args: { query: "runtime", limit: 5 } }]);
  assert.equal(response.result.content[0].text, "1 result");
  assert.deepEqual(response.result.structuredContent, [{ id: "runtime" }]);
  assert.equal(response.result.isError, false);
});

test("unknown methods and tools use protocol errors", () => {
  assert.equal(handleMessage(request(1, "unknown")).error.code, -32601);
  assert.equal(handleMessage(request(2, "tools/call", { name: "missing" })).error.code, -32602);
});

test("notifications produce no response and batches omit them", () => {
  assert.equal(handleMessage({ jsonrpc: "2.0", method: "notifications/initialized" }), null);
  const batch = handleMessage([
    { jsonrpc: "2.0", method: "notifications/initialized" },
    request(1, "ping")
  ]);
  assert.equal(batch.length, 1);
  assert.deepEqual(batch[0].result, {});
});
