# Link curto e nova mensagem de avaliação

## Objetivo
Alterar somente o envio já existente do botão “Pedir avaliação”: usar a nova mensagem e um link curto, aleatório e interno, sem expor o token original.

## Implementação
- Acrescentar ao convite de avaliação existente um código curto aleatório, único e não sequencial, acessível somente pelas funções do servidor.
- Ao clicar em “Pedir avaliação”, reutilizar o código curto da reserva ou gerar um novo quando necessário, sem devolver o token original ao navegador.
- Criar a rota pública `/a/:codigo`, que solicita ao servidor a resolução do código e abre o formulário existente com segurança.
- Na resolução, validar o código no servidor e devolver apenas uma credencial temporária de acesso ao formulário, sem revelar o token original persistente.
- Manter `/avaliar/:token` e todas as validações atuais para compatibilidade, sem alterar o formulário.
- Substituir somente o texto pré-preenchido do WhatsApp pela mensagem fornecida, com `👉 AVALIE AQUI:` e o URL curto em linha separada.
- Para códigos inexistentes ou alterados, mostrar o estado atual de link inválido, sem revelar dados internos.

## Segurança e banco
- Alterar somente `convites_avaliacao`, adicionando o código curto único necessário ao vínculo.
- Código gerado com aleatoriedade criptográfica e restrição de unicidade; nenhuma informação pessoal ou ID sequencial entra na URL.
- Preservar o vínculo convite → reserva, os passeios permitidos, bloqueio após envio e demais regras existentes.

## Verificação
- Criar ou usar uma reserva concluída de teste e acionar “Pedir avaliação”.
- Confirmar o texto integral no WhatsApp e o formato curto `/a/...`.
- Abrir o link em celular e computador e confirmar a reserva correta.
- Testar código inválido e código alterado, confirmando que não abrem outra reserva.
- Executar validação de tipos, verificação do projeto e checagem de segurança da alteração.

## Arquivos previstos
- Migração para `convites_avaliacao`.
- `supabase/functions/admin-data/index.ts`.
- `supabase/functions/public-data/index.ts`.
- `src/lib/db.ts` e/ou `src/lib/reviews.ts`.
- `src/components/admin/sections/ReservasSection.tsx`.
- `src/App.tsx` e uma página curta de resolução, sem alterar `src/pages/Avaliacao.tsx` além do estritamente necessário para receber a credencial resolvida.
