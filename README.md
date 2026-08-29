# OKF MCP Server

MCP adapter for Open Knowledge Format bundle and Library operations. The server delegates execution to the `okf` CLI and preserves structured JSON results rather than reimplementing OKF parsing, retrieval, registry, or Library runtime logic.

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

`OKF_CLI_PATH` can point to a specific `okf` executable. `OKF_BUNDLE` selects the default core bundle directory.

The MCP layer is intentionally an adapter: storage/provider semantics belong to the SDK/CLI Library Runtime, which lets future local, Git, S3, remote, virtual, and agent-backed providers share one MCP surface.
