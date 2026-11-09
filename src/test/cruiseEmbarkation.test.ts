import { describe, expect, it } from "vitest";
import {
  calculateBookingAmounts,
  calculateEmbarkationFee,
  cruiseFeeApplies,
  CRUISE_CHILD_FEE_NOTICE,
  CRUISE_FEE_BOOKING_NOTICE,
  CRUISE_FEE_DETAIL_NOTICE,
  CRUISE_DATES,
  EMBARKATION_FEE_PER_PERSON,
  ESCUNA_EMBARKATION_FEE_PER_PERSON,
  getCruiseEmbarkationFeePerPerson,
  isCruiseDate,
  packageIncludesCruiseFeeTour,
} from "@/lib/cruiseEmbarkation";
import { calculateCardPriceIncrease, calculatePriceForPayment } from "@/lib/paymentPricing";

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

  it("charges R$5 for Escuna and keeps R$10 for Catamarã, including packages", () => {
    expect(getCruiseEmbarkationFeePerPerson("escuna")).toBe(5);
    expect(getCruiseEmbarkationFeePerPerson("catamara")).toBe(10);
    expect(getCruiseEmbarkationFeePerPerson(undefined, ["escuna"])).toBe(5);
    expect(getCruiseEmbarkationFeePerPerson(undefined, ["catamara"])).toBe(10);
    expect(getCruiseEmbarkationFeePerPerson(undefined, ["escuna", "catamara"])).toBe(10);
    expect(ESCUNA_EMBARKATION_FEE_PER_PERSON).toBe(5);
    expect(EMBARKATION_FEE_PER_PERSON).toBe(10);
  });

  it("charges the configured full fee for each child aged 5 or older, including free and half-fare children", () => {
    expect(calculateEmbarkationFee(true, 2, ["4", "5", "6", "10", "11", "", "5.5"])).toEqual({
      passengerCount: 6,
      amount: 60,
    });
    expect(calculateEmbarkationFee(true, 2, ["4", "5", "6", "10", "11", "", "5.5"], ESCUNA_EMBARKATION_FEE_PER_PERSON)).toEqual({
      passengerCount: 6,
      amount: 30,
    });
    expect(calculateEmbarkationFee(false, 2, ["5", "8"])).toEqual({
      passengerCount: 0,
      amount: 0,
    });
  });

  it("shows the selected fee in all localized cruise notices", () => {
    const marker: Record<"pt" | "es" | "en" | "fr" | "it", string> = {
      pt: "R$ 5",
      es: "R$ 5",
      en: "R$5",
      fr: "5 R$",
      it: "R$ 5",
    };
    for (const lang of ["pt", "es", "en", "fr", "it"] as const) {
      expect(CRUISE_FEE_DETAIL_NOTICE[lang](5)).toContain(marker[lang]);
      expect(CRUISE_FEE_BOOKING_NOTICE[lang](5)).toContain(marker[lang]);
      expect(CRUISE_CHILD_FEE_NOTICE[lang](5)).toContain(marker[lang]);
    }
    expect(CRUISE_FEE_BOOKING_NOTICE.pt(10)).toContain("R$ 10");
    expect(CRUISE_FEE_BOOKING_NOTICE.pt(10)).not.toContain("R$ 5");
  });

  it("calculates 10% on the tour fare only and leaves fixed fees unchanged", () => {
    expect(calculateCardPriceIncrease(210, true)).toBe(21);
    expect(calculatePriceForPayment(210, true)).toBe(231);
    expect(calculateCardPriceIncrease(210, false)).toBe(0);
    expect(calculateBookingAmounts(150, 20, true)).toEqual({
      subtotal: 170,
      fareForPayment: 165,
      cardPriceAdjustment: 15,
      total: 185,
    });
    expect(calculateBookingAmounts(150, 20, false)).toEqual({
      subtotal: 170,
      fareForPayment: 150,
      cardPriceAdjustment: 0,
      total: 170,
    });
  });
});
