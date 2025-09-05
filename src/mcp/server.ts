import {
  McpServer,
  ResourceTemplate,
} from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { NeighborhoodCode, Neighborhoods } from '../types/neighborhoods';
import { StreetEasyAdapter } from '../adapters/street-easy-adapter';
import { StreetEasyClient } from 'streeteasy-api';
import { LocalApartmentCache } from '../adapters/local-apartment-cache';
import { SaveApartmentCache } from '../adapters/save-apartment-cache';
import { FallbackApartmentAdapter } from '../adapters/fallback-apartment-adapter';
import { z } from 'zod/v3';
import { getEnvironmentVariable } from '../utilities/environment';
import { isNeighborhoodName } from '../types/neighborhoods.guard';

const server = new McpServer(
  {
    version: '0.1.0',
    name: 'apartment-helper',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  },
);

const dataDirectory = getEnvironmentVariable('DATA_DIRECTORY');
const streetEasyAdapter = new StreetEasyAdapter({
  client: new StreetEasyClient(),
});
const localApartmentCache = new LocalApartmentCache();
const saveApartmentCache = new SaveApartmentCache({
  directory: dataDirectory,
});
const fallbackApartmentAdapter = new FallbackApartmentAdapter({
  fetchChain: [localApartmentCache, saveApartmentCache, streetEasyAdapter],
  putChain: [localApartmentCache, saveApartmentCache],
  searchChain: [streetEasyAdapter],
});

server.registerResource(
  'neighborhood-codes',
  new ResourceTemplate('neighborhoods://{neighborhood}', {
    list: () => ({
      resources: Object.keys(Neighborhoods).map((name) => ({
        name,
        uri: `neighborhoods://${name}`,
        title: `${name} Code`,
        mimeType: 'text/plain',
      })),
    }),
  }),
  {
    title: 'Neighborhood Codes',
    description: 'Numerical codes used for neighborhood filtering.',
  },
  (uri, { neighborhood }) => ({
    contents: [
      {
        mimeType: 'text/plain',
        uri: uri.href,
        text: isNeighborhoodName(neighborhood)
          ? String(Neighborhoods[neighborhood])
          : 'NOT FOUND',
      },
    ],
  }),
);

server.registerTool(
  'list-neighborhoods',
  {
    title: 'List Neighborhoods',
    description:
      'Lists all available neighborhoods as well as their neighborhood codes. Neighborhood codes are required when searching for apartments.',
    annotations: {
      destructiveHint: false,
      idempotentHint: true,
      readOnlyHint: true,
      openWorldHint: false,
    },
  },
  async () => ({
    content: [{ type: 'text', text: JSON.stringify(Neighborhoods) }],
  }),
);

server.registerTool(
  'search',
  {
    title: 'Search',
    description:
      'Searches for apartments on StreetEasy. Results will get cached locally.',
    annotations: {
      destructiveHint: false,
      idempotentHint: true,
      readOnlyHint: false,
      openWorldHint: false,
    },
    inputSchema: {
      maxPrice: z.number(),
      mustAllowPets: z.boolean(),
      minimumBedrooms: z.number(),
      minimumBathrooms: z.number(),
      neighborhoods: z.array(z.number()),
    },
  },
  async (props) => ({
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          await fallbackApartmentAdapter.search({
            ...props,
            neighborhoods: <NeighborhoodCode[]>props.neighborhoods,
          }),
        ),
      },
    ],
  }),
);

const transport = new StdioServerTransport();

(async () => {
  await server.connect(transport);
})();
