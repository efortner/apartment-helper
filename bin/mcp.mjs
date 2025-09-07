const currentWorkingDirectory = process.cwd();

export const Mcp = {
  'apartment-helper': {
    command: 'node',
    args: [`${currentWorkingDirectory}/dist/mcp.js`],
    env: {
      DATA_DIRECTORY: `${currentWorkingDirectory}/data`,
    },
  },
};
