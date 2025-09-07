import * as fs from 'node:fs';
import { Mcp } from './mcp.mjs';

fs.writeFileSync('mcp.json', JSON.stringify(Mcp, null, 2));
