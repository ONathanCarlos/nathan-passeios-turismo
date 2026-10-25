import { describe, expect, it } from "vitest";
import { isLowResolution, tourPhotos, TOUR_VIDEO_LIMIT, TOUR_SLIDE_INTERVAL } from "@/lib/tourMedia";

describe("Tour media rules", () => {
  it("allows four photos including the cover", () => {
    expect(tourPhotos(["cover", "", "two", "three", "four", "five"])).toEqual(["cover", "two", "three", "four"]);
  });
  it("allows two videos", () => expect(TOUR_VIDEO_LIMIT).toBe(2));
  it("advances every four seconds", () => expect(TOUR_SLIDE_INTERVAL).toBe(4000));
  it("keeps images below 720p at their natural size regardless of orientation", () => {
    expect(isLowResolution(1280, 719)).toBe(true);
    expect(isLowResolution(719, 1280)).toBe(true);
    expect(isLowResolution(1280, 720)).toBe(false);
    expect(isLowResolution(720, 1280)).toBe(false);
  });
});