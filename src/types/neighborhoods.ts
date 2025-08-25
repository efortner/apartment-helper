import { Areas } from 'streeteasy-api/dist/constants';

export const Neighborhoods = Areas;
export type NeighborhoodCode =
  (typeof Neighborhoods)[keyof typeof Neighborhoods];
