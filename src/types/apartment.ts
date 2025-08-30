import { NeighborhoodCode } from './neighborhoods';

export interface ApartmentSearch {
  readonly search: (props: SearchProps) => Promise<Apartment[]>;
}

export interface ApartmentFetch {
  readonly fetch: (id: string) => Promise<Apartment>;
}

export interface ApartmentPut {
  readonly put: (apartment: Apartment) => Promise<Apartment>;
}

export interface ApartmentScan {
  readonly scan: () => Promise<Apartment[]>;
}

export interface SearchProps {
  readonly maxPrice: number;
  readonly mustAllowPets: boolean;
  readonly minimumBedrooms: number;
  readonly minimumBathrooms: number;
  readonly neighborhoods: NeighborhoodCode[];
}

export interface Apartment {
  readonly id: string;
  readonly status: 'ACTIVE' | 'RENTED' | 'NO_LONGER_AVAILABLE' | 'DELISTED';
  readonly price: number;
  readonly bedrooms: number;
  readonly bathrooms: number;
  readonly halfBathrooms: number;
  readonly neighborhood: string;
  readonly url?: string;
  readonly noFee: boolean;
  readonly streetAddress: string;
  readonly unit: string;
  readonly unitType: string;
  readonly features: string[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/** @see {isRawApartment} ts-auto-guard:type-guard */
export type RawApartment = Omit<Apartment, 'createdAt' | 'updatedAt'> & {
  readonly createdAt: string;
  readonly updatedAt: string;
};
