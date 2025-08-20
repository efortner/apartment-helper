import { isNeighborhoodCode } from './is-neighborhood-code';
import { NeighborhoodCode, Neighborhoods } from '../types/neighborhoods';

describe('isNeighborhoodCode', () => {
  it('returns true for each valid Neighborhoods value', () => {
    const values = Object.values(Neighborhoods) as unknown as number[];
    for (const v of values) {
      expect(isNeighborhoodCode(v)).toBe(true);
    }
  });

  it('returns false for invalid codes', () => {
    expect(isNeighborhoodCode(-1)).toBe(false);
    expect(isNeighborhoodCode(123456)).toBe(false);
  });

  it('narrows type when true', () => {
    expect.assertions(1);
    const someNumber = Object.values(Neighborhoods)[0] as unknown as number;
    if (isNeighborhoodCode(someNumber)) {
      const n: NeighborhoodCode = someNumber;
      expect(n).toBeDefined();
    }
  });
});
