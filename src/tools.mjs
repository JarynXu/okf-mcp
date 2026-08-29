const bundleProperty = {
  type: "string",
  description: "Bundle directory. Defaults to OKF_BUNDLE or the server working directory."
};

const registryProperty = {
  type: "string",
  description: "Library registry path. Defaults to OKF_REGISTRY or .okf/libraries.json in the server working directory."
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
    title: "Get OKF knowledge",
    description: "Read one bundle document by canonical identifier/alias or one mounted Library node by canonical okf:// URI.",
    inputSchema: closedObject({
      bundle: bundleProperty,
      registry: registryProperty,
      id: { type: "string", minLength: 1 }
    }, ["id"]),
    annotations: readOnly
  },
  {
    name: "okf_inspect",
    title: "Inspect OKF document",
    description: "Inspect one bundle document and its resolved graph neighborhood.",
    inputSchema: closedObject({ bundle: bundleProperty, id: { type: "string", minLength: 1 } }, ["id"]),
    annotations: readOnly
  },
  {
    name: "okf_search",
    title: "Search OKF knowledge",
    description: "Search the active OKF knowledge space. Mounted Libraries transparently participate through their retrieval providers; optional library scopes the existing search operation.",
    inputSchema: closedObject({
      bundle: bundleProperty,
      registry: registryProperty,
      query: { type: "string" },
      tags: { type: "array", items: { type: "string" }, default: [] },
      library: { type: "string", minLength: 1 },
      limit: { type: "integer", minimum: 1, maximum: 1000, default: 20 }
    }, ["query"]),
    annotations: readOnly
  },
  {
    name: "okf_graph",
    title: "Build OKF graph",
    description: "Build the current bundle's resolved directed knowledge graph and optionally focus on one document.",
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
  }
]);
