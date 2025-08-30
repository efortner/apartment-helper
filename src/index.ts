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
import { SaveApartmentScanner } from './adapters/save-apartment-scanner';

(async () => {
  const streetEasyAdapter = new StreetEasyAdapter({
    client: new StreetEasyClient(),
  });
  const localApartmentCache = new LocalApartmentCache();
  const saveApartmentCache = new SaveApartmentCache({
    directory: './data',
  });
  const saveApartmentScanner = new SaveApartmentScanner({
    directory: './data',
    apartmentFetcher: saveApartmentCache,
  });
  const fallbackApartmentAdapter = new FallbackApartmentAdapter({
    fetchChain: [localApartmentCache, saveApartmentCache, streetEasyAdapter],
    putChain: [localApartmentCache, saveApartmentCache],
    searchChain: [streetEasyAdapter],
  });
  const priorListings = await saveApartmentScanner.scan();
  const currentListings = await fallbackApartmentAdapter.search({
    maxPrice: getNumberFromEnvironment('MAX_PRICE'),
    mustAllowPets: getBooleanFromEnvironment('MUST_ALLOW_PETS'),
    minimumBedrooms: getNumberFromEnvironment('MINIMUM_BEDROOMS'),
    minimumBathrooms: getNumberFromEnvironment('MINIMUM_FULL_BATHROOMS'),
    neighborhoods: getNeighborhoodListFromEnvironment('NEIGHBORHOODS'),
  });
  const priorApartmentIds = new Set(priorListings.map((listing) => listing.id));
  const newListings = currentListings.filter(
    (listing) => !priorApartmentIds.has(listing.id),
  );
  console.info(JSON.stringify(newListings, null, 2));
})();
