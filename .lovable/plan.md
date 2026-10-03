# Avaliação pública real no topo dos passeios

## Alteração
- Remover o quadro fixo de nota e quantidade de avaliações no topo dos detalhes do passeio.
- Reutilizar nesse mesmo ponto a seção existente `PublicReviewsSection`, que já carrega somente avaliações públicas válidas do passeio atual.
- Remover a segunda renderização da mesma seção no fim dos detalhes, evitando conteúdo duplicado.
- Não alterar formulário, envio, banco, preços, reservas ou outras páginas.

## Validação
- Confirmar que um passeio com avaliações mostra comentários reais no topo e não exibe a nota fictícia.
- Confirmar que passeios sem avaliações não exibem quadro vazio.
- Validar celular e computador.
- Concluir os testes pendentes de link de avaliação correto, inválido e alterado nos dois tamanhos.
- Executar testes e verificação de tipos do projeto.
