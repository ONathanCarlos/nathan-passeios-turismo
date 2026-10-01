# Envio direto de avaliação pelo Admin

## Objetivo
Adicionar às reservas concluídas no Admin a ação “Pedir avaliação”, sem exigir qualquer código ou dado do cliente.

## Implementação
- Manter o endereço seguro existente `/avaliar/:token`, que abre diretamente o formulário já vinculado à reserva.
- Adicionar “Pedir avaliação” na lista de reservas concluídas.
- Ao clicar, buscar no servidor o token exclusivo associado à reserva.
- Montar automaticamente o link no domínio atual e abrir o WhatsApp do cliente com a mensagem `👉 Avalie aqui: [LINK]`.
- Se a reserva ainda não possuir convite, gerar o vínculo seguro automaticamente no servidor antes de montar o link.
- Informar no Admin quando a avaliação já tiver sido enviada ou quando não houver passeio válido vinculado.

## Segurança e escopo
- O token permanece associado à reserva, validado somente no servidor e invisível como etapa para o cliente.
- Preservar validações de reserva, passeios permitidos, duplicidade e autorização de publicação.
- Não alterar o formulário de avaliação, preços, pacotes ou demais funcionalidades.

## Verificação
- Testar a ação em reserva concluída e o link direto no celular e computador.
- Confirmar que reserva pendente não oferece a ação.
- Confirmar o tratamento de avaliação já enviada e link inválido.
