const parsedAge = (value: string): number | null => {
  if (!value.trim()) return null;
  const age = Number(value);
  return Number.isInteger(age) && age >= 0 && age <= 17 ? age : null;
};

/** Formato operacional solicitado para Arraial; não participa de cálculos de preço. */
export const formatArraialPassengerSummary = (adults: number, rawChildAges: readonly string[]): string => {
  const childAges = rawChildAges.map(parsedAge);
  const freeAges = childAges.filter((age): age is number => age !== null && age <= 5);
  const chargeableChildren = rawChildAges.length - freeAges.length;
  const chargeableAges = childAges.filter((age): age is number => age !== null && age > 5);
  const parts = [`${adults}x AD`];

  if (chargeableChildren > 0) {
    const ages = chargeableAges.length ? ` (idades: ${chargeableAges.join(", ")})` : "";
    parts.push(`${chargeableChildren}x CH${ages}`);
  }
  if (freeAges.length > 0) {
    const ageLabel = freeAges.length === 1 ? "idade" : "idades";
    parts.push(`${freeAges.length} Free (${ageLabel}: ${freeAges.join(", ")})`);
  }

  return `👥 ${parts.join(" + ")}`;
};
