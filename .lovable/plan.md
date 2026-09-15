# Plano: sincronizar ripple e navegação

## Objetivo
Eliminar o ripple que permanece visível no local de um botão após a navegação, sem adicionar espera perceptível nem alterar rotas ou funcionalidades.

## Implementação
- Vincular cada ripple ao próprio controle que o originou, em vez de deixá-lo solto sobre a página; assim, ele desaparece automaticamente quando o controle sai da tela.
- Criar uma transição de navegação nativa e leve que inicia junto ao clique, atualiza a tela imediatamente e faz a saída/entrada por opacidade.
- Aplicar essa transição somente às mudanças entre Home, Passeios, Pacotes, detalhes e formulários, preservando os mesmos destinos e ações atuais.
- Em navegadores sem suporte à transição nativa, manter a navegação instantânea e remover o ripple junto com o elemento.
- Preservar a borda RGB, a onda dos campos, `prefers-reduced-motion` e todas as regras existentes.

## Verificação
- Testar navegação por botões e links em celular e desktop.
- Confirmar que nenhum ripple fica visível após o botão desaparecer.
- Confirmar entrada suave da nova tela sem atraso no clique.
- Verificar voltar/avançar, abertura de detalhes e formulários, rolagem e ausência de erros.

## Detalhes técnicos
- Usar a View Transitions API quando disponível, sem temporizadores de espera.
- Usar `opacity` para a transição e fallback imediato quando indisponível ou com movimento reduzido.
- Manter o ripple isolado dentro do elemento de origem, sem bloquear eventos.
