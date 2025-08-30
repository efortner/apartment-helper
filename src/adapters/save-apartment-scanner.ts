import { Apartment, ApartmentFetch, ApartmentScan } from '../types/apartment';
import * as fs from 'node:fs';

export interface SaveApartmentScannerProps {
  readonly directory: string;
  readonly apartmentFetcher: ApartmentFetch;
}

export class SaveApartmentScanner implements ApartmentScan {
  constructor(private readonly props: SaveApartmentScannerProps) {}

  public readonly scan = (): Promise<Apartment[]> =>
    Promise.all(
      fs
        .readdirSync(this.props.directory)
        .filter((file) => file.endsWith('.json'))
        .map((fileName) => fileName.split('.')[0]!)
        .map((apartmentId) => this.props.apartmentFetcher.fetch(apartmentId)),
    );
}
