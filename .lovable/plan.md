
# Reforma do site de turismo

Vou dividir em 7 blocos de trabalho. Páginas de reserva e fluxo de envio não serão tocados (apenas a frase inicial da mensagem WhatsApp).

## 1. Nova Home principal (`/`)

Criar nova página `src/pages/Home.tsx` como rota raiz (`/`). Conteúdo:
- Hero curto com headline turística.
- Dois grandes botões/cards de navegação:
  - **Passeios Avulsos** → leva para `/passeios` (atual Index).
  - **Pacotes de Passeios** → leva para `/pacotes`.
- Cada botão tem **ícone composto de 4 quadradinhos** com imagens:
  - Avulsos: Escuna, Buggy, Arraial do Cabo, Mergulho (puxadas de `tours` por `key`).
  - Pacotes: Catamarã, Cabo Frio, Lancha Privada, Jardineira.
- Frase comercial nos pacotes: *"Mais experiências por menos: aproveite os melhores combos de Búzios com preços especiais."*

A home atual (`Index.tsx`) move para rota `/passeios`. **Nenhuma alteração estrutural** nela. Roteamento atualizado em `App.tsx`.

## 2. Sistema de Pacotes

### Banco de dados (nova tabela `pacotes`)
Colunas: `id`, `key` (slug), `nome_pt/en/es/fr/it`, `descricao_pt/...`, `preco`, `tour_keys` (text[]) — lista de keys de tours que compõem o pacote, `imagem_url` (opcional override), `video_url` (opcional), `ativo`, `destaque`, `ordem`, `info_adicional`, timestamps. RLS pública aberta (mesma postura das outras tabelas).

Seed inicial com os 6 pacotes listados:
- Búzios Paradise (Escuna+Buggy+Almoço) — 205
- Mar & Terra (Escuna+Buggy) — 160
- Buggy & Food (Buggy+Almoço) — 150
- Perfeição de Búzios (Escuna+Almoço) — 110
- Dive & Drive (Mergulho+Buggy) — 280
- Brigitte Bardot (Catamarã+Jardineira) — 200

### Página `/pacotes` (`src/pages/Pacotes.tsx`)
- Frase comercial em destaque.
- Lista de cards. Cada card:
  - **Imagem composta** gerada dinamicamente a partir de `tour_keys`: 1→full, 2→split lado a lado, 3→split com 1 grande + 2 pequenas.
  - Imagens reaproveitam `tours.imagem_url` pelo `key`. Almoço usa um tour `key='almoco'` (criado no seed se não existir).
  - Nome, preço, descrição.
  - Botões "Ver Detalhes" e "Reservar Agora".
- "Ver Detalhes" → `/pacotes/:key` que renderiza os detalhes de cada tour componente em sequência (reusa `TourDetails`).
- "Reservar Agora" → leva ao formulário padrão com o pacote pré-selecionado (mesmo `StandardForm`, destino = nome do pacote, preço = `pacote.preco`).

### Admin (`/admin`)
Nova aba **"Pacotes"** em `CmsAdminTab` (ou seção dedicada) com CRUD completo: criar, editar nome/descrição/preço/mídia/vídeo, selecionar `tour_keys` (multiselect dos tours existentes), ativar/desativar, ordem, destaque. Mesma UX dos passeios.

## 3. Regra de cupons/modais — só para avulsos

- `CampaignPromoModal`, `SpanishLangModal`, `PromoBanner`, `QrPromoBoot` continuam ativos **apenas** nas rotas `/`, `/passeios` (não em `/pacotes`).
- Aviso "*Desconto válido apenas para passeios avulsos." adicionado:
  - rodapé dos modais promocionais (`CampaignPromoModal`, `SpanishLangModal`);
  - rodapé do `PromoBanner`.
- No `StandardForm`, quando `destino` for de um pacote, ignorar/desabilitar campo de cupom e qualquer desconto automático aplicado por promo URL.

## 4. Tema visual: preto + turquesa, degradê

`src/index.css`:
- Substituir tokens `--deep-blue` / `--night` por preto (`0 0% 0%` / `0 0% 6%`). `--turquoise` mantido.
- Trocar background listrado (`.ocean-static-bg`) por **gradiente moderno** preto→preto-azulado→turquesa sutil, com radial highlight. Sem stripes.
- Tipografia/espaçamentos inalterados.

## 5. WhatsApp flutuante + Botão voltar ao topo

- `WhatsAppFab`: garantir `position: fixed` em todo scroll (já é fixed; verificar e mover montagem para layout raiz se necessário, exibir desde o topo).
- Novo `ScrollToTopFab.tsx`: seta discreta, `fixed bottom-24 right-6`, aparece após `scrollY > 400`, smooth scroll para topo.
- Ambos montados no layout raiz (renderizados em `App.tsx` fora das rotas), aparecem em todas as páginas exceto `/admin`.

## 6. Fluidez

- Adicionar `scroll-behavior: smooth` no `html` e `content-visibility: auto` em seções longas da home.
- `will-change: transform` apenas em elementos animados específicos.
- Manter otimizações anteriores (lazy admin, sem background-attachment fixed mobile).

## 7. Mensagem do WhatsApp

Em `StandardForm.tsx`, no builder da mensagem, prefixar:
> "Olá Nathan! Aqui está minha reserva completa!\n\n"
Restante intocado.

## Detalhes técnicos

- Composição de imagem do pacote: componente `PackageCover` que recebe array de URLs e renderiza grid CSS (1, 2 ou 4 células — para 3 usa layout 1 grande + 2 pequenas).
- Slug do pacote = `key`. URLs: `/pacotes`, `/pacotes/:key`.
- `useTours()` reutilizado para resolver imagens via map `key → tour`.
- Hook novo `usePacotes()` espelhando padrão de `useTours`.
- Tipos: regenerados automaticamente após migração.
- i18n: nomes/descrições traduzidos como nos tours; fallback PT.
- A frase de aviso vai para `i18n.ts` para suportar idiomas.

## Arquivos novos
- `supabase/migrations/<ts>_pacotes.sql`
- `src/pages/Home.tsx`
- `src/pages/Pacotes.tsx`
- `src/pages/PacoteDetalhes.tsx`
- `src/components/PackageCover.tsx`
- `src/components/ScrollToTopFab.tsx`
- `src/components/admin/sections/PacotesSection.tsx` (ou aba no `CmsAdminTab`)
- `src/lib/pacotes.ts`

## Arquivos editados
- `src/App.tsx` (rotas + FABs globais)
- `src/index.css` (tema preto + gradiente)
- `src/components/StandardForm.tsx` (prefixo msg + bloquear cupom em pacote)
- `src/components/CampaignPromoModal.tsx`, `SpanishLangModal.tsx`, `PromoBanner.tsx` (aviso)
- `src/components/admin/CmsAdminTab.tsx` (CRUD pacotes)
- `src/pages/Index.tsx` (sem mudanças estruturais; só remover montagem dupla de FABs se aplicável)

## Não será alterado
- Lógica e UI de reserva e conclusão da reserva.
- Estrutura visual da página de passeios avulsos atual.
