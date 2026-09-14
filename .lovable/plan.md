# Plano: ripple premium e restauração da borda RGB

## Objetivo
Aprimorar somente o feedback visual dos controles interativos, preservando integralmente os fluxos, cálculos, textos, traduções e animações existentes.

## Implementação
- Substituir o ripple atual baseado apenas no estado pressionado por uma onda visual criada no ponto exato do toque ou clique, removida automaticamente ao terminar.
- Aplicar o ripple por delegação global apenas a botões, links acionáveis, controles e cards realmente clicáveis, sem bloquear ou atrasar suas ações.
- Usar o centro do controle para interações por teclado e o ponto real para mouse ou toque.
- Restaurar a animação RGB já existente em todas as telas nos seletores de idioma e botões de reserva que já usam essa classe.
- Isolar a camada do ripple para que ela não reinicie nem interfira na animação RGB.
- Manter animações baseadas em `transform` e `opacity`, sem bibliotecas, loops contínuos ou processamento durante a rolagem.
- Desativar o ripple e reduzir a borda decorativa quando `prefers-reduced-motion` estiver ativo.

## Verificação
- Testar toque/clique em diferentes pontos e interação por teclado.
- Confirmar que cliques e navegação continuam imediatos.
- Confirmar RGB ativo em idioma e reserva, inclusive no celular, durante o ripple.
- Verificar rolagem, ausência de deslocamento, sobreposição ou rolagem lateral em celular e desktop.
- Confirmar que reservas, formulários, preços e demais animações permanecem inalterados.

## Detalhes técnicos
- JavaScript nativo com eventos delegados e criação transitória de uma única camada por interação.
- CSS de compositor para expansão e desaparecimento da onda.
- Reaproveitamento da classe `rgb-border` atual, sem duplicar o efeito.
