import { StreetEasyAdapter } from './street-easy-adapter';
import { StreetEasyClient } from 'streeteasy-api';
import { Neighborhoods } from '../types/neighborhoods';

jest.mock('streeteasy-api', () => {
  const mockSearchRentals = jest.fn().mockResolvedValue({
    searchRentals: {
      edges: [
        {
          node: {
            id: '1',
            price: 5000,
            areaName: 'Park Slope',
            bedroomCount: 3,
            fullBathroomCount: 2,
            halfBathroomCount: 1,
            urlPath: '/listing/1',
            noFee: true,
            street: 'Sample St',
            unit: 'Apt 101',
            buildingType: 'Condo',
          },
        },
        {
          node: {
            id: '2',
            price: 5500,
            areaName: 'Boerum Hill',
            bedroomCount: 3,
            fullBathroomCount: 2,
            halfBathroomCount: 0,
            urlPath: '/listing/2',
            noFee: false,
            street: 'Other St',
            unit: 'Apt 202',
            buildingType: 'Coop',
          },
        },
      ],
    },
  });

  const mockGetRentalListingDetails = jest
    .fn()
    .mockImplementation((id: string) => {
      if (id === '1') {
        return Promise.resolve({
          rentalByListingId: {
            pricing: { price: 5000, noFee: true },
            propertyDetails: {
              bedroomCount: 3,
              fullBathroomCount: 2,
              halfBathroomCount: 1,
              features: { list: ['Gym', 'Laundry'] },
              address: { unit: 'Apt 101' },
            },
            createdAt: '2021-01-01T00:00:00Z',
            updatedAt: '2021-06-01T00:00:00Z',
          },
          buildingByRentalListingId: {
            area: { name: 'Park Slope' },
            type: 'Condo',
            address: { street: 'Sample St' },
          },
        });
      }
      return Promise.resolve({
        rentalByListingId: {
          pricing: { price: 5500, noFee: false },
          propertyDetails: {
            bedroomCount: 3,
            fullBathroomCount: 2,
            halfBathroomCount: 0,
            address: {},
          },
          createdAt: '2022-01-01T00:00:00Z',
          updatedAt: '2022-06-01T00:00:00Z',
        },
        buildingByRentalListingId: {
          area: { name: 'Boerum Hill' },
          type: 'Coop',
          address: { street: 'Other St' },
        },
      });
    });

  return {
    StreetEasyClient: jest.fn().mockImplementation(() => ({
      searchRentals: mockSearchRentals,
      getRentalListingDetails: mockGetRentalListingDetails,
    })),
  };
});

describe('StreetEasyAdapter', () => {
  it('search returns combined results', async () => {
    const client = new StreetEasyClient();
    const adapter = new StreetEasyAdapter({ client });
    const results = await adapter.search({
      maxPrice: 6000,
      mustAllowPets: true,
      minimumBedrooms: 3,
      minimumBathrooms: 2,
      neighborhoods: [Neighborhoods.PARK_SLOPE, Neighborhoods.BOERUM_HILL],
    });
    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({
      id: '1',
      price: 5000,
      bedrooms: 3,
      bathrooms: 2,
      halfBathrooms: 1,
      neighborhood: 'Park Slope',
      unitType: 'Condo',
      features: ['Gym', 'Laundry'],
    });
  });

  it('searches without filtering for mustAllowPets', async () => {
    const client = new StreetEasyClient();
    const adapter = new StreetEasyAdapter({ client });
    const results = await adapter.search({
      maxPrice: 6000,
      mustAllowPets: false,
      minimumBedrooms: 3,
      minimumBathrooms: 2,
      neighborhoods: [Neighborhoods.PARK_SLOPE, Neighborhoods.BOERUM_HILL],
    });
    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({
      id: '1',
      price: 5000,
      bedrooms: 3,
      bathrooms: 2,
      halfBathrooms: 1,
      neighborhood: 'Park Slope',
      unitType: 'Condo',
      features: ['Gym', 'Laundry'],
    });
  });

  it('fetches detailed apartment information', async () => {
    const client = new StreetEasyClient();
    const adapter = new StreetEasyAdapter({ client });
    const result = await adapter.fetch('1');
    expect(result).toMatchObject({
      id: '1',
      price: 5000,
      bedrooms: 3,
      bathrooms: 2,
      halfBathrooms: 1,
      neighborhood: 'Park Slope',
      noFee: true,
      streetAddress: 'Sample St',
      unit: 'Apt 101',
      unitType: 'Condo',
      features: ['Gym', 'Laundry'],
    });
  });

  it('fetches detailed apartment information when no unit number available', async () => {
    const client = new StreetEasyClient();
    const adapter = new StreetEasyAdapter({ client });
    const result = await adapter.fetch('2');
    expect(result).toMatchObject({
      id: '2',
      price: 5500,
      bedrooms: 3,
      bathrooms: 2,
      halfBathrooms: 0,
      neighborhood: 'Boerum Hill',
      noFee: false,
      streetAddress: 'Other St',
      unit: '',
      unitType: 'Coop',
      features: [],
    });
  });
});
