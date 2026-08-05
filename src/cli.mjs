import { spawnSync } from "node:child_process";
import path from "node:path";

export function buildCliInvocation(name, args = {}, environment = process.env) {
  const bundle = path.resolve(args.bundle ?? environment.OKF_BUNDLE ?? process.cwd());
  const command = ["--bundle", bundle, "--output", "json"];

  switch (name) {
    case "okf_validate":
      command.push("validate");
      if (args.allowUnresolved) command.push("--allow-unresolved");
      if (args.noOrphans) command.push("--no-orphans");
      if (args.denyWarnings) command.push("--deny-warnings");
      break;
    case "okf_list":
      command.push("list");
      for (const tag of args.tags ?? []) command.push("--tag", String(tag));
      break;
    case "okf_get":
      command.push("get", requiredString(args, "id"));
      break;
    case "okf_inspect":
      command.push("inspect", requiredString(args, "id"));
      break;
    case "okf_search":
      command.push("search", requiredString(args, "query"));
      for (const tag of args.tags ?? []) command.push("--tag", String(tag));
      if (args.limit !== undefined) command.push("--limit", String(args.limit));
      break;
    case "okf_graph":
      command.push("graph");
      if (args.id) command.push("--id", String(args.id));
      break;
    default:
      throw new Error(`Unknown OKF tool: ${name}`);
  }

  return {
    executable: environment.OKF_CLI_PATH || "okf",
    args: command
  };
}

export function runOkfCli(name, args, options = {}) {
  const environment = options.environment ?? process.env;
  const invocation = buildCliInvocation(name, args, environment);
  const result = spawnSync(invocation.executable, invocation.args, {
    encoding: "utf8",
    windowsHide: true,
    env: environment,
    maxBuffer: 16 * 1024 * 1024
  });

  if (result.error) {
    return failure(`Unable to start ${invocation.executable}: ${result.error.message}`, null, invocation);
  }

  const stdout = result.stdout?.trim() ?? "";
  const stderr = result.stderr?.trim() ?? "";
  let envelope;
  try {
    envelope = stdout ? JSON.parse(stdout) : null;
  } catch {
    return failure(`OKF CLI returned invalid JSON${stderr ? `: ${stderr}` : ""}`, { stdout }, invocation);
  }

  const isError = result.status !== 0 || envelope?.ok === false;
  return {
    isError,
    text: isError
      ? envelope?.error?.message ?? summarizeValidation(envelope?.data) ?? stderr ?? "OKF command failed"
      : summarizeSuccess(name, envelope?.data),
    structuredContent: envelope?.data ?? envelope ?? {},
    invocation,
    exitCode: result.status
  };
}

function requiredString(args, name) {
  const value = args?.[name];
  if (typeof value !== "string" || value.length === 0) throw new Error(`Missing required argument: ${name}`);
  return value;
}

function summarizeSuccess(name, data) {
  if (name === "okf_validate") {
    return `Validated ${data?.documents_checked ?? 0} document(s): ${data?.errors ?? 0} error(s), ${data?.warnings ?? 0} warning(s).`;
  }
  return JSON.stringify(data ?? {}, null, 2);
}

function summarizeValidation(data) {
  if (!data || typeof data !== "object") return null;
  if (Array.isArray(data.issues) && data.issues.length) {
    return data.issues.map((issue) => `${issue.code}: ${issue.message}`).join("\n");
  }
  return null;
}

function failure(text, structuredContent, invocation) {
  return { isError: true, text, structuredContent: structuredContent ?? {}, invocation, exitCode: null };
}
