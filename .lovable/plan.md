# Plano: fluidez, interação e destaques dos passeios

## Objetivo
Melhorar a sensação de velocidade e resposta do site sem alterar reservas, preços, textos existentes, traduções ou fluxos atuais.

## Implementação
- Ajustar animações globais para usarem apenas `transform` e `opacity` sempre que possível, sincronizadas naturalmente pelo navegador em telas de 60/90/120 Hz.
- Remover ou reduzir custos contínuos durante rolagem, especialmente camadas promovidas e efeitos de fundo/sombra desnecessários em celulares.
- Adicionar feedback sutil de foco aos campos, sem deslocamento de layout e com suporte a toque, mouse e teclado.
- Atualizar o botão flutuante do WhatsApp com pulsação leve e um aviso temporário “Fale conosco” após a rolagem parar; ocultá-lo durante a rolagem sem remover o botão.
- Reutilizar a estrutura visual de selos existente para inserir nos cards: “🔥 O mais vendido” em Escuna, “🔥 O mais procurado” em Arraial do Cabo e “⭐ O mais bem avaliado” em Buggy.
- Respeitar `prefers-reduced-motion` em todas as animações não essenciais.

## Verificação
- Conferir telas pequenas, tablet e desktop, incluindo overflow horizontal e sobreposição do WhatsApp.
- Validar rolagem, foco dos campos e comportamento do aviso do WhatsApp.
- Confirmar que os três selos não cobrem avaliação, cupom ou conteúdo dos cards.
- Confirmar que reservas, cálculos, formulários e mensagens do WhatsApp permanecem inalterados.

## Detalhes técnicos
- Sem bibliotecas novas.
- Listener de rolagem passivo, com estado atualizado somente na mudança entre rolando/parado.
- CSS com animações de compositor e regras específicas para redução de movimento e dispositivos móveis.
