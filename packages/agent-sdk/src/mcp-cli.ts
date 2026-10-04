#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createQuinelingMcpServer } from './mcp.js';

// stdout belongs exclusively to MCP JSON-RPC; never print banners or task traces.
const server = createQuinelingMcpServer();
await server.connect(new StdioServerTransport());
