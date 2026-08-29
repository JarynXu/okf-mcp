# OKF MCP Server

MCP adapter for Open Knowledge Format bundle and Library operations. The server delegates execution to the `okf` CLI and preserves structured JSON results rather than reimplementing OKF parsing, retrieval, registry, or Library runtime logic.

Mounted Libraries transparently extend the existing OKF knowledge tools. The MCP surface does not introduce separate Library retrieval tools.

## Knowledge tools

- `okf_validate`
- `okf_list`
- `okf_get`
- `okf_inspect`
- `okf_search`
- `okf_graph`

`okf_search` searches the active OKF knowledge space and may optionally scope to a Library. `okf_get` also accepts canonical `okf://<library>/<path>` URIs. Provider-specific lexical, semantic, graph, remote, or agentic retrieval remains an internal Runtime capability.

## Library management tools

- `okf_library_add`
- `okf_library_update`
- `okf_library_remove`
- `okf_library_mount`
- `okf_library_unmount`
- `okf_library_list`

Library management uses `OKF_REGISTRY` or `.okf/libraries.json` by default. Mounting a Library changes the active knowledge space consumed by `okf_search`/`okf_get`; it does not require a different retrieval API.

`OKF_CLI_PATH` can point to a specific `okf` executable. `OKF_BUNDLE` selects the default bundle directory.

The MCP layer is intentionally domain-neutral and thin. Storage/provider semantics belong to the SDK/CLI Library Runtime, while application-specific actions belong to the concrete Library/application package rather than generic OKF MCP.
