import { SaveApartmentCache } from './save-apartment-cache';
import { Apartment } from '../types/apartment';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('SaveApartmentCache', () => {
  const tempDir = fs.mkdtempSync(
    path.join(process.cwd(), 'tmp-save-apartment-cache-'),
  );
  const cache = new SaveApartmentCache({ directory: tempDir });

  afterAll(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('fetch throws an error when the apartment file does not exist', async () => {
    await expect(cache.fetch('nonexistent-id')).rejects.toThrow();
  });

  test('put stores an apartment and fetch returns the same instance', async () => {
    const now = new Date();
    const apartment: Apartment = {
      id: 'apt-123',
      status: 'ACTIVE',
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
      url: 'example.com',
      createdAt: now,
      updatedAt: now,
    };

    await cache.put(apartment);

    const fetched = await cache.fetch('apt-123');

    expect(fetched).toStrictEqual(apartment);
  });

  test('fetch throws an error when file content is invalid', async () => {
    const invalidFilePath = path.join(tempDir, 'invalid.json');
    fs.writeFileSync(invalidFilePath, '{ "not": "a valid apartment" }', 'utf8');
    await expect(cache.fetch('invalid')).rejects.toThrow(Error);
  });
});
