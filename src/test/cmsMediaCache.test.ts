import { describe, expect, it, vi } from "vitest";

const { mockFrom } = vi.hoisted(() => ({ mockFrom: vi.fn() }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: mockFrom },
}));

import { forceRefreshCms, getCachedTour } from "@/lib/cmsCache";

async function refreshWith(row: Record<string, unknown>) {
  mockFrom.mockReturnValue({
    select: vi.fn().mockResolvedValue({ data: [{ key: "escuna", ...row }], error: null }),
  });
  await forceRefreshCms.tours();
  return getCachedTour("escuna");
}

describe("CMS optional media columns", () => {
  it("keeps existing media usable when optional columns are absent", async () => {
    const tour = await refreshWith({ imagem_url: "cover.jpg", video_url: "first.mp4" });
    expect(tour?.imagem_url).toBe("cover.jpg");
    expect(tour?.video_url).toBe("first.mp4");
    expect(tour?.gallery_imagens).toEqual([]);
    expect(tour?.video_2_url).toBeNull();
  });

  it("preserves three additional photos and the second video when supplied", async () => {
    const tour = await refreshWith({
      gallery_imagens: ["two.jpg", null, "three.jpg", "", "four.jpg", "five.jpg"],
      video_2_url: "second.mp4",
    });
    expect(tour?.gallery_imagens).toEqual(["two.jpg", "three.jpg", "four.jpg"]);
    expect(tour?.video_2_url).toBe("second.mp4");
  });

  it("ignores malformed optional media values", async () => {
    const tour = await refreshWith({ gallery_imagens: {}, video_2_url: 42 });
    expect(tour?.gallery_imagens).toEqual([]);
    expect(tour?.video_2_url).toBeNull();
  });
});