#!/usr/bin/env node

import readline from "node:readline";
import { errorResponse, handleMessage } from "./protocol.mjs";

const input = readline.createInterface({ input: process.stdin, crlfDelay: Infinity, terminal: false });

input.on("line", (line) => {
  if (!line.trim()) return;
  let message;
  try {
    message = JSON.parse(line);
  } catch (error) {
    write(errorResponse(null, -32700, "Parse error", error instanceof Error ? error.message : String(error)));
    return;
  }
  const response = handleMessage(message);
  if (response !== null) write(response);
});

input.on("error", (error) => {
  console.error(`okf-mcp stdin error: ${error.message}`);
  process.exitCode = 1;
});

function write(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}
