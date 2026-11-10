import { useEffect, useMemo, useRef, useState } from "react";
import type { CmsTour } from "@/lib/cms";
import { pickLang } from "@/lib/cms";
import type { Lang } from "@/lib/i18n";
import { dict } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PaymentMethodCards } from "@/components/PaymentMethodCards";
import { PageShell } from "@/components/PageShell";
import { SummaryOutput } from "@/components/SummaryOutput";
import { PhoneInput, type PhoneValue, fullPhone } from "@/components/PhoneInput";
import { TourDatePicker } from "@/components/TourDatePicker";
import { toast } from "sonner";
import { createReservaInDb, createReservaVoucherInDb, issueReservaVouchers, saveVoucherMessageInDb, syncLead } from "@/lib/db";
import { bookingDraftKey, BOOKING_DRAFT_TTL_MS, clearBookingDraft, dateFromLocalKey, readBookingDraft, saveBookingDraft } from "@/lib/bookingDraft";
import { localDateKey } from "@/lib/cruiseEmbarkation";
import { calculateLunchBookingAmounts, buildLunchBookingMessage, type LunchGuest } from "@/lib/cmsLunchBooking";
import { isCardPayment, type PaymentMethod } from "@/lib/payment";
import { randomVoucherAccessToken, randomVoucherSecret } from "@/lib/vouchers";

const FIELD_CLASS = "bg-night/70 backdrop-blur-sm border-turquoise/40 text-foreground placeholder:text-foreground/50 focus-visible:ring-turquoise focus-visible:border-turquoise h-12";
const TEXT: Record<Lang, {
  responsible: string; phone: string; date: string; dinerCount: string; participants: string;
  responsibleGuest: string; companion: string; name: string; age: string; countHelp: string;
  required: string; invalidCount: string; invalidAge: string; invalidGuest: string;
  subtotal: string; creditFee: string; total: string; payment: string;
}> = {
  pt: { responsible: "Nome completo do responsável", phone: "Telefone / WhatsApp do responsável", date: "Data do almoço", dinerCount: "Quantas pessoas vão almoçar?", participants: "Dados de cada pessoa", responsibleGuest: "Responsável · pessoa 1", companion: "Pessoa", name: "Nome completo", age: "Idade", countHelp: "Informe de 1 a 8 pessoas. Inclua o responsável na quantidade.", required: "Preencha este campo.", invalidCount: "Informe uma quantidade inteira entre 1 e 8.", invalidAge: "Informe uma idade válida entre 0 e 120 anos.", invalidGuest: "Informe o nome completo desta pessoa.", subtotal: "Subtotal do almoço", creditFee: "Preço unitário no cartão", total: "Total a pagar", payment: "Forma de pagamento" },
  es: { responsible: "Nombre completo del responsable", phone: "Teléfono / WhatsApp del responsable", date: "Fecha del almuerzo", dinerCount: "¿Cuántas personas almorzarán?", participants: "Datos de cada persona", responsibleGuest: "Responsable · persona 1", companion: "Persona", name: "Nombre completo", age: "Edad", countHelp: "Indique de 1 a 8 personas. Incluya al responsable en la cantidad.", required: "Complete este campo.", invalidCount: "Indique una cantidad entera entre 1 y 8.", invalidAge: "Indique una edad válida entre 0 y 120 años.", invalidGuest: "Indique el nombre completo de esta persona.", subtotal: "Subtotal del almuerzo", creditFee: "Precio unitario con tarjeta", total: "Total a pagar", payment: "Forma de pago" },
  en: { responsible: "Full name of the person in charge", phone: "Contact phone / WhatsApp", date: "Lunch date", dinerCount: "How many people will have lunch?", participants: "Details for each person", responsibleGuest: "Person in charge · guest 1", companion: "Guest", name: "Full name", age: "Age", countHelp: "Enter 1 to 8 people. Include the person in charge in the count.", required: "This field is required.", invalidCount: "Enter a whole number from 1 to 8.", invalidAge: "Enter a valid age from 0 to 120.", invalidGuest: "Enter this person's full name.", subtotal: "Lunch subtotal", creditFee: "Card unit price", total: "Total due", payment: "Payment method" },
  fr: { responsible: "Nom complet du responsable", phone: "Téléphone / WhatsApp du responsable", date: "Date du déjeuner", dinerCount: "Combien de personnes déjeuneront ?", participants: "Données de chaque personne", responsibleGuest: "Responsable · personne 1", companion: "Personne", name: "Nom complet", age: "Âge", countHelp: "Indiquez de 1 à 8 personnes. Incluez le responsable dans le nombre.", required: "Champ obligatoire.", invalidCount: "Indiquez un nombre entier entre 1 et 8.", invalidAge: "Indiquez un âge valide entre 0 et 120 ans.", invalidGuest: "Indiquez le nom complet de cette personne.", subtotal: "Sous-total du déjeuner", creditFee: "Prix unitaire par carte", total: "Total à payer", payment: "Mode de paiement" },
  it: { responsible: "Nome completo del responsabile", phone: "Telefono / WhatsApp", date: "Data del pranzo", dinerCount: "Quante persone pranzeranno?", participants: "Dati di ogni persona", responsibleGuest: "Responsabile · persona 1", companion: "Persona", name: "Nome completo", age: "Età", countHelp: "Inserisci da 1 a 8 persone. Includi il responsabile nel totale.", required: "Campo obbligatorio.", invalidCount: "Inserisci un numero intero da 1 a 8.", invalidAge: "Inserisci un'età valida da 0 a 120 anni.", invalidGuest: "Inserisci il nome completo di questa persona.", subtotal: "Subtotale del pranzo", creditFee: "Prezzo unitario con carta", total: "Totale da pagare", payment: "Metodo di pagamento" },
};

