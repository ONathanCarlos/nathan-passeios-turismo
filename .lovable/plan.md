# Página compartilhável de avaliações com código individual

## Objetivo
Criar uma entrada pública em `/avaliar` para o cliente informar seu código individual e abrir a avaliação já vinculada à reserva correta.

## Implementação
- Adicionar a rota `/avaliar`, preservando a rota segura existente `/avaliar/:token`.
- Criar uma tela simples para colar ou digitar o código individual recebido.
- Validar o formato do código antes de continuar e mostrar mensagens claras para código incompleto ou inválido.
- Consultar o vínculo seguro já existente antes de abrir o formulário, sem revelar dados de outras reservas.
- Aceitar também o link completo no campo, extraindo automaticamente o código.
- Redirecionar para `/avaliar/:codigo` após a validação, mantendo o formulário e o envio atuais intactos.

## Segurança
- Cada código continuará sendo exclusivo de uma reserva concluída.
- O servidor continuará validando o código, os passeios permitidos e se a avaliação já foi enviada.
- Nenhuma busca pública por nome, telefone ou data será criada.

## Verificação
- Testar código válido, inválido e já utilizado.
- Conferir a página em celular e computador, sem estouro horizontal.
- Confirmar que as rotas, reservas, preços, pacotes e formulário atual não foram alterados.
