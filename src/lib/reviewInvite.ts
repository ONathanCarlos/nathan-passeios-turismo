const OFFICIAL_SITE_ORIGIN = "https://nathanturismo.com.br";

export const buildShortReviewUrl = (shortCode: string) =>
  `${OFFICIAL_SITE_ORIGIN}/a/${shortCode}`;

export const buildReviewWhatsAppMessage = (reviewUrl: string) => `Oi! 😊 Aqui é o Nathan, tudo bem?

Queria saber como foi sua experiência com a gente! 🌊☀️

Leva só 1 minutinho pra contar o que você achou e, como agradecimento, você ganha 5% de desconto na próxima reserva. 🎁

👉 AVALIE AQUI:
${reviewUrl}

Valeu por confiar na gente! ❤️`;