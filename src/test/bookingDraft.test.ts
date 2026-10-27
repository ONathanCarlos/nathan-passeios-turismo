import { describe, expect, it } from "vitest";
import {
  BOOKING_DRAFT_TTL_MS,
  bookingDraftKey,
  dateFromLocalKey,
  readBookingDraft,
  saveBookingDraft,
  type SessionStorageLike,
} from "@/lib/bookingDraft";

const memoryStorage = (): SessionStorageLike => {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => { values.set(key, value); },
    removeItem: (key) => { values.delete(key); },
  };
};

const sampleDraft = {
  name: "Cliente Teste",
  cpf: "",
  phone: { ddi: "+55", number: "22999990000" },
  pax: "2",
  date: "2026-12-04",
  pousada: "",
  room: "",
  address: "",
  hasKids: "no" as const,
  kidsCount: "",
  ages: [],
  guests: [{ name: "Cliente Teste", age: "34" }, { name: "Convidada", age: "29" }],
  payment: "credit" as const,
  manualCode: "",
};

describe("temporary booking drafts", () => {
  it("restores form values until the 10-minute expiry and removes expired data", () => {
    const storage = memoryStorage();
    const key = bookingDraftKey("escuna");
    const now = new Date(2026, 9, 23, 12, 0, 0).getTime();

    expect(saveBookingDraft(key, sampleDraft, storage, now)).toBe(true);
    expect(readBookingDraft(key, storage, now + BOOKING_DRAFT_TTL_MS - 1)).toMatchObject(sampleDraft);
    expect(readBookingDraft(key, storage, now + BOOKING_DRAFT_TTL_MS)).toBeNull();
    expect(storage.getItem(key)).toBeNull();
  });

  it("keeps bookings for different tours and packages in separate slots", () => {
    expect(bookingDraftKey("escuna")).not.toBe(bookingDraftKey("catamara"));
    expect(bookingDraftKey(undefined, "combo-verao")).not.toBe(bookingDraftKey(undefined, "combo-inverno"));
  });

  it("restores valid calendar dates in local time and rejects malformed dates", () => {
    expect(dateFromLocalKey("2026-12-04")).toEqual(new Date(2026, 11, 4));
    expect(dateFromLocalKey("2026-02-30")).toBeUndefined();
    expect(dateFromLocalKey("04/12/2026")).toBeUndefined();
  });
});