const LUNCH_SHELL_COPY: Record<Lang, { formTitle: string; formSubtitle: string; reviewTitle: string; reviewSubtitle: string; summaryTitle: string; unitPrice: string; summaryEmpty: string }> = {
  pt: { formTitle: "Reserve seu almoço", formSubtitle: "Informe os dados do responsável e de cada comensal. O resumo acompanha as informações e a forma de pagamento escolhida.", reviewTitle: "Confira sua reserva", reviewSubtitle: "Revise a lista de comensais e os valores antes de enviar pelo WhatsApp.", summaryTitle: "Resumo do almoço", unitPrice: "Valor por pessoa", summaryEmpty: "Informe a quantidade de pessoas e a forma de pagamento para visualizar o resumo." },
  es: { formTitle: "Reserva tu almuerzo", formSubtitle: "Indica los datos del responsable y de cada comensal. El resumen se actualiza con la información y el método de pago elegido.", reviewTitle: "Revisa tu reserva", reviewSubtitle: "Revisa la lista de comensales y los valores antes de enviar por WhatsApp.", summaryTitle: "Resumen del almuerzo", unitPrice: "Precio por persona", summaryEmpty: "Indica la cantidad de personas y el método de pago para ver el resumen." },
  en: { formTitle: "Book your lunch", formSubtitle: "Enter the person in charge and each guest's details. The summary reflects the details and payment method selected.", reviewTitle: "Review your booking", reviewSubtitle: "Review the guest list and prices before sending via WhatsApp.", summaryTitle: "Lunch summary", unitPrice: "Price per person", summaryEmpty: "Enter the number of guests and payment method to see the summary." },
  fr: { formTitle: "Réservez votre déjeuner", formSubtitle: "Indiquez le responsable et les données de chaque convive. Le récapitulatif suit les informations et le mode de paiement choisi.", reviewTitle: "Vérifiez votre réservation", reviewSubtitle: "Vérifiez la liste des convives et les tarifs avant l'envoi par WhatsApp.", summaryTitle: "Récapitulatif du déjeuner", unitPrice: "Prix par personne", summaryEmpty: "Indiquez le nombre de personnes et le mode de paiement pour afficher le récapitulatif." },
  it: { formTitle: "Prenota il pranzo", formSubtitle: "Inserisci i dati del responsabile e di ogni ospite. Il riepilogo riflette le informazioni e il metodo di pagamento scelto.", reviewTitle: "Controlla la prenotazione", reviewSubtitle: "Controlla l'elenco degli ospiti e i prezzi prima dell'invio su WhatsApp.", summaryTitle: "Riepilogo del pranzo", unitPrice: "Prezzo per persona", summaryEmpty: "Inserisci il numero di ospiti e il metodo di pagamento per visualizzare il riepilogo." },
};

