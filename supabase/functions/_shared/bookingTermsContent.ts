export const BOOKING_TERMS_VERSION = "2026-11-09-v1" as const;
export const BOOKING_TERMS_PATH = "/termos-de-uso" as const;

export const BOOKING_TERMS_TITLE = "Termos de Uso, Política de Cancelamento e Reembolso";
export const BOOKING_TERMS_OPERATOR = "Ônix Turismo Búzios";

export type BookingTermsSection = {
  number: number;
  title: string;
  paragraphs: readonly string[];
  quote?: string;
};

export type BookingTermsReference = {
  label: string;
  url: string;
  description: string;
};

/** Conteúdo público aprovado e preservado na versão estável para arquivamento. */
export const BOOKING_TERMS_SECTIONS: readonly BookingTermsSection[] = [
  {
    number: 1,
    title: "A quem se aplicam estes termos",
    paragraphs: [
      "Estes termos se aplicam aos passeios e atividades comercializados pela Ônix Turismo Búzios, incluindo escuna, catamarã, buggy, mergulho, quadriciclo, passeios terrestres e passeios incluídos em pacotes. O serviço de almoço não está abrangido por esta política. Em pacotes que incluam almoço, esta política se aplica somente aos passeios e atividades abrangidos, não ao serviço de almoço.",
      "Antes de solicitar a reserva, confira a descrição do passeio, a data escolhida, a quantidade e as idades dos participantes, a forma de pagamento e os valores apresentados. As condições específicas de cada atividade permanecem disponíveis na sua página e no atendimento da Ônix.",
      "O envio de uma solicitação de reserva e a emissão de um voucher não comprovam, por si só, que o pagamento foi realizado ou que a equipe confirmou a disponibilidade do passeio. A confirmação e as orientações operacionais serão informadas pela equipe pelos canais oficiais.",
    ],
  },
  {
    number: 2,
    title: "Preços e funcionamento do site",
    paragraphs: [
      "Os preços são apresentados conforme a forma de pagamento escolhida. Eventuais taxas adicionais aplicáveis ao passeio devem estar informadas e discriminadas antes da confirmação da solicitação.",
      "O site não realiza retenções automáticas, descontos de reembolso nem cobranças automáticas de multas de cancelamento. A política de cancelamento não acrescenta valores ao checkout nem modifica os cálculos da reserva.",
      "Toda solicitação de cancelamento, remarcação ou reembolso será analisada manualmente pela equipe da Ônix Turismo, respeitando a legislação e as circunstâncias da contratação. A análise manual não afasta os direitos nem os prazos legais do consumidor.",
    ],
  },
  {
    number: 3,
    title: "Cancelamento por iniciativa do cliente",
    paragraphs: [
      "Caso o cliente deseje cancelar o passeio por motivos particulares, deverá comunicar sua solicitação pelos canais oficiais de atendimento.",
      "O cancelamento poderá estar sujeito à retenção de até 5% do valor a ser restituído, exclusivamente quando juridicamente aplicável, observadas a natureza do serviço, as circunstâncias da contratação, as condições previamente informadas e os direitos do consumidor. O percentual não será aplicado automaticamente nem indistintamente a todas as modalidades de passeio.",
      "O artigo 20 do Decreto Federal nº 7.381/2010 determina que eventual multa de cancelamento de serviço turístico, a pedido do consumidor, deve estar prevista em contrato e ser informada previamente. Esse dispositivo não fixa uma multa geral de 5% e não autoriza qualquer retenção sem análise de sua legalidade.",
      "O artigo 740, § 3º, do Código Civil trata de retenção de até 5% no âmbito dos contratos de transporte, nas hipóteses previstas naquele artigo. Sua aplicação depende do enquadramento do serviço como transporte e do atendimento às condições legais pertinentes. Por exemplo, o caput disciplina a desistência antes de iniciada a viagem, com comunicação ao transportador em tempo de a passagem ser renegociada. Esse artigo não será tratado como autorização universal para cobrar multa em qualquer atividade turística.",
      "Quando uma retenção for legalmente cabível, a equipe informará ao cliente, antes da conclusão do reembolso, o valor a ser restituído, o percentual e o montante da retenção, a justificativa e o fundamento aplicável ao caso. Não serão criadas multas adicionais nem tabelas de retenção por antecedência nesta política.",
      "Não haverá retenção quando a legislação determinar restituição integral, inclusive no exercício válido do direito de arrependimento ou quando o cancelamento decorrer de responsabilidade do prestador.",
    ],
  },
  {
    number: 4,
    title: "Direito de arrependimento",
    paragraphs: [
      "Nas contratações realizadas pela internet ou fora do estabelecimento comercial, será integralmente respeitado o direito de arrependimento previsto no artigo 49 do Código de Defesa do Consumidor.",
      "A lei estabelece o prazo de sete dias, contado da assinatura do contrato ou do ato de recebimento do produto ou serviço, conforme a hipótese legal aplicável. Quando exercido esse direito, os valores eventualmente pagos, a qualquer título, durante o prazo de reflexão serão devolvidos de imediato e monetariamente atualizados, nos termos do parágrafo único do artigo 49, sem retenção de multa de cancelamento.",
      "O cliente poderá comunicar o arrependimento pelos canais oficiais. O aceite destes termos não significa renúncia a esse direito ou a qualquer outra proteção legal.",
    ],
  },
  {
    number: 5,
    title: "Cancelamento pela empresa, fornecedor ou por impedimento de realização",
    paragraphs: [
      "Se o passeio não puder ser realizado por determinação da Marinha do Brasil ou de outra autoridade competente, condições climáticas, impossibilidade operacional ou responsabilidade da empresa ou do fornecedor, a equipe informará o ocorrido e as alternativas cabíveis.",
      "Em caso de cancelamento do passeio sem realização do serviço, serão oferecidos reembolso integral dos valores pagos pelo serviço cancelado ou remarcação, conforme o caso e os direitos legais aplicáveis. A remarcação dependerá da concordância do cliente e da disponibilidade; não será imposta em substituição ao reembolso devido.",
      "Não será aplicada multa ao consumidor pelo cancelamento de responsabilidade do prestador. Em pacotes ou serviços parcialmente executados, a equipe identificará os serviços afetados e informará a solução e os valores correspondentes, preservando os direitos legais do consumidor, inclusive eventual direito à restituição integral quando cabível.",
    ],
  },
  {
    number: 6,
    title: "Remarcação e alterações de data",
    paragraphs: [
      "Para solicitar alteração da data, entre em contato com a equipe, indicando a reserva e a nova data desejada. A remarcação depende da disponibilidade e das condições legais e contratuais aplicáveis à atividade.",
      "A equipe informará previamente as condições da nova data e eventual diferença de preço, para decisão do cliente. Nenhuma alteração ou cobrança será executada automaticamente pelo site.",
      "Solicitar remarcação não equivale, por si só, a cancelamento voluntário. A equipe confirmará a opção escolhida pelo cliente antes de concluir o atendimento.",
    ],
  },
  {
    number: 7,
    title: "Como solicitar cancelamento, remarcação ou reembolso",
    paragraphs: [
      "Entre em contato pelo WhatsApp oficial +55 22 99821-6796, também disponível no site https://onixturismobuzios.com.br.",
      "Informe o código da reserva, se disponível, o nome do responsável, o passeio, a data e o pedido desejado. Caso não tenha o código, a equipe poderá localizar a reserva com os demais dados disponíveis. Para identificar pagamentos já realizados, poderá ser solicitado o respectivo comprovante. Não envie senhas, códigos de autenticação ou dados completos de cartão.",
      "A equipe analisará o pedido e informará o encaminhamento, o cálculo de eventual reembolso e os procedimentos necessários, observados os prazos legais aplicáveis.",
    ],
  },
  {
    number: 8,
    title: "Aceite eletrônico e preservação de direitos",
    paragraphs: [
      "Antes de confirmar a solicitação de reserva de um serviço abrangido, o cliente terá acesso a esta página e deverá marcar, por iniciativa própria, a seguinte declaração:",
      "A data, o horário e a versão dos termos aceitos serão registrados vinculados à reserva. Uma atualização posterior não substituirá o registro da versão aceita naquela contratação.",
      "O aceite não comprova pagamento, não afasta direitos previstos em lei e não torna válida uma cláusula que seja abusiva ou incompatível com a legislação. Havendo conflito, prevalecem as normas obrigatórias de proteção ao consumidor.",
    ],
    quote: "Declaro que li e concordo com os Termos de Uso, a Política de Cancelamento e as condições de Reembolso da Ônix Turismo Búzios.",
  },
] as const;

