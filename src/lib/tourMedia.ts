export const TOUR_PHOTO_LIMIT = 4;
export const TOUR_VIDEO_LIMIT = 2;
export const TOUR_SLIDE_INTERVAL = 4000;

// 720p is measured by the short edge, regardless of orientation.
export const isLowResolution = (width: number, height: number) =>
  width > 0 && height > 0 && Math.min(width, height) < 720;

export const tourPhotos = (images: string[]) => images.filter(Boolean).slice(0, TOUR_PHOTO_LIMIT);