import { NeighborhoodCode, Neighborhoods } from '../types/neighborhoods';

export const isNeighborhoodCode = (n: number): n is NeighborhoodCode =>
  new Set(<number[]>Object.values(Neighborhoods)).has(n);
