import { describe, expect, it } from "vitest";
import { formatArraialPassengerSummary } from "@/lib/arraialPassengerSummary";

describe("Arraial passenger WhatsApp summary", () => {
  it("groups adults, children and non-paying children with their ages", () => {
    expect(formatArraialPassengerSummary(2, ["8", "10", "4"]))
      .toBe("👥 2x AD + 2x CH (idades: 8, 10) + 1 Free (idade: 4)");
  });

  it("keeps the summary concise when there are no children", () => {
    expect(formatArraialPassengerSummary(3, [])).toBe("👥 3x AD");
  });

  it("shows multiple free children and avoids inventing ages for blank fields", () => {
    expect(formatArraialPassengerSummary(1, ["2", "5"])).toBe("👥 1x AD + 2 Free (idades: 2, 5)");
    expect(formatArraialPassengerSummary(1, ["", ""])).toBe("👥 1x AD + 2x CH");
  });
});
