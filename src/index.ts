import 'dotenv/config';
import { StreetEasyClient } from 'streeteasy-api';
import { StreetEasyAdapter } from './adapters/street-easy-adapter';
import {
  getBooleanFromEnvironment,
  getNeighborhoodListFromEnvironment,
  getNumberFromEnvironment,
} from './utilities/environment';
import { LocalApartmentCache } from './adapters/local-apartment-cache';
import { SaveApartmentCache } from './adapters/save-apartment-cache';
import { FallbackApartmentAdapter } from './adapters/fallback-apartment-adapter';

(async () => {
  const streetEasyAdapter = new StreetEasyAdapter({
    client: new StreetEasyClient(),
  });
  const localApartmentCache = new LocalApartmentCache();
  const saveApartmentCache = new SaveApartmentCache({
    directory: './data',
  });
  const fallbackApartmentAdapter = new FallbackApartmentAdapter({
    fetchChain: [localApartmentCache, saveApartmentCache, streetEasyAdapter],
    putChain: [localApartmentCache, saveApartmentCache],
    searchChain: [streetEasyAdapter],
  });
  const result = await fallbackApartmentAdapter.search({
    maxPrice: getNumberFromEnvironment('MAX_PRICE'),
    mustAllowPets: getBooleanFromEnvironment('MUST_ALLOW_PETS'),
    minimumBedrooms: getNumberFromEnvironment('MINIMUM_BEDROOMS'),
    minimumBathrooms: getNumberFromEnvironment('MINIMUM_FULL_BATHROOMS'),
    neighborhoods: getNeighborhoodListFromEnvironment('NEIGHBORHOODS'),
  });
  console.info(JSON.stringify(result, null, 2));
  const otherResult = await Promise.all(
    result.map((apartment) => fallbackApartmentAdapter.put(apartment)),
  );
  console.info(JSON.stringify(otherResult, null, 2));
})();
