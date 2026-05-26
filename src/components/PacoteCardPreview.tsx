// Preview ao vivo do card de pacote — usado no Admin para visualizar antes de salvar.
import { PackageCover } from "./PackageCover";
import { TourBadge, UrgencyTag } from "./TourBadge";
import { PriceWithDiscount } from "./SavingsBox";
import { Sparkles } from "lucide-react";
import type { Pacote } from "@/lib/pacotes";

interface Props {
  draft: Partial<Pacote> & { nome_pt?: string; preco?: number };
  tourImages: Record<string, string>;
}

export const PacoteCardPreview = ({ draft, tourImages }: Props) => {
  const imgs = (draft.tour_keys || [])
    .map((k) => tourImages[k])
    .filter(Boolean) as string[];
  const cover = draft.imagem_url ? [draft.imagem_url] : imgs;
  const nome = draft.nome_pt || "Nome do pacote";
  const desc = draft.descricao_pt || "";

  return (
    <div className="sticky top-4">
      <div className="text-[10px] uppercase tracking-wider font-bold text-turquoise-glow mb-2">
        ✦ Preview ao vivo (como o cliente verá)
      </div>
      <article className="group glass-card rounded-2xl overflow-hidden flex flex-col border-turquoise/40 max-w-[320px]">
        <div className="relative aspect-[4/3] overflow-hidden bg-night">
          {cover.length > 0 ? (
            <PackageCover images={cover} alt={nome} className="absolute inset-0 w-full h-full" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">
              Sem imagens
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/10 to-transparent pointer-events-none" />
          <span className="absolute top-2 left-2 inline-flex items-center gap-1 rounded-md bg-amber-400/95 px-2 py-0.5 text-[10px] font-extrabold text-night uppercase tracking-wider shadow-lg">
            <Sparkles className="w-3 h-3" /> Combo
          </span>
          {draft.badge && (
            <div className="absolute top-2 right-2">
              <TourBadge type={draft.badge} lang="pt" />
            </div>
          )}
          {draft.destaque && (
            <span className="absolute bottom-2 left-2 inline-flex items-center rounded-md bg-violet-500/90 px-2 py-0.5 text-[10px] font-bold text-white shadow">
              ★ Destaque
            </span>
          )}
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h3 className="text-lg font-bold text-foreground leading-tight">{nome}</h3>
          {desc && <p className="mt-1.5 text-sm text-muted-foreground leading-snug">{desc}</p>}
          <div className="mt-3">
            <PriceWithDiscount
              price={draft.preco || 0}
              originalPrice={draft.preco_original ?? null}
              lang="pt"
              size="md"
            />
          </div>
          <UrgencyTag text={draft.urgencia} className="mt-2" />
        </div>
      </article>
    </div>
  );
};
