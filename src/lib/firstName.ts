export const getFirstName = (value: string | null | undefined, fallback = "Cliente"): string => {
  const normalized = typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
  return normalized ? normalized.split(" ")[0] : fallback;
};
