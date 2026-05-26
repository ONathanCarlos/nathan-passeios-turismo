# Plano — Rodada de melhorias estratégicas

Tudo abaixo preserva: fluxo de reserva, WhatsApp, multilíngue, cupons, integração de passeios. Mudanças focadas em conversão, clareza visual e operação.

## 1. Schema do banco (uma migração consolidada)

```text
ALTER TABLE pacotes ADD COLUMN preco_original numeric;        -- soma "de" para mostrar economia
ALTER TABLE pacotes ADD COLUMN badge text;                    -- ex.: "mais_vendido", "premium"
ALTER TABLE pacotes ADD COLUMN urgencia text;                 -- ex.: "Alta procura hoje"

ALTER TABLE tours   ADD COLUMN badge text;
ALTER TABLE tours   ADD COLUMN urgencia text;
```

Badges suportadas (enum livre em string, render mapeado no front):
`mais_vendido` 🔥 · `favorito` ⭐ · `hermanos` 🇦🇷 · `premium` 💎 · `experiencia_completa` 🏝️

## 2. Admin — Pacotes

Em `CmsAdminTab.tsx → PacoteRow`:
- Adicionar campos: `preco_original`, `badge` (select), `urgencia` (texto livre).
- **Preview em tempo real**: painel lateral/colapsável que renderiza o `<PacoteCard>` real (mesmo componente do site) usando o `draft` em memória — atualiza ao digitar, sem precisar salvar. Mostra: imagem composta, nome, descrição, preço, "de/por", economia, badge, urgência.

Em `TourRow`: adicionar `badge` e `urgencia` (mesmo padrão).

## 3. Pacotes — destaque de economia + comparação

Em `Pacotes.tsx` e `PacoteDetalhes.tsx`:
- Se `preco_original > preco`: mostrar `De R$ X / por R$ Y / Economize R$ Z` com visual elegante (amber/turquesa).
- Em `PacoteDetalhes`, nova seção **"Você economiza"**: lista cada `tour_key` com seu preço de `TOUR_PRICES`, soma, preço do pacote, economia. Caixa destacada.
- Se `preco_original` estiver vazio, calcular automaticamente da soma dos `tour_keys` (fallback inteligente).

## 4. Selos visuais (badges) nos cards

- Novo componente `<TourBadge type="..." />` com mapeamento ícone+texto+cor.
- Renderizado em: cards de `Index.tsx` (avulsos), cards de `Pacotes.tsx`, hero de `PacoteDetalhes.tsx` e `TourDetails.tsx`.
- Posição: topo-direito do card (abaixo do "+18" quando houver).

## 5. Indicadores de urgência

- Pequena tag discreta abaixo do preço com pulsação suave (ex.: `Alta procura hoje`).
- Configurável no admin (campo livre `urgencia`). Vazio = não exibe.

## 6. Depoimentos (avaliações)

Tabela `depoimentos` já existe + admin já está implementado. Falta apenas:
- Criar `<DepoimentosSection lang />` (carrossel/grid) com avatar/iniciais, estrelas, texto curto, nome.
- Embedar em `Home.tsx` (antes do footer) e em `Index.tsx` (após a grade de passeios).

## 7. Promo automática + scroll suave

Em `Home.tsx` (já tem highlight visual): adicionar `useEffect` que detecta `promoActive` e faz `scrollIntoView({ behavior: "smooth" })` no card "Passeios Avulsos" depois de ~600ms.

## 8. Confirmação visual pré-WhatsApp

O `SummaryOutput` atual já é um resumo elegante com botão "Enviar" — ele já cumpre essa função. Vou:
- Reforçar visualmente: badge "Revise antes de enviar" no topo.
- Trocar o texto do botão para "Confirmar e enviar para WhatsApp".
- Adicionar pequeno checkbox "Confirmo que os dados estão corretos" (opcional, não bloqueia).

## 9. Home — hero emocional/comercial

Em `Home.tsx`, substituir o `welcome` curto por bloco emocional com:
- Headline forte (i18n 5 idiomas): "Explore Búzios do seu jeito."
- Subhead: "Experiências incríveis, passeios inesquecíveis e os melhores combos da região."
- 3 micro-selos de confiança (ex.: ⭐ 4.9 · 🛡️ Reserva segura · 🌐 5 idiomas).

## 10. Performance mobile

- Todas as `<img>` já têm `loading="lazy"`. Adicionar `decoding="async"` e `fetchpriority` nos LCPs.
- Comprimir os assets `src/assets/*.jpg` maiores que 300 KB (script `sharp`/`squoosh`) — mantém PNG/JPG no mesmo nome.
- Lazy-import de rotas pesadas no `App.tsx` (`React.lazy` para `/admin`, `/passeios`, `/pacotes/:key`).
- `<video>` com `preload="metadata"` (já está) e `poster` (já está).

## Arquivos afetados

- `supabase/migrations/<new>.sql` (1 migração)
- `src/lib/pacotes.ts` (tipos)
- `src/components/admin/CmsAdminTab.tsx` (preview + novos campos)
- `src/components/TourBadge.tsx` (novo)
- `src/components/DepoimentosSection.tsx` (novo)
- `src/components/SavingsBox.tsx` (novo)
- `src/pages/Home.tsx`, `src/pages/Index.tsx`, `src/pages/Pacotes.tsx`, `src/pages/PacoteDetalhes.tsx`
- `src/components/SummaryOutput.tsx`
- `src/App.tsx` (lazy routes)

## Fora de escopo (não toco)

- `StandardForm` lógica de cupom/preço/criação de reserva.
- Fluxo de WhatsApp / payload da mensagem.
- `TourDetails` lógica de QR/preço.
- `supabase/integrations/*`, `.env`.

Confirma que posso seguir com tudo isso? Se quiser tirar/adicionar algo, me avise.