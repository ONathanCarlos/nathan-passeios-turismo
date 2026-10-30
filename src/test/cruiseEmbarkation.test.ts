import { describe, expect, it } from "vitest";
import {
  calculateBookingAmounts,
  calculateCreditSurcharge,
  calculateEmbarkationFee,
  cruiseFeeApplies,
  CRUISE_DATES,
  isCruiseDate,
  packageIncludesCruiseFeeTour,
} from "@/lib/cruiseEmbarkation";

describe("cruise embarkation fee", () => {
  it("recognizes all cruise dates regardless of the cruise ship pier", () => {
    expect(CRUISE_DATES.size).toBe(87);
    expect(isCruiseDate(new Date(2026, 9, 27))).toBe(true);
    expect(isCruiseDate(new Date(2027, 3, 7))).toBe(true);
    expect(isCruiseDate(new Date(2027, 3, 8))).toBe(false);
  });

  it("applies only to schooner and catamaran bookings on a cruise date", () => {
    const date = new Date(2026, 11, 4);
    expect(cruiseFeeApplies("escuna", date)).toBe(true);
    expect(cruiseFeeApplies("catamara", date)).toBe(true);
    expect(cruiseFeeApplies("buggy", date)).toBe(false);
    expect(cruiseFeeApplies("escuna", new Date(2026, 11, 5))).toBe(false);
    expect(packageIncludesCruiseFeeTour(["buggy", "escuna"])).toBe(true);
    expect(packageIncludesCruiseFeeTour(["buggy", "arraial"])).toBe(false);
  });

  it("charges R$10 in full for each child aged 5 or older, including free and half-fare children", () => {
    expect(calculateEmbarkationFee(true, 2, ["4", "5", "6", "10", "11", "", "5.5"])).toEqual({
      passengerCount: 6,
      amount: 60,
    });
    expect(calculateEmbarkationFee(false, 2, ["5", "8"])).toEqual({
      passengerCount: 0,
      amount: 0,
    });
  });

  it("calculates the 5% card surcharge over the subtotal, including the embarkation fee", () => {
    expect(calculateCreditSurcharge(210, true)).toBe(10.5);
    expect(calculateCreditSurcharge(210, false)).toBe(0);
    expect(calculateBookingAmounts(150, 20, true)).toEqual({
      subtotal: 170,
      creditSurcharge: 8.5,
      total: 178.5,
    });
    expect(calculateBookingAmounts(150, 20, false)).toEqual({
      subtotal: 170,
      creditSurcharge: 0,
      total: 170,
    });
  });
});
