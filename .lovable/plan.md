# Sistema completo de avaliações de clientes

## Objetivo
Criar uma página exclusiva de avaliação, vinculada com segurança à reserva, com validação completa, confirmação e armazenamento preparado para uso futuro no painel administrativo e no site.

## O que será implementado
- Criar uma estrutura protegida para convites e avaliações, com token individual, vínculo à reserva e lista fechada de passeios permitidos.
- Gerar o vínculo de avaliação no servidor a partir da reserva; para pacotes, resolver os passeios já vinculados sem alterar sua lógica atual.
- Criar a página `/avaliar/:token`, carregando apenas os dados mínimos necessários da reserva e impedindo troca manual de reserva ou passeio.
- Implementar avaliações de 1 a 5 em passos de 0,5 para atendimento, reserva, passeio e recomendação.
- Exigir comentário do passeio (até 400 caracteres), autorização de publicação e melhoria quando a nota do passeio for menor que 4.
- Adicionar observações opcionais de até 1000 caracteres.
- Validar todos os campos no navegador, na função segura do servidor e no banco de dados.
- Impedir envio duplicado para a mesma reserva e passeio.
- Registrar consentimento, data da avaliação e expiração automática calculada em 6 meses, sem executar limpeza automática.
- Mostrar agradecimento, resumo, média final e a informação do desconto de 5%, sem criar cupom nem alterar preços.
- Deixar as avaliações registradas e prontas para uma futura tela administrativa, sem criar agora botão, envio por WhatsApp ou exibição pública.

## Segurança e dados
- Os dados de reserva e a lista de passeios serão resolvidos exclusivamente no servidor pelo token individual.
- As novas tabelas ficarão bloqueadas para acesso direto do navegador; somente a função segura poderá consultar convites e gravar avaliações.
- O token não será armazenado em texto aberto: somente seu resumo criptográfico ficará salvo.
- Restrições do banco reforçarão notas válidas, limites de texto, consentimento obrigatório, validade e unicidade.

## Verificação
- Testar link inválido, link válido, envio completo, campos obrigatórios, meia estrela, melhoria condicional, limites de texto e duplicação.
- Conferir a página em celular e computador, redução de movimento e ausência de alterações nas demais páginas.
