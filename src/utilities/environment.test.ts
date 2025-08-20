import {
  getEnvironmentVariable,
  getNumberFromEnvironment,
  getBooleanFromEnvironment,
  getNeighborhoodListFromEnvironment,
} from './environment';

describe('getEnvironmentVariable', () => {
  const originalEnv = { ...process.env };
  afterEach(() => {
    process.env = { ...originalEnv };
  });
  it('returns the value of a defined environment variable', () => {
    process.env.TEST_VAR = 'test-value';
    const result = getEnvironmentVariable('TEST_VAR');
    expect(result).toBe('test-value');
  });
  it('throws an error when the environment variable is not defined', () => {
    const undefinedVar = 'UNDEFINED_VAR';
    delete process.env[undefinedVar];
    expect(() => getEnvironmentVariable(undefinedVar)).toThrow(
      `Environment variable "${undefinedVar}" is not defined.`,
    );
  });
});

describe('getNumberFromEnvironment', () => {
  const originalEnv = { ...process.env };
  afterEach(() => {
    process.env = { ...originalEnv };
  });
  it('parses number correctly', () => {
    process.env.NUM_VAR = '42';
    const result = getNumberFromEnvironment('NUM_VAR');
    expect(result).toBe(42);
  });
});

describe('getBooleanFromEnvironment', () => {
  const originalEnv = { ...process.env };
  afterEach(() => {
    process.env = { ...originalEnv };
  });
  it('returns true when env var is string "true"', () => {
    process.env.BOOL_VAR = 'true';
    const result = getBooleanFromEnvironment('BOOL_VAR');
    expect(result).toBe(true);
  });
  it('returns false otherwise', () => {
    process.env.BOOL_VAR = 'false';
    const result = getBooleanFromEnvironment('BOOL_VAR');
    expect(result).toBe(false);
  });
});

describe('getNeighborhoodListFromEnvironment', () => {
  const originalEnv = { ...process.env };
  afterEach(() => {
    process.env = { ...originalEnv };
  });
  it('parses list and filters invalid codes', () => {
    process.env.NEIGHBORHOODS = '1,2,99,306';
    const result = getNeighborhoodListFromEnvironment('NEIGHBORHOODS');
    expect(result).toEqual([1, 306]);
  });
});

describe('getEnvironmentVariable', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('returns the value of a defined environment variable', () => {
    process.env.TEST_VAR = 'test-value';

    const result = getEnvironmentVariable('TEST_VAR');

    expect(result).toBe('test-value');
  });

  it('throws an error when the environment variable is not defined', () => {
    const undefinedVar = 'UNDEFINED_VAR';
    delete process.env[undefinedVar];

    expect(() => getEnvironmentVariable(undefinedVar)).toThrow(
      `Environment variable "${undefinedVar}" is not defined.`,
    );
  });
});
