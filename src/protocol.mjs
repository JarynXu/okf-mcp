import { runOkfCli } from "./cli.mjs";
import { tools } from "./tools.mjs";

export const SERVER_INFO = Object.freeze({ name: "okf-mcp", version: "0.1.0-alpha.1" });
export const SUPPORTED_VERSIONS = Object.freeze(["2026-07-28", "2025-11-25", "2025-06-18"]);
const instructions = "Use OKF tools to validate, inspect, search, and traverse Markdown knowledge bundles. All tools are read-only.";

export function handleMessage(message, dependencies = {}) {
  if (Array.isArray(message)) {
    const responses = message.map((item) => handleSingle(item, dependencies)).filter(Boolean);
    return responses.length ? responses : null;
  }
  return handleSingle(message, dependencies);
}

function handleSingle(message, dependencies) {
  if (!message || typeof message !== "object" || message.jsonrpc !== "2.0" || typeof message.method !== "string") {
    return errorResponse(message?.id ?? null, -32600, "Invalid Request");
  }
  const isNotification = message.id === undefined;
  if (isNotification) return null;

  try {
    switch (message.method) {
      case "server/discover":
        return success(message.id, {
          resultType: "complete",
          supportedVersions: SUPPORTED_VERSIONS,
          capabilities: { tools: {} },
          serverInfo: SERVER_INFO,
          instructions
        });
      case "initialize": {
        const requested = message.params?.protocolVersion;
        const protocolVersion = SUPPORTED_VERSIONS.includes(requested) ? requested : "2025-11-25";
        return success(message.id, {
          protocolVersion,
          capabilities: { tools: { listChanged: false } },
          serverInfo: SERVER_INFO,
          instructions
        });
      }
      case "ping":
        return success(message.id, {});
      case "tools/list":
        return success(message.id, {
          resultType: "complete",
          tools,
          ttlMs: 60_000,
          cacheScope: "public"
        });
      case "tools/call":
        return callTool(message.id, message.params, dependencies.runCli ?? runOkfCli);
      default:
        return errorResponse(message.id, -32601, "Method not found", { method: message.method });
    }
  } catch (error) {
    return errorResponse(message.id, -32602, error instanceof Error ? error.message : String(error));
  }
}

function callTool(id, params, runCli) {
  const name = params?.name;
  if (!tools.some((tool) => tool.name === name)) {
    return errorResponse(id, -32602, `Unknown tool: ${String(name)}`);
  }
  const argumentsValue = params?.arguments ?? {};
  if (!argumentsValue || typeof argumentsValue !== "object" || Array.isArray(argumentsValue)) {
    return errorResponse(id, -32602, "Tool arguments must be an object");
  }

  const result = runCli(name, argumentsValue);
  return success(id, {
    resultType: "complete",
    content: [{ type: "text", text: result.text }],
    structuredContent: result.structuredContent,
    isError: Boolean(result.isError)
  });
}

function success(id, result) {
  return { jsonrpc: "2.0", id, result };
}

export function errorResponse(id, code, message, data) {
  return { jsonrpc: "2.0", id, error: { code, message, ...(data === undefined ? {} : { data }) } };
}
