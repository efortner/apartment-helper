import { LocalApartmentCache } from './local-apartment-cache';
import { Apartment } from '../types/apartment';

describe('LocalApartmentCache', () => {
  let cache: LocalApartmentCache;

  beforeEach(() => {
    cache = new LocalApartmentCache();
  });

  test('fetch throws an error when the apartment is not cached', async () => {
    await expect(cache.fetch('nonexistent-id')).rejects.toThrow(Error);
  });

  test('put stores an apartment and fetch returns the same instance', async () => {
    const now = new Date();
    const apartment: Apartment = {
      id: 'apt-123',
      price: 3000,
      bedrooms: 2,
      bathrooms: 1,
      halfBathrooms: 0,
      neighborhood: 'NYC',
      streetAddress: '123 Main St',
      noFee: false,
      unit: '1A',
      unitType: 'apartment',
      features: [],
      createdAt: now,
      updatedAt: now,
    };

    await cache.put(apartment);
    const fetched = await cache.fetch('apt-123');

    expect(fetched).toEqual(apartment);
  });

  // New test case for the positive fetch scenario
  test('fetch returns a cached apartment after it has been put', async () => {
    const now = new Date();
    const apartment: Apartment = {
      id: 'apt-456',
      price: 2500,
      bedrooms: 1,
      bathrooms: 1,
      halfBathrooms: 0,
      neighborhood: 'NYC',
      streetAddress: '456 Oak St',
      noFee: true,
      unit: '2B',
      unitType: 'apartment',
      features: [],
      createdAt: now,
      updatedAt: now,
    };

    // Store the apartment in the cache
    await cache.put(apartment);

    // Retrieve it using fetch
    const fetched = await cache.fetch('apt-456');

    expect(fetched).toEqual(apartment);
  });
});
