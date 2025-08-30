import * as fs from 'node:fs';

const currentWorkingDirectory = process.cwd();

const mcp = {
  'apartment-helper': {
    command: 'node',
    args: [`${currentWorkingDirectory}/dist/mcp.js`],
    env: {
      DATA_DIRECTORY: `${currentWorkingDirectory}/data`,
    },
  },
};

fs.writeFileSync('mcp.json', JSON.stringify(mcp, null, 2));
