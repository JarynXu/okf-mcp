# OKF MCP Server

MCP adapter for Open Knowledge Format bundle, Library Runtime, and Project Context operations. The server delegates execution to the `okf` CLI and preserves structured JSON results rather than reimplementing OKF parsing, retrieval, registry, Library runtime, or Git freshness logic.

## Core bundle tools

- `okf_validate`
- `okf_list`
- `okf_get`
- `okf_inspect`
- `okf_search`
- `okf_graph`

## Library tools

- `okf_library_add`
- `okf_library_update`
- `okf_library_remove`
- `okf_library_mount`
- `okf_library_unmount`
- `okf_library_list`
- `okf_library_catalog`
- `okf_library_read`
- `okf_library_query`

Library tools use `OKF_REGISTRY` or `.okf/libraries.json` by default. They expose the same lifecycle, dynamic semantic catalog, canonical `okf://` read, and polymorphic query operations as the CLI.

## Project Context tools

- `okf_project_init`
- `okf_project_status`
- `okf_project_checkpoint`

Project Context tools layer repository-bound bootstrap and freshness state over a normal mounted Library. `okf_project_status` returns `UNINITIALIZED`, `VALID`, `DIRTY`, or `UNKNOWN`, including revision/delta and impacted-topic evidence when available. `okf_project_checkpoint` records a revision only after the caller has completed required project verification.

Project Context profile state uses `OKF_PROJECT_CONTEXT` or `.okf/project-context.json` by default. Initialization also uses the normal Library registry selected by `OKF_REGISTRY`.

`OKF_CLI_PATH` can point to a specific `okf` executable. `OKF_BUNDLE` selects the default core bundle directory.

The MCP layer is intentionally an adapter: storage/provider semantics belong to the SDK/CLI Library Runtime, while Project Context Git/profile semantics belong to the CLI application adapter. This lets future local, Git, S3, remote, virtual, agent-backed, and repository-context Libraries share stable MCP surfaces without duplicating domain logic.
