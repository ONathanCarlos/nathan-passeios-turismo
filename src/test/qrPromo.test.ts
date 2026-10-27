import { afterEach, describe, expect, it } from "vitest";
import { parseQrFromUrl, qrPromoForTour, urlHasPromoParam, type QrPromo } from "@/lib/qrPromo";

const setPath = (path: string) => window.history.replaceState({}, "", path);

afterEach(() => {
  window.history.replaceState({}, "", "/");
});

describe("tour-specific QR promotions", () => {
  it("parses /passeios/escuna/qr10 as a 10% promotion scoped to escuna", () => {
    setPath("/passeios/escuna/qr10");
    expect(parseQrFromUrl()).toEqual({ percent: 10, campaign: "qr10-escuna", tourKey: "escuna" });
    expect(urlHasPromoParam()).toBe(true);
  });

  it("accepts QR5, case-insensitive codes and supported tour slugs only", () => {
    setPath("/passeios/CATAMARA/QR5");
    expect(parseQrFromUrl()).toEqual({ percent: 5, campaign: "qr5-catamara", tourKey: "catamara" });

    setPath("/passeios/escuna/qr90");
    expect(parseQrFromUrl()).toBeNull();
    expect(urlHasPromoParam()).toBe(false);

    setPath("/passeios/almoco/qr10");
    expect(parseQrFromUrl()).toBeNull();
  });

  it("keeps legacy global QR links working", () => {
    setPath("/qr10");
    expect(parseQrFromUrl()).toEqual({ percent: 10, campaign: "qr10" });

    setPath("/?promo=qr5");
    expect(parseQrFromUrl()).toEqual({ percent: 5, campaign: "qr5" });
  });

  it("applies a targeted promo only to its selected tour, while old unscoped promos remain global", () => {
    const targeted: QrPromo = { percent: 10, campaign: "qr10-escuna", activatedAt: "now", tourKey: "escuna" };
    const global: QrPromo = { percent: 10, campaign: "qr10", activatedAt: "now" };

    expect(qrPromoForTour(targeted, "escuna")).toBe(targeted);
    expect(qrPromoForTour(targeted, "buggy")).toBeNull();
    expect(qrPromoForTour(targeted)).toBeNull();
    expect(qrPromoForTour(global, "buggy")).toBe(global);
  });
});
