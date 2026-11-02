import type { TourKey } from "@/lib/tours";

export const REGIONAL_EMBARKATION_FEE_PER_PERSON = 15;
export const JARDINEIRA_FEE_PER_PERSON = 10;

const REGIONAL_FEE_TOURS = new Set<TourKey>(["arraial", "cabofrio"]);

export interface RegionalBookingFees {
  passengerCount: number;
  embarkationFee: number;
  jardineiraFee: number;
}

export const calculateRegionalBookingFees = (
  tourKey: TourKey | undefined,
  adultPassengers: number,
  childPassengers: number,
): RegionalBookingFees => {
  if (!tourKey || !REGIONAL_FEE_TOURS.has(tourKey)) {
    return { passengerCount: 0, embarkationFee: 0, jardineiraFee: 0 };
  }

  const adults = Number.isInteger(adultPassengers) ? Math.max(0, adultPassengers) : 0;
  const children = Number.isInteger(childPassengers) ? Math.max(0, childPassengers) : 0;
  const passengerCount = adults + children;

  return {
    passengerCount,
    embarkationFee: passengerCount * REGIONAL_EMBARKATION_FEE_PER_PERSON,
    jardineiraFee: passengerCount * JARDINEIRA_FEE_PER_PERSON,
  };
};
