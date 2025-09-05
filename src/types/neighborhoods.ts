import { Areas } from 'streeteasy-api/dist/constants';

export const Neighborhoods = Areas;
/** @see {isNeighborhoodName} ts-auto-guard:type-guard */
export type NeighborhoodName = keyof typeof Neighborhoods;
export type NeighborhoodCode = (typeof Neighborhoods)[NeighborhoodName];
