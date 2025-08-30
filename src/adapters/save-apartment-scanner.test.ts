import { SaveApartmentScanner } from './save-apartment-scanner';
import type { ApartmentFetch, Apartment } from '../types/apartment';

jest.mock('node:fs', () => ({
  readdirSync: jest.fn(),
}));

import * as fs from 'node:fs';

describe('SaveApartmentScanner', () => {
  const mockFetch = jest.fn();
  const scannerProps = {
    directory: '/mocked/directory',
    apartmentFetcher: { fetch: mockFetch } as unknown as ApartmentFetch,
  };
  const scanner = new SaveApartmentScanner(scannerProps);
  const currentDate = new Date();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches an apartment for each .json file in the directory', async () => {
    (fs.readdirSync as jest.Mock).mockReturnValue([
      '123.json',
      '456.json',
      'README.md',
    ]);

    const apartmentA: Apartment = {
      createdAt: currentDate,
      status: 'ACTIVE',
      features: ['WASHER_DRYER'],
      noFee: false,
      unit: 'B',
      unitType: 'CONDO',
      updatedAt: currentDate,
      id: '123',
      price: 2000,
      bedrooms: 2,
      bathrooms: 1,
      halfBathrooms: 0,
      neighborhood: 'NEIGHBORHOOD_A',
      streetAddress: '123 Main St',
    };

    const apartmentB: Apartment = {
      createdAt: currentDate,
      status: 'ACTIVE',
      features: ['WASHER_DRYER'],
      noFee: false,
      unit: 'A',
      unitType: 'CONDO',
      updatedAt: currentDate,
      id: '456',
      price: 2500,
      bedrooms: 3,
      bathrooms: 1.5,
      halfBathrooms: 0,
      neighborhood: 'NEIGHBORHOOD_B',
      streetAddress: '456 Oak Ave',
    };

    mockFetch.mockImplementation((id: string) => {
      return Promise.resolve(id === '123' ? apartmentA : apartmentB);
    });

    const result = await scanner.scan();

    expect(fs.readdirSync).toHaveBeenCalledWith('/mocked/directory');
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenCalledWith('123');
    expect(mockFetch).toHaveBeenCalledWith('456');
    expect(result).toEqual([apartmentA, apartmentB]);
  });

  it('returns an empty array when no .json files are present', async () => {
    (fs.readdirSync as jest.Mock).mockReturnValue(['notes.txt', 'script.js']);

    const result = await scanner.scan();

    expect(result).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});
