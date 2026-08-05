# OKF MCP server

`okf-mcp` exposes read-only Open Knowledge Format operations over MCP stdio. It delegates bundle semantics to the native `okf` CLI and returns both text content and structured JSON.

## Tools

- `okf_validate`
- `okf_list`
- `okf_get`
- `okf_inspect`
- `okf_search`
- `okf_graph`

## Configuration

```json
{
  "mcpServers": {
    "okf": {
      "command": "okf-mcp",
      "env": {
        "OKF_BUNDLE": "/absolute/path/to/knowledge",
        "OKF_CLI_PATH": "/optional/path/to/okf"
      }
    }
  }
}
```

The server supports the stable `2025-11-25` initialization flow and the `2026-07-28` discovery flow over newline-delimited JSON-RPC stdio. It writes protocol messages only to stdout and diagnostics only to stderr.

## Development

```bash
npm ci
npm run check
```
