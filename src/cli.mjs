import { spawnSync } from "node:child_process";
import path from "node:path";

export function buildCliInvocation(name, args = {}, environment = process.env) {
  const bundle = path.resolve(args.bundle ?? environment.OKF_BUNDLE ?? process.cwd());
  const command = ["--bundle", bundle, "--output", "json"];

  if (name.startsWith("okf_library_") || name === "okf_project_init") {
    const registry = path.resolve(args.registry ?? environment.OKF_REGISTRY ?? path.join(process.cwd(), ".okf", "libraries.json"));
    command.push("--registry", registry);
  }

  if (name.startsWith("okf_project_")) {
    const projectContext = path.resolve(args.projectContext ?? environment.OKF_PROJECT_CONTEXT ?? path.join(process.cwd(), ".okf", "project-context.json"));
    command.push("--project-context", projectContext);
  }

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
    case "okf_library_add":
      command.push("library", "add", requiredString(args, "source"));
      if (args.id) command.push("--id", String(args.id));
      if (args.name) command.push("--name", String(args.name));
      if (args.reference) command.push("--ref", String(args.reference));
      break;
    case "okf_library_update":
      command.push("library", "update", requiredString(args, "id"));
      break;
    case "okf_library_remove":
      command.push("library", "remove", requiredString(args, "id"));
      break;
    case "okf_library_mount":
      command.push("library", "mount", requiredString(args, "id"));
      break;
    case "okf_library_unmount":
      command.push("library", "unmount", requiredString(args, "id"));
      break;
    case "okf_library_list":
      command.push("library", "list");
      break;
    case "okf_library_catalog":
      command.push("library", "catalog");
      if (args.id) command.push(String(args.id));
      break;
    case "okf_library_read":
      command.push("library", "read", requiredString(args, "uri"));
      break;
    case "okf_library_query":
      command.push("library", "query", requiredString(args, "query"));
      if (args.library) command.push("--library", String(args.library));
      if (args.limit !== undefined) command.push("--limit", String(args.limit));
      break;
    case "okf_project_init":
      command.push("project", "init");
      if (args.repository) command.push("--repository", String(args.repository));
      if (args.project) command.push("--project", String(args.project));
      if (args.id) command.push("--id", String(args.id));
      if (args.force) command.push("--force");
      break;
    case "okf_project_status":
      command.push("project", "status");
      break;
    case "okf_project_checkpoint":
      command.push("project", "checkpoint");
      if (args.revision) command.push("--revision", String(args.revision));
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
