import { describe, expect, it } from "vitest";
import { isTourMediaSchemaReady } from "@/lib/cms";

describe("CMS tour media schema detection", () => {
  it("does not mistake missing database columns for a ready media schema", () => {
    expect(isTourMediaSchemaReady({})).toBe(false);
    expect(isTourMediaSchemaReady({ gallery_imagens: [], video_2_url: null })).toBe(true);
  });
});
