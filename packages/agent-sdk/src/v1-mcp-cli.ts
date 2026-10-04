#!/usr/bin/env node
import {StdioServerTransport} from '@modelcontextprotocol/sdk/server/stdio.js';
import {createV1McpServer} from './v1-mcp.js';
// stdout is reserved for protocol messages.
await createV1McpServer().connect(new StdioServerTransport());
