import { Apartment, ApartmentFetch, ApartmentPut } from '../types/apartment';

export class LocalApartmentCache implements ApartmentFetch, ApartmentPut {
  private cache: Map<string, Apartment> = new Map();

  public readonly fetch = async (id: string): Promise<Apartment> => {
    const apartment = this.cache.get(id);
    if (apartment) {
      return apartment;
    }
    throw new Error(`Apartment ID ${id} was not found`);
  };

  readonly put = async (apartment: Apartment): Promise<Apartment> => {
    this.cache.set(apartment.id, apartment);
    return apartment;
  };
}
