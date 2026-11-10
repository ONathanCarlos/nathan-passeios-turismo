# Ônix — ativação dos termos no Lovable

Esta alteração implementa somente a política e o aceite aprovados. Não implementa a reformulação visual dos mockups nem muda cálculo comercial, texto WhatsApp, arte ou emissão dos vouchers. Almoço fica excluído; os passeios de pacotes mistos ficam abrangidos, não o almoço.

## Ordem obrigatória

**Não publique o novo frontend antes de aplicar a migration e atualizar as Edge Functions no backend correto do site.** O registro do aceite é obrigatório: se seu backend não estiver disponível, a reserva com termos não será concluída. Não foi criado um caminho para salvar sem aceite.

1. Sincronize a `main` no projeto correto da Ônix no Lovable.
2. Aplique exclusivamente `supabase/migrations/20261110003000_add_booking_terms_acceptance.sql` no banco usado por esse projeto. Não aplique em outro projeto Supabase. A migration depende das estruturas de vouchers da etapa anterior, já funcionais no seu site. Não refaça essa migration anterior.
3. Atualize/deploy as funções `public-data` e `admin-data` com seus arquivos `_shared`, incluindo `bookingTerms.ts` e `bookingTermsContent.ts`. Não remova as ações de reservas/vouchers já existentes.
4. Valide na prévia. Só depois publique o frontend pelo Lovable.

## Prompt para enviar ao Lovable

```text
Sincronize a main do repositório ONathanCarlos/nathan-passeios-turismo. A alteração desta etapa adiciona a página /termos-de-uso e o aceite obrigatório dos termos para passeios, excluindo almoço.

Antes de publicar o frontend:
- No backend correto deste projeto, aplique a migration supabase/migrations/20261110003000_add_booking_terms_acceptance.sql, se ainda não estiver aplicada. Não recrie nem reaplique as migrations de vouchers anteriores e não faça backfill.
- Faça o deploy de public-data e admin-data, incluindo todos os arquivos _shared da main, especialmente bookingTerms.ts e bookingTermsContent.ts.
- Não altere preços, regras infantis, taxas, mensagens de WhatsApp ou geração de vouchers. Não implemente nenhuma retenção automática de 5%.
- Confira que as tabelas booking_terms_versions e booking_terms_acceptances existem com RLS e sem permissões de leitura/gravação para anon e authenticated. Apenas o backend service_role faz o registro e o Admin autenticado pode consultar via admin-data.
- Valide as reservas na prévia, inclusive almoço e pacote, e reporte resultados. Não publique ainda; aguarde meu comando.

A criação de reserva com aceite é atômica e o horário vem do banco. Se faltar a migration ou a função de termos, NÃO tente contornar o problema salvando sem aceite; corrija o deploy do backend primeiro.
```

## Conferência na prévia

Abra `/termos-de-uso` e confira a redação integral, a versão `2026-11-09-v1`, os links oficiais e a exclusão do almoço. O link do formulário deve abrir essa página em nova aba com a versão na URL. Uma versão desconhecida deve aparecer como indisponível, não como a versão atual.

No formulário de Escuna, preencha os dados e tente confirmar sem marcar o checkbox: deve aparecer a indicação de aceite obrigatório, sem salvar reserva. Marque por iniciativa própria e confirme: a reserva e o registro do aceite devem ser salvos juntos. A prévia, os valores e a mensagem WhatsApp devem permanecer como antes desta alteração; os termos não são adicionados ao texto da mensagem nem ao voucher.

No CMS, confira a coluna **Aceite dos termos** junto à reserva: versão e data/horário em Brasília. O banco guarda `accepted_at` em timestamp com fuso, fornecido pelo servidor. Repetir a mesma tentativa não deve duplicar reserva nem substituir o primeiro horário registrado.

Repita a conferência em outro passeio e em um pacote. Almoço deve continuar com seu formulário e mensagem atuais, sem checkbox nem retenção. Em pacotes com almoço, apenas os passeios são abrangidos por estes termos.

Passeios novos que antes abriam consulta direta no WhatsApp continuam nesse fluxo: agora solicitam aceite em uma janela antes de abrir o atendimento, mantendo o mesmo texto. Como não existia uma reserva no banco nesse caminho, o registro usa `context = 'cms_inquiry'`, sem criar reserva fictícia. Reservas com formulário usam `context = 'reservation'` e ficam vinculadas ao ID da reserva.

Uma indisponibilidade no registro deve mostrar erro e permitir tentar novamente; não deve declarar um aceite salvo quando ele não foi registrado.

## O que foi verificado antes da entrega

- Suíte completa do projeto: 86 testes passaram na rodada final, incluindo a página versionada e a integração do aceite ao formulário.
- Typecheck e build de produção passaram.
- Lint direcionado sem erros, com aviso histórico de dependência React no formulário.
- Backend simulado: validação de aceite e versão, almoço excluído, payload da operação atômica, rejeição de conflito no retry CMS e rejeição de hash incompatível.
- Migration executada em PostgreSQL temporário local com tabela de reserva e RPC de voucher simulados: timestamp do servidor, idempotência, rejeição de payload alterado, rollback, negação de acesso anônimo e preservação da referência histórica após exclusão de reserva.

**Não foram executadas gravações de teste no banco real nem deploys do Lovable.** O teste completo no backend publicado depende dos passos acima.

## Manutenção de versões

O texto integral e seu SHA-256 ficam arquivados na tabela privada `booking_terms_versions`. O registro de aceite aponta para essa versão. Para uma alteração futura, crie outro identificador de versão e preserve as entradas anteriores do registro versionado de `bookingTermsContent.ts`; não sobrescreva o conteúdo de uma versão já aceita. O backend recusa divergência entre a versão arquivada e o hash do texto implantado.
