import { StreetEasyClient } from 'streeteasy-api';
import {
  Apartment,
  ApartmentFetch,
  ApartmentSearch,
  SearchProps,
} from '../types/apartment';

export interface ApartmentAdapterProps {
  readonly client: StreetEasyClient;
}

export class StreetEasyAdapter implements ApartmentSearch, ApartmentFetch {
  constructor(private readonly props: ApartmentAdapterProps) {}

  public readonly search = async (props: SearchProps): Promise<Apartment[]> => {
    const { client } = this.props;
    const searchResults = await client
      .searchRentals({
        adStrategy: 'NONE',
        sorting: {
          attribute: 'RECOMMENDED',
          direction: 'DESCENDING',
        },
        filters: {
          areas: props.neighborhoods,
          rentalStatus: 'ACTIVE',
          petsAllowed: props.mustAllowPets ? true : undefined,
          price: {
            lowerBound: null,
            upperBound: props.maxPrice,
          },
          bedrooms: {
            lowerBound: props.minimumBedrooms,
            upperBound: null,
          },
          bathrooms: {
            lowerBound: props.minimumBathrooms,
            upperBound: null,
          },
        },
      })
      .then((response) =>
        response.searchRentals.edges.map((edge) => ({
          id: edge.node.id,
          price: edge.node.price,
          neighborhood: edge.node.areaName,
          bedrooms: edge.node.bedroomCount,
          bathrooms: edge.node.fullBathroomCount,
          halfBathrooms: edge.node.halfBathroomCount,
          url: `https://streeteasy.com${edge.node.urlPath}`,
          noFee: edge.node.noFee,
          streetAddress: edge.node.street,
          unit: edge.node.unit,
          unitType: edge.node.buildingType,
        })),
      );
    return Promise.all(
      searchResults.map((result) =>
        client.getRentalListingDetails(result.id).then(
          (response) =>
            ({
              ...result,
              features:
                response.rentalByListingId.propertyDetails.features.list,
              status: <Apartment['status']>response.rentalByListingId.status,
              createdAt: new Date(response.rentalByListingId.createdAt),
              updatedAt: new Date(response.rentalByListingId.updatedAt),
            }) satisfies Apartment,
        ),
      ),
    );
  };

  public readonly fetch = async (id: string): Promise<Apartment> => {
    const { client } = this.props;
    const response = await client.getRentalListingDetails(id);
    return {
      id: id,
      price: response.rentalByListingId.pricing.price,
      bedrooms: response.rentalByListingId.propertyDetails.bedroomCount,
      bathrooms: response.rentalByListingId.propertyDetails.fullBathroomCount,
      halfBathrooms:
        response.rentalByListingId.propertyDetails.halfBathroomCount,
      neighborhood: response.buildingByRentalListingId.area.name,
      noFee: response.rentalByListingId.pricing.noFee,
      streetAddress: response.buildingByRentalListingId.address.street,
      unit: response.rentalByListingId.propertyDetails.address.unit ?? '',
      unitType: response.buildingByRentalListingId.type,
      features: response.rentalByListingId.propertyDetails.features.list,
      status: <Apartment['status']>response.rentalByListingId.status,
      createdAt: new Date(response.rentalByListingId.createdAt),
      updatedAt: new Date(response.rentalByListingId.updatedAt),
    } satisfies Apartment;
  };
}
