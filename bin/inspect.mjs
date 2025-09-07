import * as child_process from 'node:child_process';
import { Mcp } from './mcp.mjs';

child_process.exec(
  `DATA_DIRECTORY=${Mcp['apartment-helper'].env.DATA_DIRECTORY} npx @modelcontextprotocol/inspector ${Mcp['apartment-helper'].command} ${Mcp['apartment-helper'].args.join(' ')}`,
);
