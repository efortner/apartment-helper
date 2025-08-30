import { Apartment, ApartmentFetch, ApartmentPut } from '../types/apartment';
import * as fs from 'node:fs';
import { isRawApartment } from '../types/apartment.guard';

export interface SaveApartmentCacheProps {
  readonly directory: string;
}

export class SaveApartmentCache implements ApartmentFetch, ApartmentPut {
  constructor(private readonly props: SaveApartmentCacheProps) {}

  public readonly fetch = async (id: string): Promise<Apartment> => {
    const filePath = `${this.props.directory}/${id}.json`;
    const content: unknown = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (isRawApartment(content)) {
      return {
        bathrooms: content.bathrooms,
        bedrooms: content.bedrooms,
        createdAt: new Date(content.createdAt),
        features: content.features,
        halfBathrooms: content.halfBathrooms,
        id: content.id,
        neighborhood: content.neighborhood,
        noFee: content.noFee,
        price: content.price,
        streetAddress: content.streetAddress,
        unit: content.unit,
        unitType: content.unitType,
        updatedAt: new Date(content.updatedAt),
        url: content.url,
        status: content.status,
      };
    }
    throw new Error(`Invalid apartment content: ${filePath}`);
  };

  public readonly put = async (apartment: Apartment): Promise<Apartment> => {
    const filePath = `${this.props.directory}/${apartment.id}.json`;
    fs.writeFileSync(filePath, JSON.stringify(apartment, null, 2), 'utf8');
    return apartment;
  };
}
