#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createQuinelingMcpServer } from './mcp.js';

import {experimentalVisualFlag} from './experimental-adapters.js';
// stdout belongs exclusively to MCP JSON-RPC; never print banners or task traces.
const server = createQuinelingMcpServer(undefined,{experimentalVisual:experimentalVisualFlag(process.argv.slice(2))});
await server.connect(new StdioServerTransport());
