const bundleProperty = {
  type: "string",
  description: "Bundle directory. Defaults to OKF_BUNDLE or the server working directory."
};

const closedObject = (properties, required = []) => ({
  type: "object",
  properties,
  required,
  additionalProperties: false
});

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
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  },
  {
    name: "okf_list",
    title: "List OKF documents",
    description: "List documents in stable identifier order, optionally requiring tags.",
    inputSchema: closedObject({
      bundle: bundleProperty,
      tags: { type: "array", items: { type: "string" }, default: [] }
    }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  },
  {
    name: "okf_get",
    title: "Get OKF document",
    description: "Read one document by canonical identifier or alias.",
    inputSchema: closedObject({ bundle: bundleProperty, id: { type: "string", minLength: 1 } }, ["id"]),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  },
  {
    name: "okf_inspect",
    title: "Inspect OKF document",
    description: "Inspect one document and its resolved graph neighborhood.",
    inputSchema: closedObject({ bundle: bundleProperty, id: { type: "string", minLength: 1 } }, ["id"]),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
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
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  },
  {
    name: "okf_graph",
    title: "Build OKF graph",
    description: "Build the resolved directed knowledge graph and optionally focus on one document.",
    inputSchema: closedObject({ bundle: bundleProperty, id: { type: "string", minLength: 1 } }),
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  }
]);
