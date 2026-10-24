export const BOOKING_DRAFT_TTL_MS = 10 * 60 * 1000;

export interface BookingDraft {
  name: string;
  cpf: string;
  phone: { ddi: string; number: string };
  pax: string;
  date: string;
  pousada: string;
  room: string;
  address: string;
  hasKids: "yes" | "no" | "";
  kidsCount: string;
  ages: string[];
  payment: "cash" | "debit" | "credit" | "pix" | "";
  manualCode: string;
  expiresAt: number;
}

export type SessionStorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const getSessionStorage = (): SessionStorageLike | null => {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
};

export const bookingDraftKey = (tourKey?: string, packageId?: string, title?: string): string => {
  const identity = tourKey ? `tour:${tourKey}` : `package:${packageId || title || "unknown"}`;
  return `onix:booking-draft:${identity}`;
};

export const readBookingDraft = (
  key: string,
  storage: SessionStorageLike | null = getSessionStorage(),
  now = Date.now(),
): BookingDraft | null => {
  if (!storage) return null;
  try {
    const raw = storage.getItem(key);
    if (!raw) return null;
    const value = JSON.parse(raw) as Partial<BookingDraft>;
    if (typeof value.expiresAt !== "number" || value.expiresAt <= now) {
      storage.removeItem(key);
      return null;
    }
    return {
      name: typeof value.name === "string" ? value.name : "",
      cpf: typeof value.cpf === "string" ? value.cpf : "",
      phone: {
        ddi: typeof value.phone?.ddi === "string" ? value.phone.ddi : "+55",
        number: typeof value.phone?.number === "string" ? value.phone.number : "",
      },
      pax: typeof value.pax === "string" ? value.pax : "",
      date: typeof value.date === "string" ? value.date : "",
      pousada: typeof value.pousada === "string" ? value.pousada : "",
      room: typeof value.room === "string" ? value.room : "",
      address: typeof value.address === "string" ? value.address : "",
      hasKids: value.hasKids === "yes" || value.hasKids === "no" ? value.hasKids : "",
      kidsCount: typeof value.kidsCount === "string" ? value.kidsCount : "",
      ages: Array.isArray(value.ages) ? value.ages.filter((age): age is string => typeof age === "string").slice(0, 8) : [],
      payment: value.payment === "cash" || value.payment === "debit" || value.payment === "credit" || value.payment === "pix" ? value.payment : "",
      manualCode: typeof value.manualCode === "string" ? value.manualCode : "",
      expiresAt: value.expiresAt,
    };
  } catch {
    try { storage.removeItem(key); } catch { /* storage may be unavailable */ }
    return null;
  }
};

export const saveBookingDraft = (
  key: string,
  draft: Omit<BookingDraft, "expiresAt">,
  storage: SessionStorageLike | null = getSessionStorage(),
  now = Date.now(),
): boolean => {
  if (!storage) return false;
  try {
    storage.setItem(key, JSON.stringify({ ...draft, expiresAt: now + BOOKING_DRAFT_TTL_MS }));
    return true;
  } catch {
    return false;
  }
};

export const clearBookingDraft = (
  key: string,
  storage: SessionStorageLike | null = getSessionStorage(),
): void => {
  try { storage?.removeItem(key); } catch { /* storage may be unavailable */ }
};

export const dateFromLocalKey = (key: string): Date | undefined => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) return undefined;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : undefined;
};
