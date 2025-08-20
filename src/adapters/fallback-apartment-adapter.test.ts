import {
  Apartment,
  ApartmentFetch,
  ApartmentPut,
  ApartmentSearch,
} from '../types/apartment';
import { FallbackApartmentAdapter } from './fallback-apartment-adapter';

describe('FallbackApartmentAdapter', () => {
  const currentDate = new Date();
  const apartment: Apartment = {
    bathrooms: 0,
    bedrooms: 0,
    createdAt: currentDate,
    features: [],
    halfBathrooms: 0,
    id: '',
    neighborhood: 'Yup',
    noFee: false,
    price: 0,
    streetAddress: '',
    unit: '',
    unitType: '',
    updatedAt: currentDate,
  };

  it('puts to all', () => {
    const firstApartmentPutter = {
      put: jest.fn(),
    } as unknown as ApartmentPut;

    const secondApartmentPutter = {
      put: jest.fn(),
    } as unknown as ApartmentPut;

    const fallbackApartmentAdapter = new FallbackApartmentAdapter({
      fetchChain: [],
      putChain: [firstApartmentPutter, secondApartmentPutter],
      searchChain: [],
    });

    expect(fallbackApartmentAdapter.put(apartment)).resolves.toStrictEqual(
      apartment,
    );
    expect(firstApartmentPutter.put).toHaveBeenCalledWith(apartment);
    expect(secondApartmentPutter.put).toHaveBeenCalledWith(apartment);
  });

  it('fetches from the first successful fetcher', async () => {
    const firstFetcher = {
      fetch: jest.fn().mockResolvedValueOnce(apartment),
    } as unknown as ApartmentFetch;

    const secondFetcher = {
      fetch: jest.fn(),
    } as unknown as ApartmentFetch;

    const fallbackApartmentAdapter = new FallbackApartmentAdapter({
      fetchChain: [firstFetcher, secondFetcher],
      putChain: [],
      searchChain: [],
    });

    await expect(
      fallbackApartmentAdapter.fetch('some-id'),
    ).resolves.toStrictEqual(apartment);
    expect(firstFetcher.fetch).toHaveBeenCalledWith('some-id');
    expect(secondFetcher.fetch).not.toHaveBeenCalled();
  });

  it('fetches from the second fetcher when the first fails', async () => {
    const error = new Error('first fetch failed');

    const firstFetcher = {
      fetch: jest.fn().mockRejectedValueOnce(error),
    } as unknown as ApartmentFetch;

    const secondFetcher = {
      fetch: jest.fn().mockResolvedValueOnce(apartment),
    } as unknown as ApartmentFetch;

    const fallbackApartmentAdapter = new FallbackApartmentAdapter({
      fetchChain: [firstFetcher, secondFetcher],
      putChain: [],
      searchChain: [],
    });

    await expect(
      fallbackApartmentAdapter.fetch('some-id'),
    ).resolves.toStrictEqual(apartment);
    expect(firstFetcher.fetch).toHaveBeenCalledWith('some-id');
    expect(secondFetcher.fetch).toHaveBeenCalledWith('some-id');
  });

  it('rejects when all fetchers fail', async () => {
    const firstError = new Error('first failure');
    const secondError = new Error('second failure');

    const firstFetcher = {
      fetch: jest.fn().mockRejectedValueOnce(firstError),
    } as unknown as ApartmentFetch;

    const secondFetcher = {
      fetch: jest.fn().mockRejectedValueOnce(secondError),
    } as unknown as ApartmentFetch;

    const fallbackApartmentAdapter = new FallbackApartmentAdapter({
      fetchChain: [firstFetcher, secondFetcher],
      putChain: [],
      searchChain: [],
    });

    await expect(
      fallbackApartmentAdapter.fetch('some-id'),
    ).rejects.toBeInstanceOf(Error);
  });

  it('searches and puts results from the first successful searcher', async () => {
    const apartment1: Apartment = {
      ...apartment,
      id: 'apt-1',
    };
    const apartment2: Apartment = {
      ...apartment,
      id: 'apt-2',
    };

    const firstSearcher = {
      search: jest.fn().mockResolvedValueOnce([]),
    } as unknown as ApartmentSearch;

    const secondSearcher = {
      search: jest.fn().mockResolvedValueOnce([apartment1, apartment2]),
    } as unknown as ApartmentSearch;

    const putter = {
      put: jest.fn().mockResolvedValueOnce(undefined),
    } as unknown as ApartmentPut;

    const fallbackApartmentAdapter = new FallbackApartmentAdapter({
      fetchChain: [],
      putChain: [putter],
      searchChain: [firstSearcher, secondSearcher],
    });

    const searchProps = {
      maxPrice: 3000,
      mustAllowPets: false,
      minimumBedrooms: 1,
      minimumBathrooms: 1,
      neighborhoods: [],
    };

    await expect(
      fallbackApartmentAdapter.search(searchProps),
    ).resolves.toStrictEqual([apartment1, apartment2]);

    expect(firstSearcher.search).toHaveBeenCalledWith(searchProps);
    expect(secondSearcher.search).toHaveBeenCalledWith(searchProps);

    expect(putter.put).toHaveBeenCalledTimes(2);
    expect(putter.put).toHaveBeenNthCalledWith(1, apartment1);
    expect(putter.put).toHaveBeenNthCalledWith(2, apartment2);
  });

  it('does not continue searching after a successful search', async () => {
    const apartmentResult: Apartment = {
      ...apartment,
      id: 'only-one',
    };

    const firstSearcher = {
      search: jest.fn().mockResolvedValueOnce([apartmentResult]),
    } as unknown as ApartmentSearch;

    const secondSearcher = {
      search: jest.fn(),
    } as unknown as ApartmentSearch;

    const putter = {
      put: jest.fn().mockResolvedValueOnce(undefined),
    } as unknown as ApartmentPut;

    const fallbackApartmentAdapter = new FallbackApartmentAdapter({
      fetchChain: [],
      putChain: [putter],
      searchChain: [firstSearcher, secondSearcher],
    });

    const searchProps = {
      maxPrice: 5000,
      mustAllowPets: true,
      minimumBedrooms: 2,
      minimumBathrooms: 1,
      neighborhoods: [],
    };

    await expect(
      fallbackApartmentAdapter.search(searchProps),
    ).resolves.toStrictEqual([apartmentResult]);

    expect(firstSearcher.search).toHaveBeenCalledWith(searchProps);
    expect(secondSearcher.search).not.toHaveBeenCalled();

    expect(putter.put).toHaveBeenCalledTimes(1);
    expect(putter.put).toHaveBeenCalledWith(apartmentResult);
  });

  it('returns an empty array when all searchers return no results', async () => {
    const firstSearcher = {
      search: jest.fn().mockResolvedValueOnce([]),
    } as unknown as ApartmentSearch;

    const secondSearcher = {
      search: jest.fn().mockResolvedValueOnce([]),
    } as unknown as ApartmentSearch;

    const putter = {
      put: jest.fn(),
    } as unknown as ApartmentPut;

    const fallbackApartmentAdapter = new FallbackApartmentAdapter({
      fetchChain: [],
      putChain: [putter],
      searchChain: [firstSearcher, secondSearcher],
    });

    const searchProps = {
      maxPrice: 4000,
      mustAllowPets: false,
      minimumBedrooms: 1,
      minimumBathrooms: 1,
      neighborhoods: [],
    };

    await expect(
      fallbackApartmentAdapter.search(searchProps),
    ).resolves.toStrictEqual([]);

    expect(firstSearcher.search).toHaveBeenCalledWith(searchProps);
    expect(secondSearcher.search).toHaveBeenCalledWith(searchProps);

    expect(putter.put).not.toHaveBeenCalled();
  });
});
