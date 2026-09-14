# Plano: ripple exclusivo nas bordas

## Objetivo
Substituir integralmente o ripple interno atual por feedback visual somente nas bordas, sem duplicar efeitos nem alterar os fluxos do site.

## Implementação
- Remover a camada de ripple interna e seus estilos atuais.
- Nos campos, ativar uma pulsação turquesa contínua na borda enquanto o campo ou controle interno estiver focado, encerrando suavemente ao perder o foco.
- Nos botões e controles acionáveis, criar uma única onda curta na borda, originada perto do ponto real do toque/clique; teclado usa o centro.
- Preservar a animação RGB nos seletores de idioma e botões de reserva, mantendo a onda de toque em uma camada independente.
- Usar delegação global leve, propriedades de compositor e remoção automática da camada transitória.
- Desativar os efeitos decorativos com `prefers-reduced-motion`.

## Verificação
- Conferir campos de nome, telefone, data e seletores durante foco e perda de foco.
- Conferir botões comuns, idioma e reserva em diferentes pontos de toque.
- Confirmar que a borda RGB continua animada durante o feedback.
- Verificar cliques, teclado, rolagem e ausência de deslocamento ou rolagem lateral em celular e desktop.

## Detalhes técnicos
- CSS com pseudo-elementos para o foco contínuo dos campos.
- JavaScript nativo delegado apenas para a onda única das bordas dos botões.
- Nenhuma biblioteca, loop contínuo em JavaScript ou mudança em regras de reserva.
