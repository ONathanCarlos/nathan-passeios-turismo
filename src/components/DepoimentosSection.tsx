// Seção pública de depoimentos. Lê de `depoimentos` (CMS).
import { useDepoimentos, pickLang } from "@/lib/cms";
import { Star } from "lucide-react";
import type { Lang } from "@/lib/i18n";

const L: Record<Lang, { title: string; subtitle: string }> = {
  pt: { title: "Quem viajou com a gente", subtitle: "Avaliações reais de quem viveu Búzios com o Nathan." },
  es: { title: "Quienes viajaron con nosotros", subtitle: "Opiniones reales de quienes vivieron Búzios con Nathan." },
  en: { title: "Travelers who joined us", subtitle: "Real reviews from people who lived Búzios with Nathan." },
  fr: { title: "Ils ont voyagé avec nous", subtitle: "Avis réels de ceux qui ont vécu Búzios avec Nathan." },
  it: { title: "Hanno viaggiato con noi", subtitle: "Recensioni reali di chi ha vissuto Búzios con Nathan." },
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

interface Props {
  lang: Lang;
  className?: string;
}

export const DepoimentosSection = ({ lang, className = "" }: Props) => {
  const { data } = useDepoimentos(true);
  const t = L[lang];
  const list = (data || []).slice(0, 6);
  if (list.length === 0) return null;

  return (
    <section className={`mt-14 ${className}`}>
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">
          <span className="bg-gradient-to-r from-amber-300 via-turquoise-glow to-turquoise bg-clip-text text-transparent">
            {t.title}
          </span>
        </h2>
        <p className="text-sm text-muted-foreground mt-2">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((d) => {
          const texto = pickLang(d as any, "texto", lang);
          return (
            <article
              key={d.id}
              className="glass-card rounded-2xl p-5 flex flex-col gap-3 hover:border-turquoise/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {d.avatar_url ? (
                  <img
                    src={d.avatar_url}
                    alt={d.nome}
                    loading="lazy"
                    decoding="async"
                    className="w-11 h-11 rounded-full object-cover border border-turquoise/40"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-turquoise to-deep-blue flex items-center justify-center text-sm font-bold text-night border border-turquoise/40">
                    {initials(d.nome) || "★"}
                  </div>
                )}
                <div className="leading-tight">
                  <div className="text-sm font-bold text-foreground">{d.nome}</div>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < (d.nota || 5)
                            ? "fill-amber-300 text-amber-300"
                            : "text-muted-foreground/30"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              {texto && (
                <p className="text-sm text-foreground/85 leading-relaxed italic">
                  “{texto}”
                </p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
};
