// Selo visual configurável (mais vendido, premium, etc.) para cards de passeios e pacotes.
import type { Lang } from "@/lib/i18n";

type BadgeKey = "mais_vendido" | "favorito" | "hermanos" | "premium" | "experiencia_completa" | "mais_procurado" | "mais_bem_avaliado";

const MAP: Record<BadgeKey, { icon: string; label: Record<Lang, string>; cls: string }> = {
  mais_vendido: {
    icon: "🔥",
    label: { pt: "Mais vendido", es: "Más vendido", en: "Best seller", fr: "Meilleure vente", it: "Più venduto" },
    cls: "bg-rose-500/95 text-white",
  },
  favorito: {
    icon: "⭐",
    label: { pt: "Favorito dos turistas", es: "Favorito de los turistas", en: "Tourist favorite", fr: "Favori des touristes", it: "Preferito dai turisti" },
    cls: "bg-amber-400/95 text-night",
  },
  hermanos: {
    icon: "🇦🇷",
    label: { pt: "Preferido dos hermanos", es: "Preferido por los hermanos", en: "Argentinian favorite", fr: "Favori des Argentins", it: "Preferito dagli argentini" },
    cls: "bg-sky-400/95 text-night",
  },
  premium: {
    icon: "💎",
    label: { pt: "Premium", es: "Premium", en: "Premium", fr: "Premium", it: "Premium" },
    cls: "bg-violet-500/95 text-white",
  },
  experiencia_completa: {
    icon: "🏝️",
    label: { pt: "Experiência completa", es: "Experiencia completa", en: "Complete experience", fr: "Expérience complète", it: "Esperienza completa" },
    cls: "bg-emerald-500/95 text-white",
  },
  mais_procurado: {
    icon: "🔥",
    label: { pt: "O mais procurado", es: "O mais procurado", en: "O mais procurado", fr: "O mais procurado", it: "O mais procurado" },
    cls: "bg-rose-500/95 text-white",
  },
  mais_bem_avaliado: {
    icon: "⭐",
    label: { pt: "O mais bem avaliado", es: "O mais bem avaliado", en: "O mais bem avaliado", fr: "O mais bem avaliado", it: "O mais bem avaliado" },
    cls: "bg-amber-400/95 text-night",
  },
};

export const BADGE_OPTIONS: { value: BadgeKey; label: string }[] = [
  { value: "mais_vendido", label: "🔥 Mais vendido" },
  { value: "favorito", label: "⭐ Favorito dos turistas" },
  { value: "hermanos", label: "🇦🇷 Preferido dos hermanos" },
  { value: "premium", label: "💎 Premium" },
  { value: "experiencia_completa", label: "🏝️ Experiência completa" },
];

interface Props {
  type: string | null | undefined;
  lang: Lang;
  className?: string;
}

export const TourBadge = ({ type, lang, className = "" }: Props) => {
  if (!type) return null;
  const cfg = MAP[type as BadgeKey];
  if (!cfg) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider shadow-lg ${cfg.cls} ${className}`}
    >
      <span>{cfg.icon}</span>
      <span>{cfg.label[lang]}</span>
    </span>
  );
};

interface UrgencyProps {
  text: string | null | undefined;
  className?: string;
}

export const UrgencyTag = ({ text, className = "" }: UrgencyProps) => {
  if (!text || !text.trim()) return null;
  return (
    <div
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold text-amber-200 ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-300 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
      </span>
      <span>{text}</span>
    </div>
  );
};
