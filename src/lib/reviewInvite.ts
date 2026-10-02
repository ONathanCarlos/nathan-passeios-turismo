import { Lang } from "@/lib/i18n";
import { getFirstName } from "@/lib/firstName";

const OFFICIAL_SITE_ORIGIN = "https://nathanturismo.com.br";

export const buildShortReviewUrl = (shortCode: string) =>
  `${OFFICIAL_SITE_ORIGIN}/a/${shortCode}`;

const LEGACY_MESSAGE = (reviewUrl: string) => `Oi! 😊 Aqui é o Nathan, tudo bem?

Queria saber como foi sua experiência com a gente! 🌊☀️

Leva só 1 minutinho pra contar o que você achou e, como agradecimento, você ganha 5% de desconto na próxima reserva. 🎁

👉 AVALIE AQUI:
${reviewUrl}

Valeu por confiar na gente! ❤️`;

export const buildReviewWhatsAppMessage = (
  reviewUrl: string,
  customerName?: string | null,
  language: Lang | string | null | undefined = "pt",
) => {
  if (!customerName) return LEGACY_MESSAGE(reviewUrl);

  const name = getFirstName(customerName);
  const lang = ["pt", "es", "en", "fr", "it"].includes(language || "")
    ? (language as Lang)
    : "pt";

  const messages: Record<Lang, string> = {
    pt: `Olá, ${name}! 😊
Esperamos que tenha aproveitado o passeio conosco.

Sua opinião é muito importante para nós! Se puder, deixe uma avaliação sobre sua experiência. Isso nos ajuda muito! ❤️

👉 AVALIE AQUI:
${reviewUrl}

Muito obrigado por confiar na gente!`,
    es: `¡Hola, ${name}! 😊
Esperamos que hayas disfrutado mucho del paseo con nosotros.

¡Tu opinión es muy importante para nosotros! Si puedes, déjanos una reseña sobre tu experiencia. ¡Nos ayuda muchísimo! ❤️

👉 EVALÚA AQUÍ:
${reviewUrl}

¡Muchas gracias por confiar en nosotros!`,
    en: `Hi, ${name}! 😊
We hope you had a wonderful time on your tour with us.

Your opinion means a lot to us! If you can, please leave a review about your experience. It helps us so much! ❤️

👉 REVIEW US HERE:
${reviewUrl}

Thank you so much for trusting us!`,
    fr: `Bonjour, ${name} ! 😊
Nous espérons que vous avez pleinement profité de votre excursion avec nous.

Votre avis est très important pour nous ! Si vous le pouvez, laissez-nous une évaluation de votre expérience. Cela nous aide beaucoup ! ❤️

👉 ÉVALUEZ-NOUS ICI :
${reviewUrl}

Merci beaucoup de nous faire confiance !`,
    it: `Ciao, ${name}! 😊
Speriamo che tu abbia apprezzato la tua escursione con noi.

La tua opinione è molto importante per noi! Se puoi, lasciaci una recensione sulla tua esperienza. Ci aiuta davvero tanto! ❤️

👉 VALUTACI QUI:
${reviewUrl}

Grazie mille per la fiducia!`,
  };

  return messages[lang];
};