const PAYMENT_PT: Record<PaymentMethod, string> = {
  cash: "Dinheiro", debit: "Cartão de débito", credit: "Cartão de crédito", pix: "Pix",
};

const formatBRL = (value: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

interface Props {
  tour: CmsTour;
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  onBack: () => void;
}

interface PendingLunchVoucher {
  reservationId: string;
  requestId: string;
  requestProof: string;
  idioma: Lang;
  totalPeople: number;
  tourKeys: string[];
  messageBase: string;
}

export const CmsLunchBookingForm = ({ tour, lang, onLangChange, onBack }: Props) => {
  const t = dict[lang];
  const copy = TEXT[lang];
  const draftKey = bookingDraftKey(tour.key);
  const [initialDraft] = useState(() => readBookingDraft(draftKey));
  const [responsibleName, setResponsibleName] = useState(initialDraft?.name ?? "");
  const [phone, setPhone] = useState<PhoneValue>(initialDraft?.phone ?? { ddi: "+55", number: "" });
  const [date, setDate] = useState<Date | undefined>(() => initialDraft ? dateFromLocalKey(initialDraft.date) : undefined);
  const [guestCount, setGuestCount] = useState(initialDraft?.pax ?? "1");
  const [guestFields, setGuestFields] = useState<LunchGuest[]>(initialDraft?.guests?.length ? initialDraft.guests : [{ name: "", age: "" }]);
  const [payment, setPayment] = useState<PaymentMethod | "">(initialDraft?.payment ?? "");
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [retryingVoucher, setRetryingVoucher] = useState(false);
  const [pendingVoucher, setPendingVoucher] = useState<PendingLunchVoucher | null>(null);
  const voucherCredentials = useRef<{ requestId: string; requestProof: string; fingerprint: string } | null>(null);
  const [output, setOutput] = useState<{ text: string; rows: { label: string; value: string }[]; voucherWarning?: boolean } | null>(null);

  const parsedCount = Number(guestCount);
  const countIsValid = Number.isInteger(parsedCount) && parsedCount >= 1 && parsedCount <= 8;
  const visibleCount = countIsValid ? parsedCount : (Number.isInteger(parsedCount) && parsedCount > 8 ? 8 : 0);
  const guests = useMemo(() => Array.from({ length: visibleCount }, (_, index) => ({
    name: index === 0 ? responsibleName : (guestFields[index]?.name ?? ""),
    age: guestFields[index]?.age ?? "",
  })), [visibleCount, responsibleName, guestFields]);
  const amounts = calculateLunchBookingAmounts(tour.preco, countIsValid ? parsedCount : 0, isCardPayment(payment));
  const title = pickLang(tour, "nome", lang) || tour.nome_pt;
  const dateLabel = date ? date.toLocaleDateString(lang === "pt" ? "pt-BR" : lang === "es" ? "es-ES" : lang === "fr" ? "fr-FR" : lang === "it" ? "it-IT" : "en-GB") : "";

  useEffect(() => {
    if (output) {
      clearBookingDraft(draftKey);
      return;
    }
    const hasDraftData = !!(responsibleName || phone.number || date || payment
      || guestCount !== "1" || guestFields.some((guest) => guest.name || guest.age));
    if (!hasDraftData) {
      clearBookingDraft(draftKey);
      return;
    }
    saveBookingDraft(draftKey, {
      name: responsibleName,
      cpf: "",
      phone,
      pax: guestCount,
      date: date ? localDateKey(date) : "",
      pousada: "",
      room: "",
      address: "",
      hasKids: "",
      kidsCount: "",
      ages: [],
      guests,
      payment,
      manualCode: "",
    });
    const expiry = window.setTimeout(() => {
      clearBookingDraft(draftKey);
      setResponsibleName(""); setPhone({ ddi: "+55", number: "" }); setDate(undefined);
      setGuestCount("1"); setGuestFields([{ name: "", age: "" }]); setPayment(""); setErrors({});
      toast.info(lang === "pt" ? "Os dados do almoço expiraram após 10 minutos. Preencha novamente." : "Lunch booking details expired after 10 minutes. Please fill them in again.");
    }, BOOKING_DRAFT_TTL_MS);
    return () => window.clearTimeout(expiry);
  }, [draftKey, output, responsibleName, phone, date, guestCount, guestFields, guests, payment, lang]);

  const updateGuest = (index: number, changes: Partial<LunchGuest>) => {
    setGuestFields((current) => {
      const next = [...current];
      while (next.length <= index) next.push({ name: "", age: "" });
      next[index] = { ...next[index], ...changes };
      return next;
    });
  };

  const handleGenerate = async () => {
    if (saving) return;
    const nextErrors: Record<string, boolean> = {};
    if (!responsibleName.trim()) nextErrors.responsible = true;
    if (!phone.number.trim()) nextErrors.phone = true;
    if (!date) nextErrors.date = true;
    if (!countIsValid) nextErrors.guestCount = true;
    guests.forEach((guest, index) => {
      if (index > 0 && !guest.name.trim()) nextErrors[`guestName${index}`] = true;
      const age = Number(guest.age);
      if (guest.age.trim() === "" || !Number.isInteger(age) || age < 0 || age > 120) nextErrors[`guestAge${index}`] = true;
    });
    if (!payment) nextErrors.payment = true;

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      toast.error(t.required);
      requestAnimationFrame(() => {
        const element = document.querySelector<HTMLElement>(".field-error input, .field-error [role='combobox'], .field-error button");
        element?.focus();
        element?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }

    setErrors({});
    const finalAmounts = calculateLunchBookingAmounts(tour.preco, parsedCount, isCardPayment(payment));
    if (finalAmounts.unitPrice <= 0) {
      toast.error(lang === "pt" ? "O preço deste almoço ainda não está configurado. Entre em contato conosco." : "The price for this lunch is not configured yet. Please contact us.");
      return;
    }
    const message = buildLunchBookingMessage({
      tourTitle: tour.nome_pt,
      responsibleName,
      phone: fullPhone(phone),
      date: dateLabel,
      guests,
      paymentLabel: PAYMENT_PT[payment as PaymentMethod],
      amounts: finalAmounts,
    });
    const labels: Record<Lang, { responsible: string; phone: string; date: string; diners: string; payment: string; meal: string; surcharge: string; total: string }> = {
      pt: { responsible: "Responsável", phone: "Telefone", date: "Data do almoço", diners: "Comensais", payment: "Forma de pagamento", meal: "Subtotal do almoço", surcharge: "Preço unitário no cartão", total: "Total a pagar" },
      es: { responsible: "Responsable", phone: "Teléfono", date: "Fecha del almuerzo", diners: "Comensales", payment: "Forma de pago", meal: "Subtotal del almuerzo", surcharge: "Precio unitario con tarjeta", total: "Total a pagar" },
      en: { responsible: "Person in charge", phone: "Phone", date: "Lunch date", diners: "Guests", payment: "Payment method", meal: "Lunch subtotal", surcharge: "Card unit price", total: "Total due" },
      fr: { responsible: "Responsable", phone: "Téléphone", date: "Date du déjeuner", diners: "Personnes", payment: "Mode de paiement", meal: "Sous-total du déjeuner", surcharge: "Prix unitaire par carte", total: "Total à payer" },
      it: { responsible: "Responsabile", phone: "Telefono", date: "Data del pranzo", diners: "Persone", payment: "Metodo di pagamento", meal: "Subtotale del pranzo", surcharge: "Prezzo unitario con carta", total: "Totale da pagare" },
    };
    const l = labels[lang];
    const rows = [
      { label: l.responsible, value: responsibleName.trim() },
      { label: l.phone, value: fullPhone(phone) },
      { label: l.date, value: dateLabel },
      { label: l.diners, value: guests.map((guest, index) => `${index + 1}. ${guest.name.trim()} — ${guest.age} ${lang === "pt" ? "anos" : lang === "fr" ? "ans" : lang === "it" ? "anni" : "years"}`).join("\n") },
      { label: l.payment, value: paymentLabelLocalized(payment as PaymentMethod, lang) },
      ...(isCardPayment(payment as PaymentMethod) ? [{ label: l.surcharge, value: formatBRL(finalAmounts.unitPriceForPayment) }] : []),
      { label: l.total, value: formatBRL(finalAmounts.total) },
    ];

    syncLead({ nome: responsibleName.trim(), telefone: fullPhone(phone), origem: `reserva-cms:${tour.key}` });
    const reservationData = {
      nome: responsibleName.trim(),
      telefone: fullPhone(phone),
      destino: title,
      data_viagem: localDateKey(date!),
      passageiros: parsedCount,
      valor_original: finalAmounts.subtotal,
      valor_com_desconto: finalAmounts.total,
    };
    const totalPeople = guests.length;
    const tourKeys = [tour.key];
    const fingerprint = JSON.stringify({ reservationData, totalPeople, idioma: lang, tourKeys });
    if (voucherCredentials.current?.fingerprint !== fingerprint) {
      voucherCredentials.current = { requestId: crypto.randomUUID(), requestProof: randomVoucherSecret(), fingerprint };
    }
    const credentials = voucherCredentials.current;
    setSaving(true);
    let savedId: string | null = null;
    let voucherUnavailable = false;
    for (let attempt = 0; attempt < 3 && !savedId; attempt += 1) {
      try {
        savedId = await createReservaVoucherInDb(reservationData, {
          requestId: credentials.requestId,
          requestProof: credentials.requestProof,
          idioma: lang,
          totalPessoas: totalPeople,
        });
      } catch {
        savedId = null;
      }
      if (!savedId && attempt < 2) await new Promise((resolve) => setTimeout(resolve, 700 * (attempt + 1)));
    }
    if (!savedId) {
      // Mantém o fluxo comercial legado se a migration/ação de voucher não estiver implantada.
      voucherUnavailable = true;
      for (let attempt = 0; attempt < 3 && !savedId; attempt += 1) {
        savedId = await createReservaInDb(reservationData);
        if (!savedId && attempt < 2) await new Promise((resolve) => setTimeout(resolve, 700 * (attempt + 1)));
      }
    }
    if (!savedId) {
      setSaving(false);
      toast.error(lang === "pt" ? "Não conseguimos salvar sua reserva. Verifique sua conexão e tente novamente." : "We could not save your reservation. Check your connection and try again.");
      return;
    }
    if (voucherUnavailable) {
      setSaving(false);
      setOutput({ text: message, rows, voucherWarning: true });
      return;
    }
    const pending: PendingLunchVoucher = {
      reservationId: savedId,
      requestId: credentials.requestId,
      requestProof: credentials.requestProof,
      idioma: lang,
      totalPeople,
      tourKeys,
      messageBase: message,
    };
    setPendingVoucher(pending);
    let issuedMessage: string | null = null;
    for (let attempt = 0; attempt < 3 && !issuedMessage; attempt += 1) {
      try {
        const issued = await issueReservaVouchers({
          reservationId: pending.reservationId,
          requestId: pending.requestId,
          requestProof: pending.requestProof,
          accessToken: randomVoucherAccessToken(),
          idioma: pending.idioma,
          totalPessoas: pending.totalPeople,
          tourKeys: pending.tourKeys,
          messageBase: pending.messageBase,
        });
        issuedMessage = issued.message;
      } catch {
        if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 700 * (attempt + 1)));
      }
    }
    setSaving(false);
    if (issuedMessage) {
      setPendingVoucher(null);
      setOutput({ text: issuedMessage, rows });
      return;
    }
    await saveVoucherMessageInDb({
      reservationId: pending.reservationId,
      requestId: pending.requestId,
      requestProof: pending.requestProof,
      message,
    });
    setOutput({ text: message, rows, voucherWarning: true });
  };

  const retryVoucherIssue = async () => {
    if (!pendingVoucher || retryingVoucher) return;
    setRetryingVoucher(true);
    try {
      const issued = await issueReservaVouchers({
        reservationId: pendingVoucher.reservationId,
        requestId: pendingVoucher.requestId,
        requestProof: pendingVoucher.requestProof,
        accessToken: randomVoucherAccessToken(),
        idioma: pendingVoucher.idioma,
        totalPessoas: pendingVoucher.totalPeople,
        tourKeys: pendingVoucher.tourKeys,
        messageBase: pendingVoucher.messageBase,
      });
      setOutput((current) => current ? { ...current, text: issued.message, voucherWarning: false } : current);
      setPendingVoucher(null);
      toast.success(lang === "pt" ? "Voucher gerado com sucesso." : lang === "es" ? "Voucher generado correctamente." : lang === "fr" ? "Voucher généré avec succès." : lang === "it" ? "Voucher generato correttamente." : "Voucher generated successfully.");
    } catch {
      toast.error(lang === "pt" ? "Sua reserva continua salva; tente gerar o voucher novamente." : "Your booking is still saved; please try generating the voucher again.");
    } finally {
      setRetryingVoucher(false);
    }
  };

  const handleSent = async () => {
    clearBookingDraft(draftKey);
  };

  if (output) {
    return (
      <PageShell title={title} lang={lang} onLangChange={onLangChange} onBack={onBack} backgroundImage={tour.imagem_url || undefined} wide step={3} heading={LUNCH_SHELL_COPY[lang].reviewTitle} subheading={LUNCH_SHELL_COPY[lang].reviewSubtitle}>
        <SummaryOutput text={output.text} rows={output.rows} tourTitle={title} lang={lang} onReset={onBack} totalRowLabel={TEXT[lang].total} onSend={handleSent} voucherWarning={output.voucherWarning} onRetryVoucher={pendingVoucher ? retryVoucherIssue : undefined} retryingVoucher={retryingVoucher} />
      </PageShell>
    );
  }

  return (
    <PageShell title={title} lang={lang} onLangChange={onLangChange} onBack={onBack} backgroundImage={tour.imagem_url || undefined} wide step={2} heading={LUNCH_SHELL_COPY[lang].formTitle} subheading={LUNCH_SHELL_COPY[lang].formSubtitle}>
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,.85fr)]">
      <div className="min-w-0">
      <p className="mb-5 rounded-xl border border-turquoise/20 bg-[#0a2030]/70 p-4 text-sm leading-relaxed text-foreground/90">
        {lang === "pt" ? "Preencha os dados do responsável e de todas as pessoas que vão almoçar. O responsável deve estar incluído na quantidade." : lang === "es" ? "Complete los datos del responsable y de todas las personas que almorzarán. Incluya al responsable en la cantidad." : lang === "fr" ? "Renseignez le responsable et toutes les personnes qui déjeuneront. Le responsable doit être inclus dans le nombre." : lang === "it" ? "Inserisci i dati del responsabile e di tutte le persone che pranzeranno. Il responsabile va incluso nel numero." : "Enter the person in charge and everyone who will have lunch. Include the person in charge in the count."}
      </p>

      <div className="space-y-5">
        <Field label={copy.responsible} error={errors.responsible} errorMsg={copy.required}>
          <Input value={responsibleName} onChange={(event) => { setResponsibleName(event.target.value); setErrors((current) => ({ ...current, responsible: false })); }} className={FIELD_CLASS} autoComplete="name" />
        </Field>

        <Field label={copy.phone} error={errors.phone} errorMsg={copy.required}>
          <PhoneInput value={phone} onChange={(value) => { setPhone(value); setErrors((current) => ({ ...current, phone: false })); }} inputClassName={FIELD_CLASS} />
        </Field>

        <Field label={copy.date} error={errors.date} errorMsg={copy.required}>
          <TourDatePicker lang={lang} value={date} onChange={(value) => { setDate(value); setErrors((current) => ({ ...current, date: false })); }} error={errors.date} />
        </Field>

        <Field label={copy.dinerCount} error={errors.guestCount} errorMsg={copy.invalidCount}>
          <Input type="number" min={1} max={8} step={1} inputMode="numeric" value={guestCount} onChange={(event) => { setGuestCount(event.target.value); setErrors((current) => ({ ...current, guestCount: false })); }} className={FIELD_CLASS} />
          <p className="text-xs text-muted-foreground">{copy.countHelp}</p>
        </Field>

        {visibleCount > 0 && (
          <section aria-label={copy.participants} className="space-y-4 rounded-2xl border border-turquoise/25 bg-card/35 p-4">
            <h2 className="font-semibold text-foreground">{copy.participants}</h2>
            {guests.map((guest, index) => (
              <div key={index} className="space-y-3 rounded-xl border border-border/50 bg-night/35 p-3">
                <h3 className="text-sm font-semibold text-turquoise">{index === 0 ? copy.responsibleGuest : `${copy.companion} ${index + 1}`}</h3>
                {index === 0 ? (
                  <p className="rounded-lg border border-border/50 bg-night/50 px-3 py-3 text-sm text-foreground/85">{responsibleName || (lang === "pt" ? "O nome do responsável aparecerá aqui" : "The person in charge's name will appear here")}</p>
                ) : (
                  <Field label={copy.name} error={errors[`guestName${index}`]} errorMsg={copy.invalidGuest}>
                    <Input value={guest.name} onChange={(event) => { updateGuest(index, { name: event.target.value }); setErrors((current) => ({ ...current, [`guestName${index}`]: false })); }} className={FIELD_CLASS} autoComplete="off" />
                  </Field>
                )}
                <Field label={copy.age} error={errors[`guestAge${index}`]} errorMsg={copy.invalidAge}>
                  <Input type="number" min={0} max={120} step={1} inputMode="numeric" value={guest.age} onChange={(event) => { updateGuest(index, { age: event.target.value }); setErrors((current) => ({ ...current, [`guestAge${index}`]: false })); }} className={FIELD_CLASS} />
                </Field>
              </div>
            ))}
          </section>
        )}

        <Field label={copy.payment} error={errors.payment} errorMsg={copy.required}>
          <PaymentMethodCards
            lang={lang}
            payment={payment as PaymentMethod | ""}
            onChange={(method) => { setPayment(method); setErrors((current) => ({ ...current, payment: false })); }}
            cashPixUnitPrice={tour.preco > 0 ? tour.preco : null}
            cashPixTotal={countIsValid && tour.preco > 0 ? calculateLunchBookingAmounts(tour.preco, parsedCount, false).total : null}
            cardTotal={countIsValid && tour.preco > 0 ? calculateLunchBookingAmounts(tour.preco, parsedCount, true).total : null}
          />
        </Field>

        {countIsValid && payment && tour.preco > 0 && (
          <section aria-live="polite" className="rounded-2xl border border-turquoise/25 bg-gradient-to-br from-[#102b3b] to-[#091d2a] p-4 space-y-2 text-sm xl:hidden">
            <h2 className="mb-3 text-[10px] font-extrabold uppercase tracking-[.15em] text-turquoise-glow">{LUNCH_SHELL_COPY[lang].summaryTitle}</h2>
            {isCardPayment(payment) && <div className="flex justify-between gap-4 text-muted-foreground"><span>{copy.creditFee}</span><span>{formatBRL(amounts.unitPriceForPayment)}</span></div>}
            <div className="flex justify-between gap-4 border-t border-turquoise/30 pt-2 text-base font-bold"><span>{copy.total}</span><span>{formatBRL(amounts.total)}</span></div>
          </section>
        )}

        {tour.preco <= 0 && (
          <p role="status" className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-sm text-amber-200">
            {lang === "pt" ? "O preço deste almoço ainda não foi configurado no CMS; por isso, a reserva não pode ser concluída agora." : "The price for this lunch has not been configured in the CMS yet, so the booking cannot be completed right now."}
          </p>
        )}

        <Button type="button" onClick={() => void handleGenerate()} disabled={saving || tour.preco <= 0} className="rgb-border w-full h-14 bg-gradient-to-r from-turquoise to-turquoise-glow text-base font-bold text-night disabled:opacity-70">
          {saving ? (lang === "pt" ? "Salvando reserva…" : "Saving booking…") : t.generate}
        </Button>
      </div>
      </div>

      <aside aria-label={LUNCH_SHELL_COPY[lang].summaryTitle} className="hidden xl:sticky xl:top-5 xl:block">
        <section aria-live="polite" className="overflow-hidden rounded-3xl border border-turquoise/20 bg-gradient-to-br from-[#102b3b] via-[#0b1f2d] to-[#071722] shadow-[0_22px_55px_rgba(0,0,0,.3)]">
          <header className="border-b border-white/10 bg-[#0c2533]/75 px-5 py-4">
            <p className="text-[10px] font-extrabold uppercase tracking-[.16em] text-turquoise-glow">{LUNCH_SHELL_COPY[lang].summaryTitle}</p>
            <h2 className="mt-1 text-lg font-bold text-foreground">{title}</h2>
          </header>
          <div className="flex items-center gap-3 border-b border-white/[0.08] px-5 py-4">
            {tour.imagem_url ? <img src={tour.imagem_url} alt="" className="h-14 w-20 shrink-0 rounded-xl object-cover" /> : <div className="grid h-14 w-20 shrink-0 place-items-center rounded-xl bg-[#0a2030] text-xs text-muted-foreground">{title}</div>}
            <div className="min-w-0 space-y-1 text-xs">
              <p className="truncate text-foreground"><span className="text-muted-foreground">{copy.date}: </span>{dateLabel || "—"}</p>
              <p className="text-foreground"><span className="text-muted-foreground">{copy.dinerCount}: </span>{countIsValid ? parsedCount : "—"}</p>
              <p className="text-foreground"><span className="text-muted-foreground">{copy.payment}: </span>{payment ? paymentLabelLocalized(payment as PaymentMethod, lang) : "—"}</p>
            </div>
          </div>
          <div className="space-y-3 px-5 py-4">
            {countIsValid && payment && tour.preco > 0 ? (
              <>
                <div className="flex items-start justify-between gap-4 text-sm text-foreground/85"><span>{LUNCH_SHELL_COPY[lang].unitPrice}</span><span className="shrink-0 font-semibold">{formatBRL(isCardPayment(payment) ? amounts.unitPriceForPayment : amounts.unitPrice)}</span></div>
                <div className="flex items-start justify-between gap-4 border-t border-turquoise/30 pt-3 text-base font-extrabold text-turquoise-glow"><span>{copy.total}</span><span className="shrink-0 text-right">{formatBRL(amounts.total)}</span></div>
              </>
            ) : <p className="text-sm leading-relaxed text-muted-foreground">{LUNCH_SHELL_COPY[lang].summaryEmpty}</p>}
          </div>
        </section>
      </aside>
      </div>
    </PageShell>
  );
};

const paymentLabelLocalized = (payment: PaymentMethod, lang: Lang): string => ({
  cash: { pt: "Dinheiro", es: "Efectivo", en: "Cash", fr: "Espèces", it: "Contanti" },
  debit: { pt: "Cartão de débito", es: "Tarjeta de débito", en: "Debit card", fr: "Carte de débit", it: "Carta di debito" },
  credit: { pt: "Cartão de crédito", es: "Tarjeta de crédito", en: "Credit card", fr: "Carte de crédit", it: "Carta di credito" },
  pix: { pt: "Pix", es: "Pix", en: "Pix", fr: "Pix", it: "Pix" },
}[payment][lang]);

const Field = ({ label, children, error, errorMsg }: { label: string; children: React.ReactNode; error?: boolean; errorMsg?: string }) => (
  <div className={`interactive-field space-y-2 ${error ? "field-error field-error-shake" : ""}`}>
    <Label className="text-foreground font-semibold drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]">{label}</Label>
    {children}
    {error && errorMsg && <p className="mt-1 text-xs text-rose-400">{errorMsg}</p>}
  </div>
);
