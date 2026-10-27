import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { QrPromoBoot } from "@/components/QrPromo";

describe("tour QR promotion modal", () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, "", "/passeios/escuna/qr10");
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
    window.history.replaceState({}, "", "/");
  });

  it("shows the promotional modal and stores the percent scoped to the tour from the direct link", async () => {
    render(<QrPromoBoot lang="pt" />);

    expect(await screen.findByText("10% OFF")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("nathan_qr_promo_v1") || "null")).toMatchObject({
      percent: 10,
      campaign: "qr10-escuna",
      tourKey: "escuna",
    });
  });
});
