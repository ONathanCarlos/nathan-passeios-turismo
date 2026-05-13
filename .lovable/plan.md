## Refatoração para CMS persistente — Nathan Turismo

Transformar o painel admin em CMS real com persistência total no backend (Lovable Cloud). Todo conteúdo administrável deixa de ser hardcoded/localStorage e passa a vir do banco, refletindo globalmente para qualquer visitante após refresh.

### 1. Schema do banco (migração SQL)

Novas tabelas públicas (RLS: leitura pública; escrita liberada — admin é protegido por senha simples no frontend, conforme decisão anterior):

- **tours** — `id`, `key` (unique, ex: "buggy", "lanchas"), `nome_pt/en/es`, `descricao_pt/en/es`, `preco`, `imagem_url`, `video_url`, `destaque` (bool), `ativo` (bool), `ordem` (int)
- **home_content** — `id`, `secao` (unique: "hero", "banner_promo", "cta_principal"...), `titulo_pt/en/es`, `subtitulo_pt/en/es`, `cta_texto_pt/en/es`, `cta_link`, `imagem_url`, `ativo`
- **modais** — `id`, `key` (unique: "qr5", "qr10", "natal", "maes"...), `titulo_pt/en/es`, `mensagem_pt/en/es`, `percentual`, `codigo`, `cor_borda`, `ativo`, `regra` (jsonb — datas, condições)
- **depoimentos** — `id`, `nome`, `texto_pt/en/es`, `avatar_url`, `nota` (1-5), `ativo`, `ordem`
- **config_global** — `chave` (PK: "whatsapp", "desconto_padrao", "texto_promo_topo", "instagram_url"...), `valor` (text), `valor_jsonb` (jsonb opcional)

Mantém: `leads`, `cupons`, `reservas`.

### 2. Storage

Bucket público **`media`** com pastas: `tours/`, `home/`, `modais/`, `depoimentos/`. Políticas: leitura pública; insert/update/delete liberados (consistente com o modelo admin atual).

### 3. Camada de dados (`src/lib/cms.ts`)

Funções tipadas + React Query hooks:
- `useTours()`, `useHomeContent()`, `useModais()`, `useDepoimentos()`, `useConfig()`
- `upsertTour()`, `uploadMedia(file, folder)`, `deleteMedia(path)`, etc.
- Realtime opcional via Supabase channels para refletir mudanças sem reload.

### 4. Seed inicial

Migração popula tabelas com TODO conteúdo atualmente hardcoded em:
- `src/lib/tours.ts` → `tours`
- textos do hero/banners de `Index.tsx`/`PromoBanner.tsx` → `home_content`
- modais comemorativos do `AdminPanel` → `modais`
- WhatsApp/links de `WhatsAppFab.tsx` e afins → `config_global`

Garante zero perda visual no primeiro deploy.

### 5. Refatoração dos componentes públicos

Substituir leituras de `tours.ts`, `adminConfig` (localStorage) e strings hardcoded por hooks do CMS em:
- `Index.tsx`, `TourDetails.tsx`, `TourDatePicker.tsx`, `SummaryOutput.tsx`
- `PromoBanner.tsx`, `QrPromo.tsx`, `WhatsAppFab.tsx`, `BackgroundVideo.tsx`
- `StandardForm.tsx` (preço/desconto vêm de `tours` + `config_global`)

`adminConfig` (localStorage) é descontinuado — mantém só preferências de UI puramente locais, se houver.

### 6. Painel admin → CMS real

Reescreve abas de `AdminPanel.tsx`:
- **Passeios**: CRUD completo (lista, edita preço/textos/ativo/ordem, upload de imagem/vídeo, drag handles para `ordem`)
- **Home**: editor por seção (hero, banners, CTAs) com preview
- **Modais**: CRUD com toggle ativo, edição de texto/percentual/cor
- **Depoimentos**: CRUD
- **Config**: WhatsApp, desconto padrão, links, textos
- **Mídia**: navegador do bucket `media` (listar/excluir/reaproveitar URLs)
- **Banco** (atual), **Cupons**, **Reservas**, **Leads**: mantidos

Todas as mutações via `cms.ts` → invalidam React Query → UI atualiza globalmente.

### 7. Compatibilidade preservada

- Design, layout, responsividade, animações, SEO, i18n e fluxo de reserva via WhatsApp **inalterados**
- Apenas a fonte dos dados muda (hardcoded → backend)
- Senha simples do admin (sem auth real) **mantida** conforme decisão anterior

### Detalhes técnicos

- React Query já está no projeto — usar para cache/invalidação
- Uploads: `supabase.storage.from('media').upload()` + retorno de `publicUrl`
- i18n: colunas `_pt/_en/_es` e fallback para `pt` quando ausente (mesmo padrão atual de `adminConfig`)
- Tipos auto-gerados em `src/integrations/supabase/types.ts` cobrem o novo schema após a migração

### Entregáveis

1. Migração SQL completa (tabelas + RLS + bucket + seed)
2. `src/lib/cms.ts` (client + hooks)
3. Componentes públicos refatorados para consumir o CMS
4. `AdminPanel.tsx` reescrito como CMS real com upload de mídia
5. Remoção do `adminConfig` localStorage para conteúdo administrável

### Escopo / observações

- Trabalho extenso (toca ~15 arquivos + nova migração grande). Vou executar em uma única sequência: migração → seed → `cms.ts` → admin → refactor público.
- Cupons/leads/reservas já estão no backend — não serão tocados além de eventual link com `tours`.
- Confirma para eu prosseguir? Posso também fatiar em entregas (ex: começar só por **Passeios + Storage + Mídia** e seguir nas próximas mensagens) se preferir entregas menores e revisáveis.