export const BOOKING_TERMS_REFERENCES: readonly BookingTermsReference[] = [
  {
    label: "Decreto Federal nº 7.381/2010 — artigos 20 e 32",
    url: "https://www.planalto.gov.br/ccivil_03/_ato2007-2010/2010/decreto/d7381.htm",
    description: "informação prévia e previsão contratual de eventual multa; condições de alteração, cancelamento e reembolso.",
  },
  {
    label: "Código Civil — artigo 740, incluindo § 3º",
    url: "https://www.planalto.gov.br/ccivil_03/leis/2002/l10406compilada.htm",
    description: "regras específicas de desistência e restituição em contratos de transporte.",
  },
  {
    label: "Código de Defesa do Consumidor — artigos 46, 49 e 51",
    url: "https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm",
    description: "conhecimento prévio do contrato, direito de arrependimento e proteção contra cláusulas abusivas.",
  },
];

/** Texto integral público, em português, preservado para arquivamento da versão aceita. */
export const BOOKING_TERMS_TEXT = [
  `# ${BOOKING_TERMS_TITLE}`,
  `## ${BOOKING_TERMS_OPERATOR}`,
  "",
  ...BOOKING_TERMS_SECTIONS.flatMap((section) => [
    `### ${section.number}. ${section.title}`,
    "",
    ...section.paragraphs.flatMap((paragraph) => [paragraph, ""]),
    ...(section.quote ? [`> ${section.quote}`, ""] : []),
  ]),
  "### Referências legais",
  "",
  ...BOOKING_TERMS_REFERENCES.map(
    (reference) => `- [${reference.label}](${reference.url}): ${reference.description}`,
  ),
].join("\n").replace(/\n{3,}/g, "\n\n").trim();

// Ao publicar novos termos, acrescentar outra entrada e manter esta intacta.
// As versões aceitas também ficam arquivadas no backend com hash do conteúdo.
export const BOOKING_TERMS_ARCHIVE = Object.freeze({
  "2026-11-09-v1": Object.freeze({
    version: "2026-11-09-v1",
    sections: BOOKING_TERMS_SECTIONS,
    references: BOOKING_TERMS_REFERENCES,
    text: BOOKING_TERMS_TEXT,
  }),
});

export const getBookingTermsDocument = (version: string = BOOKING_TERMS_VERSION) =>
  Object.prototype.hasOwnProperty.call(BOOKING_TERMS_ARCHIVE, version)
    ? BOOKING_TERMS_ARCHIVE[version as keyof typeof BOOKING_TERMS_ARCHIVE]
    : null;
