import {
  Apartment,
  ApartmentFetch,
  ApartmentPut,
  ApartmentSearch,
  SearchProps,
} from '../types/apartment';

export interface FallbackApartmentAdapterProps {
  readonly fetchChain: ApartmentFetch[];
  readonly putChain: ApartmentPut[];
  readonly searchChain: ApartmentSearch[];
}

export class FallbackApartmentAdapter
  implements ApartmentFetch, ApartmentPut, ApartmentSearch
{
  constructor(private readonly props: FallbackApartmentAdapterProps) {}
  public readonly search = async (props: SearchProps): Promise<Apartment[]> => {
    const searchResults: Apartment[] = [];
    for (const searcher of this.props.searchChain) {
      const searchResult = await searcher.search(props);
      searchResults.push(...searchResult);
      if (searchResult.length > 0) {
        await Promise.all(searchResult.map((apartment) => this.put(apartment)));
        return searchResult;
      }
    }
    return searchResults;
  };

  public readonly fetch = async (id: string): Promise<Apartment> => {
    let apartment: Apartment | undefined = undefined;
    let caughtError: unknown | undefined = undefined;
    for (const fetcher of this.props.fetchChain) {
      try {
        apartment = await fetcher.fetch(id);
      } catch (e) {
        caughtError = e;
      }
      if (apartment) {
        await this.put(apartment);
        return apartment;
      }
    }
    throw caughtError;
  };

  public readonly put = async (apartment: Apartment): Promise<Apartment> => {
    this.props.putChain.forEach((apartmentPutter) =>
      apartmentPutter.put(apartment),
    );
    return apartment;
  };
}
