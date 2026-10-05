# Moderação de avaliações e envio atômico

## Objetivo
Manter toda nova avaliação oculta até aprovação administrativa e impedir definitivamente reenvios, garantindo que o registro da avaliação e o bloqueio do convite aconteçam em uma única operação.

## Implementação
- Criar uma função protegida no banco que, em uma única transação, valide o convite ainda disponível, grave a avaliação como pendente e marque o convite como utilizado.
- Trocar o envio atual da função pública por essa operação atômica, preservando o formulário, o link curto e todas as validações existentes.
- Restringir a consulta pública a avaliações aprovadas, autorizadas e ainda dentro do prazo.
- Adicionar ao CMS uma aba **Avaliações**, com lista das avaliações e ações para **Aprovar** ou **Rejeitar**.
- Proteger as ações de moderação pela autenticação administrativa existente e atualizar a lista após cada decisão.

## Detalhes técnicos
- Estados de publicação: `pendente`, `aprovada` e `rejeitada`.
- A função transacional bloqueará a linha do convite durante o envio, evitando duas submissões concorrentes.
- A aprovação não altera a avaliação escrita pelo cliente; apenas controla sua exibição pública.
- Não haverá mudanças em reservas, pacotes, preços, traduções ou no formulário de avaliação.

## Verificação
- Confirmar que uma avaliação recém-enviada não aparece publicamente.
- Aprovar no CMS e confirmar que passa a aparecer; rejeitar e confirmar que permanece oculta.
- Disparar envios concorrentes para o mesmo link e confirmar apenas um registro e o convite bloqueado.
- Validar Admin e página pública em celular e computador, além dos testes e verificação de segurança existentes.
