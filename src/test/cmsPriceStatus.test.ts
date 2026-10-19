import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockFrom } = vi.hoisted(() => ({ mockFrom: vi.fn() }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: mockFrom },
}));

import { forceRefreshCms, getCmsTourPriceStatus } from "@/lib/cmsCache";

describe("CMS tour price readiness", () => {
  beforeEach(() => {
    mockFrom.mockReset();
  });

  it("never treats a missing, failed, or invalid CMS price as bookable", async () => {
    expect(getCmsTourPriceStatus("escuna")).toBe("loading");

    mockFrom.mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: null, error: new Error("offline") }),
    });
    await forceRefreshCms.tours();
    expect(getCmsTourPriceStatus("escuna")).toBe("error");

    mockFrom.mockReturnValue({
      select: vi.fn().mockRejectedValue(new Error("network")),
    });
    await forceRefreshCms.tours();
    expect(getCmsTourPriceStatus("escuna")).toBe("error");

    mockFrom.mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [{ key: "escuna", preco: 0 }], error: null }),
    });
    await forceRefreshCms.tours();
    expect(getCmsTourPriceStatus("escuna")).toBe("unavailable");

    mockFrom.mockReturnValue({
      select: vi.fn().mockResolvedValue({ data: [{ key: "escuna", preco: 66.67 }], error: null }),
    });
    await forceRefreshCms.tours();
    expect(getCmsTourPriceStatus("escuna")).toBe("ready");
  });
});
