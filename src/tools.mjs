const bundleProperty = {
  type: "string",
  description: "Bundle directory. Defaults to OKF_BUNDLE or the server working directory."
};

const registryProperty = {
  type: "string",
  description: "Library registry path. Defaults to OKF_REGISTRY or .okf/libraries.json in the server working directory."
};

const projectContextProperty = {
  type: "string",
  description: "Project Context profile path. Defaults to OKF_PROJECT_CONTEXT or .okf/project-context.json in the server working directory."
};

const closedObject = (properties, required = []) => ({
  type: "object",
  properties,
  required,
  additionalProperties: false
});

const readOnly = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
const mutate = { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true };
const destructive = { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: false };

export const tools = Object.freeze([
  {
    name: "okf_validate",
    title: "Validate OKF bundle",
    description: "Parse and structurally validate an Open Knowledge Format bundle.",
    inputSchema: closedObject({
      bundle: bundleProperty,
      allowUnresolved: { type: "boolean", default: false },
      noOrphans: { type: "boolean", default: false },
      denyWarnings: { type: "boolean", default: false }
    }),
    annotations: readOnly
  },
  {
    name: "okf_list",
    title: "List OKF documents",
    description: "List documents in stable identifier order, optionally requiring tags.",
    inputSchema: closedObject({
      bundle: bundleProperty,
      tags: { type: "array", items: { type: "string" }, default: [] }
    }),
    annotations: readOnly
  },
  {
    name: "okf_get",
    title: "Get OKF document",
    description: "Read one document by canonical identifier or alias.",
    inputSchema: closedObject({ bundle: bundleProperty, id: { type: "string", minLength: 1 } }, ["id"]),
    annotations: readOnly
  },
  {
    name: "okf_inspect",
    title: "Inspect OKF document",
    description: "Inspect one document and its resolved graph neighborhood.",
    inputSchema: closedObject({ bundle: bundleProperty, id: { type: "string", minLength: 1 } }, ["id"]),
    annotations: readOnly
  },
  {
    name: "okf_search",
    title: "Search OKF bundle",
    description: "Search documents using deterministic lexical ranking and optional tag filters.",
    inputSchema: closedObject({
      bundle: bundleProperty,
      query: { type: "string" },
      tags: { type: "array", items: { type: "string" }, default: [] },
      limit: { type: "integer", minimum: 1, maximum: 1000, default: 20 }
    }, ["query"]),
    annotations: readOnly
  },
  {
    name: "okf_graph",
    title: "Build OKF graph",
    description: "Build the resolved directed knowledge graph and optionally focus on one document.",
    inputSchema: closedObject({ bundle: bundleProperty, id: { type: "string", minLength: 1 } }),
    annotations: readOnly
  },
  {
    name: "okf_library_add",
    title: "Install OKF Library",
    description: "Register/install a local-directory or Git-backed OKF Library.",
    inputSchema: closedObject({
      registry: registryProperty,
      source: { type: "string", minLength: 1 },
      id: { type: "string", minLength: 1 },
      name: { type: "string", minLength: 1 },
      reference: { type: "string", minLength: 1 }
    }, ["source"]),
    annotations: mutate
  },
  {
    name: "okf_library_update",
    title: "Update OKF Library",
    description: "Refresh an installed Library source.",
    inputSchema: closedObject({ registry: registryProperty, id: { type: "string", minLength: 1 } }, ["id"]),
    annotations: mutate
  },
  {
    name: "okf_library_remove",
    title: "Uninstall OKF Library",
    description: "Unregister a Library and remove managed Git cache data.",
    inputSchema: closedObject({ registry: registryProperty, id: { type: "string", minLength: 1 } }, ["id"]),
    annotations: destructive
  },
  {
    name: "okf_library_mount",
    title: "Mount OKF Library",
    description: "Mount an installed Library into the active global knowledge space.",
    inputSchema: closedObject({ registry: registryProperty, id: { type: "string", minLength: 1 } }, ["id"]),
    annotations: mutate
  },
  {
    name: "okf_library_unmount",
    title: "Unmount OKF Library",
    description: "Unmount a Library without uninstalling it.",
    inputSchema: closedObject({ registry: registryProperty, id: { type: "string", minLength: 1 } }, ["id"]),
    annotations: mutate
  },
  {
    name: "okf_library_list",
    title: "List OKF Libraries",
    description: "List installed Libraries and mount state.",
    inputSchema: closedObject({ registry: registryProperty }),
    annotations: readOnly
  },
  {
    name: "okf_library_catalog",
    title: "Browse OKF Library catalog",
    description: "Return the semantic catalog for one Library or aggregate all mounted Library catalogs.",
    inputSchema: closedObject({ registry: registryProperty, id: { type: "string", minLength: 1 } }),
    annotations: readOnly
  },
  {
    name: "okf_library_read",
    title: "Read OKF Library knowledge",
    description: "Read a canonical okf:// Library knowledge URI.",
    inputSchema: closedObject({ registry: registryProperty, uri: { type: "string", minLength: 1 } }, ["uri"]),
    annotations: readOnly
  },
  {
    name: "okf_library_query",
    title: "Query OKF Libraries",
    description: "Query one Library or all mounted query-capable Libraries using each Library's retrieval provider.",
    inputSchema: closedObject({
      registry: registryProperty,
      query: { type: "string", minLength: 1 },
      library: { type: "string", minLength: 1 },
      limit: { type: "integer", minimum: 1, maximum: 1000, default: 20 }
    }, ["query"]),
    annotations: readOnly
  },
  {
    name: "okf_project_init",
    title: "Initialize Project Context Library",
    description: "Bootstrap and mount a repository-bound Project Context Library scaffold.",
    inputSchema: closedObject({
      registry: registryProperty,
      projectContext: projectContextProperty,
      repository: { type: "string", minLength: 1 },
      project: { type: "string", minLength: 1 },
      id: { type: "string", minLength: 1 },
      force: { type: "boolean", default: false }
    }),
    annotations: mutate
  },
  {
    name: "okf_project_status",
    title: "Get Project Context freshness",
    description: "Compare the validated revision with repository HEAD and return recovery state, changed paths, and impacted topics.",
    inputSchema: closedObject({ projectContext: projectContextProperty }),
    annotations: readOnly
  },
  {
    name: "okf_project_checkpoint",
    title: "Advance Project Context checkpoint",
    description: "Advance validated_revision only after the caller has completed required knowledge updates and project verification.",
    inputSchema: closedObject({
      projectContext: projectContextProperty,
      revision: { type: "string", minLength: 1 }
    }),
    annotations: mutate
  }
]);
