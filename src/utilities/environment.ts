import { isNeighborhoodCode } from './is-neighborhood-code';
import { NeighborhoodCode } from '../types/neighborhoods';

export const getEnvironmentVariable = (variable: string) => {
  const value = process.env[variable];
  if (value) {
    return value;
  }
  throw new Error(`Environment variable "${variable}" is not defined.`);
};

export const getNumberFromEnvironment = (variable: string) =>
  Number(getEnvironmentVariable(variable));

export const getBooleanFromEnvironment = (variable: string) =>
  String(true) === getEnvironmentVariable(variable);

export const getNeighborhoodListFromEnvironment = (
  variable: string,
): NeighborhoodCode[] =>
  getEnvironmentVariable(variable)
    .split(',')
    .map((item) => Number(item))
    .filter(isNeighborhoodCode);
