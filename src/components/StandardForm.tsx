import { useEffect, useMemo, useRef, useState } from "react";
import { Lang, dict } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PageShell } from "./PageShell";
import { PaymentPriceDisplay } from "@/components/PaymentPriceDisplay";
import { SummaryOutput } from "./SummaryOutput";
import { PhoneInput, PhoneValue, fullPhone } from "./PhoneInput";
import { toast } from "sonner";
import { TourDatePicker } from "./TourDatePicker";
import { PromoBanner } from "./PromoBanner";
import { QrPromoBoot } from "./QrPromo";
import { loadQrPromoForTour, subscribeQrPromo } from "@/lib/qrPromo";

import { TourKey, getTour } from "@/lib/tours";
import { TOUR_PRICES, formatBRL, tourPriceStatusText, COUPON_ELIGIBLE } from "@/lib/prices";
import { forceRefreshCms, getCachedTour, getCmsTourPriceStatus, subscribeCmsCache } from "@/lib/cmsCache";
import {
  isExpired, isTester, isAdminMode, loadPromo, markCouponUsed, normalizeCoupon, PromoData,
  validateSpecialCoupon, markSpecialUsed, SpecificCoupon,
} from "@/lib/promo";
import { createReservaInDb, createReservaVoucherInDb, issueReservaVouchers, saveVoucherMessageInDb, markCouponUsedInDb, syncLead } from "@/lib/db";
import { buildBookingPriceBreakdown } from "@/lib/bookingPriceBreakdown";
import { calculateRegionalBookingFees, JARDINEIRA_FEE_PER_PERSON, REGIONAL_EMBARKATION_FEE_PER_PERSON } from "@/lib/regionalBookingFees";
import { Tag, ExternalLink, X } from "lucide-react";
import {
  calculateBookingAmounts,
  calculateEmbarkationFee,
  cruiseFeeApplies,
  isCruiseDate,
  packageIncludesCruiseFeeTour,
  CRUISE_CHILD_FEE_NOTICE,
  CRUISE_FEE_BOOKING_NOTICE,
  getCruiseEmbarkationFeePerPerson,
  LABELS,
  localDateKey,
  CRUISE_CALENDAR_PATH,
} from "@/lib/cruiseEmbarkation";
import { bookingDraftKey, BOOKING_DRAFT_TTL_MS, clearBookingDraft, dateFromLocalKey, readBookingDraft, saveBookingDraft } from "@/lib/bookingDraft";
import { isCardPayment, type PaymentMethod } from "@/lib/payment";
import { PAYMENT_PRICE_LABELS } from "@/lib/paymentPricing";
import { randomVoucherAccessToken, randomVoucherSecret } from "@/lib/vouchers";
import { formatArraialPassengerSummary } from "@/lib/arraialPassengerSummary";

/** Rótulos de pagamento em PT fixo para a mensagem do WhatsApp. */
const PAYMENT_PT: Record<PaymentMethod, string> = {
  cash: "Dinheiro",
  debit: "Cartão de débito",
  credit: "Cartão de crédito",
  pix: "Pix",
};

const COUPON_TEXT: Record<Lang, {
  placeholder: string; apply: string; obtain: string; useSaved: string; enter: string;
  notFound: string; expired: string; wrongPhone: string; used: string; wrongDate: string;
  needsReminder: string; needsIdle: string; applied: string; created: string;
  unavailable: string; qrExclusive: string; packageUnavailable: string;
}> = {
  pt: {
    placeholder: "Digite seu cupom", apply: "Aplicar", obtain: "Obter cupom", useSaved: "Usar meu cupom",
    enter: "Digite um código promocional.", notFound: "Cupom inválido ou inativo.", expired: "Cupom expirado.",
    wrongPhone: "Este cupom foi emitido para outro telefone.", used: "Este cupom já foi utilizado.",
    wrongDate: "Cupom indisponível nesta data.", needsReminder: "Este cupom exige aceite dos lembretes promocionais.",
    needsIdle: "Este cupom de recuperação ainda não está disponível.", applied: "Cupom aplicado",
    created: "Cupom criado. Digite o código no campo e toque em Aplicar para usar o desconto.",
    unavailable: "Cupons indisponíveis para este passeio.", qrExclusive: "Desconto QR ativo. Cupons não acumulam com QR.",
    packageUnavailable: "Pacotes promocionais não aceitam cupons.",
  },
  es: {
    placeholder: "Introduce tu cupón", apply: "Aplicar", obtain: "Obtener cupón", useSaved: "Usar mi cupón",
    enter: "Introduce un código promocional.", notFound: "Cupón inválido o inactivo.", expired: "El cupón ha caducado.",
    wrongPhone: "Este cupón fue emitido para otro teléfono.", used: "Este cupón ya fue utilizado.",
    wrongDate: "El cupón no está disponible en esta fecha.", needsReminder: "Este cupón requiere aceptar los recordatorios promocionales.",
    needsIdle: "Este cupón de recuperación aún no está disponible.", applied: "Cupón aplicado",
    created: "Cupón creado. Introduce el código en el campo y pulsa Aplicar para usar el descuento.",
    unavailable: "Cupones no disponibles para este paseo.", qrExclusive: "Descuento QR activo. Los cupones no se acumulan con QR.",
    packageUnavailable: "Los paquetes promocionales no aceptan cupones.",
  },
  en: {
    placeholder: "Enter your coupon", apply: "Apply", obtain: "Get a coupon", useSaved: "Use my coupon",
    enter: "Enter a promo code.", notFound: "Invalid or inactive coupon.", expired: "This coupon has expired.",
    wrongPhone: "This coupon was issued for another phone number.", used: "This coupon has already been used.",
    wrongDate: "This coupon is not available on this date.", needsReminder: "This coupon requires opting in to promotional reminders.",
    needsIdle: "This recovery coupon is not available yet.", applied: "Coupon applied",
    created: "Coupon created. Enter the code in the field and tap Apply to use the discount.",
    unavailable: "Coupons are not available for this tour.", qrExclusive: "QR discount is active. Coupons cannot be combined with QR.",
    packageUnavailable: "Promotional packages do not accept coupons.",
  },
  fr: {
    placeholder: "Saisissez votre coupon", apply: "Appliquer", obtain: "Obtenir un coupon", useSaved: "Utiliser mon coupon",
    enter: "Saisissez un code promotionnel.", notFound: "Coupon invalide ou inactif.", expired: "Ce coupon a expiré.",
    wrongPhone: "Ce coupon a été émis pour un autre numéro.", used: "Ce coupon a déjà été utilisé.",
    wrongDate: "Ce coupon n'est pas disponible à cette date.", needsReminder: "Ce coupon exige l'inscription aux rappels promotionnels.",
    needsIdle: "Ce coupon de relance n'est pas encore disponible.", applied: "Coupon appliqué",
    created: "Coupon créé. Saisissez le code dans le champ puis appuyez sur Appliquer.",
    unavailable: "Les coupons ne sont pas disponibles pour cette excursion.", qrExclusive: "Réduction QR active. Les coupons ne se cumulent pas avec le QR.",
    packageUnavailable: "Les forfaits promotionnels n'acceptent pas les coupons.",
  },
  it: {
    placeholder: "Inserisci il tuo coupon", apply: "Applica", obtain: "Ottieni un coupon", useSaved: "Usa il mio coupon",
    enter: "Inserisci un codice promozionale.", notFound: "Coupon non valido o inattivo.", expired: "Questo coupon è scaduto.",
    wrongPhone: "Questo coupon è stato emesso per un altro numero.", used: "Questo coupon è già stato utilizzato.",
    wrongDate: "Questo coupon non è disponibile in questa data.", needsReminder: "Questo coupon richiede l'iscrizione ai promemoria promozionali.",
    needsIdle: "Questo coupon di recupero non è ancora disponibile.", applied: "Coupon applicato",
    created: "Coupon creato. Inserisci il codice nel campo e premi Applica per usare lo sconto.",
    unavailable: "Coupon non disponibili per questo tour.", qrExclusive: "Sconto QR attivo. I coupon non si sommano al QR.",
    packageUnavailable: "I pacchetti promozionali non accettano coupon.",
  },
};

const CRUISE_CALENDAR_LINK: Record<Lang, string> = {
  pt: "Confira o calendário de escalas da Prefeitura",
  es: "Consulta el calendario municipal de escalas",
  en: "View the city cruise-call calendar",
  fr: "Consulter le calendrier municipal des escales",
  it: "Consulta il calendario comunale degli scali",
};

interface Props {
  lang: Lang;
  onLangChange: (l: Lang) => void;
  onBack: () => void;
  title: string;
  backgroundImage: string;
  /** disable children section entirely (e.g. adults-only diving) */
  adultsOnly?: boolean;
  /** show CPF field below name (catamaran) */
  requireCpf?: boolean;
  /** banner text shown above form (e.g. age restriction notice) */
  notice?: string;
  /** require pousada fields (Arraial / Cabo Frio) */
  requirePousada?: boolean;
  /** tour key for price + coupon application */
  tourKey?: TourKey;
  /** valor fixo de pacote promocional (R$). Cupons NÃO se aplicam. */
  packagePrice?: number;
  /** nome do passeio/pacote em português (usado na mensagem do WhatsApp) */
  titlePt?: string;
  /** nomes em português dos passeios vinculados ao pacote */
  packageTourNames?: string[];
  /** chaves dos passeios vinculados ao pacote */
  packageTourKeys?: string[];
  /** identificador estável do pacote, usado para separar o rascunho */
  bookingDraftId?: string;
  /** chave CMS do pacote para validar a composição no servidor */
  packageKey?: string;
}

const fieldClass =
  "bg-night/70 backdrop-blur-sm border-turquoise/40 text-foreground placeholder:text-foreground/50 focus-visible:ring-turquoise focus-visible:border-turquoise h-12";

type StandardOutput = {
  text: string;
  rows: { label: string; value: string }[];
  voucherWarning?: boolean;
};

type PendingVoucherRequest = {
  reservationId: string;
  requestId: string;
  requestProof: string;
  idioma: Lang;
  totalPeople: number;
  tourKeys: string[];
  packageKey?: string;
  messageBase: string;
};

export const StandardForm = ({
  lang, onLangChange, onBack, title, backgroundImage,
  adultsOnly = false, requireCpf = false, notice, requirePousada = false, tourKey,
  packagePrice, titlePt, packageTourNames, packageTourKeys, bookingDraftId, packageKey,
}: Props) => {
  const isPackage = typeof packagePrice === "number";
  const t = dict[lang];
  const draftKey = bookingDraftKey(tourKey, bookingDraftId, titlePt ?? title);
  const [initialDraft] = useState(() => readBookingDraft(draftKey));
  const [name, setName] = useState(initialDraft?.name ?? "");
  const [cpf, setCpf] = useState(initialDraft?.cpf ?? "");
  const [phone, setPhone] = useState<PhoneValue>(initialDraft?.phone ?? { ddi: "+55", number: "" });
  const [pax, setPax] = useState(initialDraft?.pax ?? "");
  const [date, setDate] = useState<Date | undefined>(() => initialDraft ? dateFromLocalKey(initialDraft.date) : undefined);
  const [pousada, setPousada] = useState(initialDraft?.pousada ?? "");
  const [room, setRoom] = useState(initialDraft?.room ?? "");
  const [address, setAddress] = useState(initialDraft?.address ?? "");
  const [hasKids, setHasKids] = useState<"yes" | "no" | "">(initialDraft?.hasKids ?? "");
  const [kidsCount, setKidsCount] = useState(initialDraft?.kidsCount ?? "");
  const [ages, setAges] = useState<string[]>(initialDraft?.ages ?? []);
  const [payment, setPayment] = useState<PaymentMethod | "">(initialDraft?.payment ?? "");
  const [output, setOutput] = useState<StandardOutput | null>(null);
  const [savingReservation, setSavingReservation] = useState(false);
  const [pendingVoucher, setPendingVoucher] = useState<PendingVoucherRequest | null>(null);
  const [retryingVoucher, setRetryingVoucher] = useState(false);
  const voucherCredentials = useRef<{ requestId: string; requestProof: string; fingerprint: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [shake, setShake] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<PromoData | null>(null);
  const [appliedSpecial, setAppliedSpecial] = useState<SpecificCoupon | null>(null);
  const [manualCode, setManualCode] = useState(initialDraft?.manualCode ?? "");
  const [couponPromptOpen, setCouponPromptOpen] = useState(false);
  const [qrPromoVersion, setQrPromoVersion] = useState(0);
  // O preço do passeio chega do CMS de forma assíncrona. Este contador força
  // o useMemo abaixo a reler TOUR_PRICES quando o cache for atualizado.
  const [cmsPriceVersion, setCmsPriceVersion] = useState(0);
  const priceStatus = tourKey ? getCmsTourPriceStatus(tourKey) : "ready";
  const cmsPrice = tourKey ? getCachedTour(tourKey)?.preco : null;
  const qrDiscountActive = !!loadQrPromoForTour(tourKey);
  const couponsAllowed = !qrDiscountActive;
  // Cupons NUNCA se aplicam a pacotes promocionais.
  const eligible = !isPackage && (tourKey ? COUPON_ELIGIBLE.has(tourKey) : false) && couponsAllowed;
  const couponText = COUPON_TEXT[lang];
  const savedPromo = loadPromo();
  const savedPromoAvailable = !!savedPromo && !isExpired(savedPromo)
    && (!savedPromo.cupomUsado || isTester(savedPromo) || isAdminMode());
  const requiredMsg = lang === "pt" ? "Preenchimento obrigatório" : lang === "es" ? "Campo obligatorio" : "Required field";
  const ineligibleMsg = isPackage ? couponText.packageUnavailable
    : qrDiscountActive ? couponText.qrExclusive
    : couponText.unavailable;

  useEffect(() => subscribeCmsCache(() => setCmsPriceVersion((version) => version + 1)), []);
  useEffect(() => subscribeQrPromo(() => setQrPromoVersion((version) => version + 1)), []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("nathan:booking-output", { detail: { hidden: !!output } }));
    return () => {
      window.dispatchEvent(new CustomEvent("nathan:booking-output", { detail: { hidden: false } }));
    };
  }, [output]);

  // Cupom efetivo (especial sobrescreve padrão)
  const effectiveCoupon = useMemo(() => appliedSpecial
    ? { code: appliedSpecial.code, percent: appliedSpecial.percent }
    : appliedCoupon
    ? { code: appliedCoupon.cupom, percent: appliedCoupon.percentualDesconto }
    : null, [appliedSpecial, appliedCoupon]);
  const kidsN = Math.min(8, Math.max(0, parseInt(kidsCount) || 0));

  // Autopreenchimento: nome, whatsapp, email do mini cadastro
  useEffect(() => {
    const p = loadPromo();
    if (!p) return;
    if (!name) setName(p.nome);
    // whatsapp já vem como "+55 22 99999 9999" — extrair DDI/digits
    if (!phone.number) {
      const m = p.whatsapp.match(/^(\+\d+)\s*(.*)$/);
      if (m) {
        setPhone({ ddi: m[1], number: m[2].replace(/\D/g, "") });
      }
    }
    // (email não há campo no form base; mantido em localStorage)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestWelcomeCoupon = () => {
    if (!eligible) { toast.error(ineligibleMsg); return; }
    const saved = loadPromo();
    if (saved && !isExpired(saved) && (!saved.cupomUsado || isTester(saved) || isAdminMode())) {
      setManualCode(saved.cupom);
      toast.info(lang === "pt"
        ? "Código preenchido. Toque em Aplicar para ativar o desconto."
        : lang === "es" ? "Código rellenado. Pulsa Aplicar para activar el descuento."
        : lang === "fr" ? "Code renseigné. Appuyez sur Appliquer pour activer la réduction."
        : lang === "it" ? "Codice inserito. Premi Applica per attivare lo sconto."
        : "Code filled in. Tap Apply to activate the discount.");
      return;
    }
    setCouponPromptOpen(true);
  };

  const tryApplyManual = () => {
    const code = normalizeCoupon(manualCode).trim();
    if (!code) { toast.error(couponText.enter); return; }
    if (!eligible) { toast.error(ineligibleMsg); return; }
    const p = loadPromo();

    // Cupom de boas-vindas: ainda exige ação explícita no campo e pertence ao telefone cadastrado.
    if (p && normalizeCoupon(p.cupom) === code) {
      if (isExpired(p)) { toast.error(couponText.expired); return; }
      if (p.cupomUsado && !isTester(p) && !isAdminMode()) { toast.error(couponText.used); return; }
      const enteredPhone = fullPhone(phone).replace(/\D/g, "");
      const couponPhone = p.whatsapp.replace(/\D/g, "");
      if (enteredPhone && couponPhone && enteredPhone !== couponPhone && !isTester(p) && !isAdminMode()) {
        toast.error(couponText.wrongPhone);
        return;
      }
      setAppliedCoupon(p);
      setAppliedSpecial(null);
      toast.success(`${couponText.applied}: ${p.cupom} · -${p.percentualDesconto}%`);
      return;
    }

    const v = validateSpecialCoupon(code, { promo: p, name, whatsapp: fullPhone(phone) });
    if (!v.ok) {
      const msg = v.reason === "not_found" ? couponText.notFound
        : v.reason === "wrong_date" ? couponText.wrongDate
        : v.reason === "needs_reminder" ? couponText.needsReminder
        : v.reason === "needs_idle" ? couponText.needsIdle
        : couponText.used;
      toast.error(msg);
      return;
    }
    setAppliedSpecial(v.coupon!);
    setAppliedCoupon(null); // especial substitui padrão
    toast.success(`${couponText.applied}: ${v.coupon!.code} · -${v.coupon!.percent}%`);
  };

  // Cálculo de preço (quando aplicável)
  const cruiseFeePerPerson = getCruiseEmbarkationFeePerPerson(tourKey, packageTourKeys);
  const priceInfo = useMemo(() => {
    if (isPackage) {
      // Pacote promocional: valor fixo por passageiro, sem cupons/QR.
      const paxN = Math.max(1, parseInt(pax) || 1);
      const original = (packagePrice as number) * paxN;
      const feeApplies = packageIncludesCruiseFeeTour(packageTourKeys) && isCruiseDate(date);
      const feeChildAges = !adultsOnly && hasKids === "yes" ? ages.slice(0, kidsN) : [];
      const embarkation = calculateEmbarkationFee(
        feeApplies,
        Math.max(0, parseInt(pax) || 0),
        feeChildAges,
        cruiseFeePerPerson,
      );
      const amounts = calculateBookingAmounts(original, embarkation.amount, isCardPayment(payment));
      return {
        original, discount: 0, fareFinal: original,
        unitPriceCashPix: packagePrice as number, unitPriceBeforeCoupon: packagePrice as number,
        embarkationPassengerCount: embarkation.passengerCount, embarkationFee: embarkation.amount,
        embarkationFeePerPerson: cruiseFeePerPerson,
        localEmbarkationFee: 0, jardineiraFee: 0, regionalFeePassengerCount: 0,
        ...amounts, final: amounts.total,
        meta: { value: packagePrice as number, from: false }, qrPercent: 0, qrApplied: false, baseOriginal: original,
      };
    }
    if (!tourKey || priceStatus !== "ready" || typeof cmsPrice !== "number") return null;
    const meta = { ...TOUR_PRICES[tourKey], value: cmsPrice };
    const paxN = Math.max(1, parseInt(pax) || 1);
    const halfN = (!adultsOnly && hasKids === "yes")
      ? ages.slice(0, kidsN).filter((a) => { const n = parseInt(a); return n >= 6 && n <= 10; }).length
      : 0;
    const adultKidsN = (!adultsOnly && hasKids === "yes")
      ? ages.slice(0, kidsN).filter((a) => { const n = parseInt(a); return !isNaN(n) && n > 10; }).length
      : 0;
    // Crianças até 5 anos: grátis. 6–10: meia. Acima de 10: tarifa de adulto.
    // Lancha: valor fixo "a partir de" (não multiplica por pax)
    const baseOriginal = meta.from
      ? meta.value
      : (paxN + adultKidsN) * meta.value + halfN * (meta.value / 2);
    const qr = loadQrPromoForTour(tourKey);
    const original = qr ? baseOriginal - (baseOriginal * qr.percent) / 100 : baseOriginal;
    const discount = effectiveCoupon ? (original * effectiveCoupon.percent) / 100 : 0;
    const fareFinal = original - discount;
    const unitPriceBeforeCoupon = qr ? meta.value - (meta.value * qr.percent) / 100 : meta.value;
    const unitPriceCashPix = unitPriceBeforeCoupon - (unitPriceBeforeCoupon * (effectiveCoupon?.percent ?? 0)) / 100;
    const feeApplies = cruiseFeeApplies(tourKey, date);
    const feeChildAges = !adultsOnly && hasKids === "yes" ? ages.slice(0, kidsN) : [];
    const embarkation = calculateEmbarkationFee(
      feeApplies,
      Math.max(0, parseInt(pax) || 0),
      feeChildAges,
      cruiseFeePerPerson,
    );
    const regionalFeeChildren = !adultsOnly && hasKids === "yes" ? kidsN : 0;
    const regionalFees = calculateRegionalBookingFees(
      tourKey,
      Math.max(0, parseInt(pax) || 0),
      regionalFeeChildren,
    );
    const amounts = calculateBookingAmounts(
      fareFinal,
      embarkation.amount + regionalFees.embarkationFee + regionalFees.jardineiraFee,
      isCardPayment(payment),
    );
    return {
      original, discount, fareFinal, unitPriceCashPix, unitPriceBeforeCoupon, ...amounts, final: amounts.total,
      embarkationPassengerCount: embarkation.passengerCount,
      embarkationFee: embarkation.amount,
      embarkationFeePerPerson: cruiseFeePerPerson,
      localEmbarkationFee: regionalFees.embarkationFee,
      jardineiraFee: regionalFees.jardineiraFee,
      regionalFeePassengerCount: regionalFees.passengerCount,
      meta, qrPercent: qr?.percent ?? 0, qrApplied: !!qr, baseOriginal,
    };
  }, [tourKey, pax, hasKids, ages, kidsN, adultsOnly, effectiveCoupon, isPackage, packagePrice, packageTourKeys, cruiseFeePerPerson, priceStatus, cmsPrice, date, payment, qrPromoVersion]);

  const cruiseFeeActive = tourKey
    ? cruiseFeeApplies(tourKey, date)
    : isPackage && packageIncludesCruiseFeeTour(packageTourKeys) && isCruiseDate(date);
  const cruiseCalendarLinkVisible = tourKey === "escuna" || tourKey === "catamara"
    || (isPackage && packageIncludesCruiseFeeTour(packageTourKeys));

  useEffect(() => {
    if (output) {
      clearBookingDraft(draftKey);
      return;
    }
    const hasDraftData = !!(name || cpf || phone.number || pax || date || pousada || room || address
      || hasKids || kidsCount || ages.some(Boolean) || payment || manualCode);
    if (!hasDraftData) {
      clearBookingDraft(draftKey);
      return;
    }
    const saved = saveBookingDraft(draftKey, {
      name, cpf, phone, pax, date: date ? localDateKey(date) : "", pousada, room, address,
      hasKids, kidsCount, ages, payment, manualCode,
    });
    if (!saved) return;
    const expiry = window.setTimeout(() => {
      clearBookingDraft(draftKey);
      setName(""); setCpf(""); setPhone({ ddi: "+55", number: "" }); setPax("");
      setDate(undefined); setPousada(""); setRoom(""); setAddress("");
      setHasKids(""); setKidsCount(""); setAges([]); setPayment(""); setManualCode("");
      setAppliedCoupon(null); setAppliedSpecial(null); setErrors({});
      toast.info(lang === "pt" ? "Os dados da reserva expiraram após 10 minutos. Preencha novamente." : "Booking details expired after 10 minutes. Please fill them in again.");
    }, BOOKING_DRAFT_TTL_MS);
    return () => window.clearTimeout(expiry);
  }, [draftKey, output, name, cpf, phone, pax, date, pousada, room, address, hasKids, kidsCount, ages, payment, manualCode, lang]);

  if (!adultsOnly && ages.length !== kidsN && hasKids === "yes") {
    const next = [...ages];
    while (next.length < kidsN) next.push("");
    next.length = kidsN;
    setAges(next);
  }

  const setAge = (i: number, v: string) => {
    const next = [...ages]; next[i] = v; setAges(next);
  };

  const ageBadge = (raw: string) => {
    const a = parseInt(raw);
    if (isNaN(a)) return null;
    if (a <= 5) return { text: t.free, cls: "text-emerald-300" };
    if (a >= 6 && a <= 10) return { text: t.half, cls: "text-amber-300" };
    return null;
  };

  const { freeCount, halfCount } = useMemo(() => {
    if (adultsOnly || hasKids !== "yes") return { freeCount: 0, halfCount: 0 };
    let f = 0, h = 0;
    ages.slice(0, kidsN).forEach((r) => {
      const a = parseInt(r);
      if (isNaN(a)) return;
      if (a <= 5) f++; else if (a <= 10) h++;
    });
    return { freeCount: f, halfCount: h };
  }, [ages, kidsN, hasKids, adultsOnly]);

  const paymentLabel = (p: PaymentMethod) =>
    ({ cash: t.cash, debit: t.debit, credit: t.credit, pix: t.pix }[p]);

  const handleGenerate = async () => {
    if (tourKey && priceStatus !== "ready") {
      toast.error(tourPriceStatusText(priceStatus, lang));
      if (priceStatus === "error") void forceRefreshCms.tours();
      return;
    }
    const newErrors: Record<string, boolean> = {};
    if (!name) newErrors.name = true;
    if (requireCpf && !cpf) newErrors.cpf = true;
    if (!phone.number) newErrors.phone = true;
    if (!pax || !Number.isInteger(Number(pax)) || Number(pax) < 1) newErrors.pax = true;
    if (!date) newErrors.date = true;
    if (requirePousada && !pousada) newErrors.pousada = true;
    if (requirePousada && !room) newErrors.room = true;
    if (requirePousada && !address) newErrors.address = true;
    if (!adultsOnly && !hasKids) newErrors.hasKids = true;
    if (!adultsOnly && hasKids === "yes" && cruiseFeeActive) {
      const enteredKidsCount = Number(kidsCount);
      const validKidsCount = Number.isInteger(enteredKidsCount) && enteredKidsCount >= 1 && enteredKidsCount <= 8;
      if (!validKidsCount) newErrors.kidsCount = true;
      if (validKidsCount) {
        for (let i = 0; i < enteredKidsCount; i += 1) {
          const age = Number(ages[i]);
          if (ages[i]?.trim() === "" || !Number.isInteger(age) || age < 0 || age > 17) newErrors[`age${i}`] = true;
        }
      }
    }
    if (!payment) newErrors.payment = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setShake((s) => s + 1);
      toast.error(t.required);
      // Focus first invalid field
      requestAnimationFrame(() => {
        const el = document.querySelector<HTMLElement>(".field-error input, .field-error [role='combobox'], .field-error button[role='radio'], .field-error button");
        el?.focus();
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }
    setErrors({});
    const dateStr = date!.toLocaleDateString(lang === "pt" ? "pt-BR" : lang === "es" ? "es-ES" : lang === "fr" ? "fr-FR" : lang === "it" ? "it-IT" : "en-GB");
    const rows: { label: string; value: string }[] = [];
    const priceLines = priceInfo ? buildBookingPriceBreakdown(priceInfo, effectiveCoupon) : [];
    rows.push({ label: t.sumName, value: name });
    if (requireCpf) rows.push({ label: "CPF", value: cpf });
    rows.push({ label: t.sumPhone, value: fullPhone(phone) });
    rows.push({ label: t.sumDate, value: dateStr });
    if (cruiseFeeActive) {
      rows.push({
        label: lang === "pt" ? "Aviso de embarque" : lang === "es" ? "Aviso de embarque" : lang === "fr" ? "Avis d'embarquement" : lang === "it" ? "Avviso d'imbarco" : "Boarding notice",
        value: CRUISE_FEE_BOOKING_NOTICE[lang](cruiseFeePerPerson),
      });
    }
    rows.push({ label: t.sumPax, value: pax });
    if (!adultsOnly && hasKids === "yes" && kidsN > 0) {
      rows.push({ label: t.sumChildren, value: `${kidsN} (${ages.slice(0, kidsN).filter(Boolean).map((a) => `${a} ${t.ageYears}`).join(", ")})` });
      rows.push({ label: t.sumFree, value: String(freeCount) });
      rows.push({ label: t.sumHalf, value: String(halfCount) });
    }
    if (requirePousada) {
      rows.push({ label: t.sumPousada, value: pousada });
      rows.push({ label: t.sumRoom, value: room });
      rows.push({ label: t.sumAddress, value: address });
    }
    rows.push({ label: t.sumPay, value: paymentLabel(payment as PaymentMethod) });

    for (const item of priceLines) {
      if (item.kind === "coupon") rows.push({ label: "Cupom", value: `${item.code} (-${item.percent}%)` });
      if (item.kind === "qr") rows.push({ label: "Desconto QR Code", value: `-${item.percent}%` });
      if (item.kind === "fare") rows.push({ label: isCardPayment(payment) ? PAYMENT_PRICE_LABELS[lang].tourFareCard : PAYMENT_PRICE_LABELS[lang].tourFareCashPix, value: formatBRL(item.amount) });
      if (item.kind === "embarkation") {
        rows.push({
          label: `${LABELS[lang].embarkationFee} (${item.passengers} ${LABELS[lang].feePerPassenger} × ${formatBRL(priceInfo.embarkationFeePerPerson)})`,
          value: formatBRL(item.amount),
        });
      }
      if (item.kind === "localEmbarkation") {
        rows.push({
          label: `${LABELS[lang].localEmbarkationFee} (${item.passengers} ${LABELS[lang].passengerUnit} × ${formatBRL(REGIONAL_EMBARKATION_FEE_PER_PERSON)})`,
          value: formatBRL(item.amount),
        });
      }
      if (item.kind === "jardineira") {
        rows.push({
          label: `${LABELS[lang].jardineiraFee} (${item.passengers} ${LABELS[lang].passengerUnit} × ${formatBRL(JARDINEIRA_FEE_PER_PERSON)})`,
          value: formatBRL(item.amount),
        });
      }
      if (item.kind === "total") rows.push({ label: LABELS[lang].totalDue, value: formatBRL(item.amount) });
    }
    rows.push({ label: lang === "pt" ? "Local Check-in" : "Check-in" , value: "Praça Santos Dummont, Cabine 03 - Búzios/RJ" });
    rows.push({ label: lang === "pt" ? "Horário Check-in" : "Check-in time", value: "Até 11:30 — falar com Nathan ou Mary" });

    // ===== Mensagem WhatsApp: estrutura e rótulos SEMPRE em português =====
    // Dados digitados pelo cliente permanecem exatamente como inseridos.
    const msgTitle = titlePt || (tourKey ? getTour(tourKey, "pt").title : title);
    const noCheckin = tourKey === "arraial" || tourKey === "lancha";
    const lines = [`🚤 NOVA RESERVA — ${msgTitle}`];
    if (isPackage && packageTourNames?.length) {
      lines.push(`Passeios incluídos: ${packageTourNames.join(" & ")}.`);
    }
    lines.push(`👤 Responsável: ${name}`);
    if (requireCpf && cpf.trim()) lines.push(`🪪 CPF: ${cpf.trim()}`);
    lines.push(
      `📞 Telefone: ${fullPhone(phone)}`,
      `📅 Data: ${dateStr}`,
    );
    if (tourKey === "arraial") {
      lines.push(formatArraialPassengerSummary(Number.parseInt(pax, 10) || 0, !adultsOnly && hasKids === "yes" ? ages.slice(0, kidsN) : []));
    } else {
      lines.push(`👥 Passageiros Adultos: ${pax}`);
      if (cruiseFeeActive) {
        lines.push("⚓ Por conta do cruzeiro, o embarque será em píer privado. O local específico será informado pela equipe.");
      }
      if (!adultsOnly && hasKids === "yes" && kidsN > 0) {
        lines.push(`🧒 Crianças: ${kidsN} (idades: ${ages.slice(0, kidsN).filter(Boolean).join(", ")})`);
        if (freeCount > 0) lines.push(`🆓 Passageiros grátis: ${freeCount}`);
        if (halfCount > 0) lines.push(`½ Passageiros meia: ${halfCount}`);
      }
    }
    if (requirePousada) {
      if (pousada.trim()) lines.push(`🏨 Pousada: ${pousada.trim()}`);
      if (room.trim()) lines.push(`🔢 Quarto: ${room.trim()}`);
      if (address.trim()) lines.push(`📍 Endereço: ${address.trim()}`);
    }
    lines.push("");
    if (priceInfo) {
      lines.push("💰 VALORES DA RESERVA");
      for (const item of priceLines) {
        if (item.kind === "coupon") lines.push(`Cupom aplicado: ${item.code} (−${item.percent}%)`);
        if (item.kind === "qr") lines.push(`Desconto QR Code: −${item.percent}%`);
        if (item.kind === "fare") lines.push(`Passeio (${isCardPayment(payment) ? "preço no cartão +10%" : "dinheiro/Pix"}, após descontos): ${formatBRL(item.amount)}`);
        if (item.kind === "embarkation") {
          lines.push(`Taxa de embarque (${item.passengers} pessoa(s) × ${formatBRL(priceInfo.embarkationFeePerPerson)}): ${formatBRL(item.amount)}`);
        }
        if (item.kind === "localEmbarkation") {
          lines.push(`Taxa de embarque (${item.passengers} pessoa(s) × ${formatBRL(REGIONAL_EMBARKATION_FEE_PER_PERSON)}): ${formatBRL(item.amount)}`);
        }
        if (item.kind === "jardineira") {
          lines.push(`Taxa da jardineira (${item.passengers} pessoa(s) × ${formatBRL(JARDINEIRA_FEE_PER_PERSON)}): ${formatBRL(item.amount)}`);
        }
        if (item.kind === "total") lines.push(`💰 TOTAL A PAGAR: ${formatBRL(item.amount)}`);
      }
    }
    lines.push(`💳 Forma de pagamento: ${PAYMENT_PT[payment as PaymentMethod]}`);
    if (!noCheckin) {
      lines.push(
        "",
        "📍 Local do Check-in: Praça Santos Dummont, Cabine de Passeios Número 03 - Armação dos Búzios - RJ.",
        "🕐 Horário do Check-in: até às 11:20 da manhã. Falar com Nathan ou Mary.",
      );
    }
    const messageBase = lines.join("\n");
    const voucherTourKeys = packageTourKeys?.length ? packageTourKeys : tourKey ? [tourKey] : [];
    const totalPeople = Math.max(1, (parseInt(pax, 10) || 0) + (!adultsOnly && hasKids === "yes" ? kidsN : 0));
    const waPersist = fullPhone(phone);
    const reservationData = {
      nome: name,
      telefone: waPersist,
      destino: title,
      data_viagem: date ? localDateKey(date) : null,
      passageiros: parseInt(pax) || null,
      cupom_aplicado: effectiveCoupon?.code ?? null,
      valor_original: priceInfo?.original ?? null,
      valor_com_desconto: priceInfo ? priceInfo.final : null,
    };
    const voucherFingerprint = JSON.stringify({ reservationData, totalPeople, idioma: lang, tourKeys: voucherTourKeys, packageKey });
    if (date && voucherTourKeys.length > 0 && voucherCredentials.current?.fingerprint !== voucherFingerprint) {
      voucherCredentials.current = {
        requestId: crypto.randomUUID(),
        requestProof: randomVoucherSecret(),
        fingerprint: voucherFingerprint,
      };
    }
    const voucherRequest = date && voucherTourKeys.length > 0 ? voucherCredentials.current : null;

    // A reserva permanece pendente até uma confirmação humana; abrir wa.me não
    // comprova que o texto foi efetivamente enviado.
    syncLead({ nome: name, telefone: waPersist, origem: tourKey ? `reserva:${tourKey}` : "reserva" });
    setSavingReservation(true);
    let savedId: string | null = null;
    let voucherUnavailable = false;
    for (let attempt = 0; attempt < 3 && !savedId; attempt += 1) {
      try {
        savedId = voucherRequest
          ? await createReservaVoucherInDb(reservationData, {
              ...voucherRequest,
              idioma: lang,
              totalPessoas: totalPeople,
            })
          : await createReservaInDb(reservationData);
      } catch {
        savedId = null;
      }
      if (!savedId && attempt < 2) await new Promise((resolve) => setTimeout(resolve, 700 * (attempt + 1)));
    }
    if (!savedId && voucherRequest) {
      // Compatibilidade com versões do backend ainda sem a migration/ação de vouchers.
      // A reserva legada continua funcionando; nenhum link fictício é anexado.
      voucherUnavailable = true;
      for (let attempt = 0; attempt < 3 && !savedId; attempt += 1) {
        savedId = await createReservaInDb(reservationData);
        if (!savedId && attempt < 2) await new Promise((resolve) => setTimeout(resolve, 700 * (attempt + 1)));
      }
    }
    if (!savedId) {
      setSavingReservation(false);
      toast.error(lang === "pt"
        ? "Não conseguimos salvar sua reserva. Verifique sua conexão e tente novamente."
        : "We could not save your reservation. Check your connection and try again.");
      return;
    }
    if (voucherUnavailable) {
      setSavingReservation(false);
      setOutput({ text: messageBase, rows, voucherWarning: true });
      return;
    }
    if (voucherRequest) {
      const pending: PendingVoucherRequest = {
        reservationId: savedId,
        ...voucherRequest,
        idioma: lang,
        totalPeople,
        tourKeys: voucherTourKeys,
        packageKey,
        messageBase,
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
            packageKey: pending.packageKey,
            messageBase: pending.messageBase,
          });
          issuedMessage = issued.message;
        } catch {
          if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 700 * (attempt + 1)));
        }
      }
      if (issuedMessage) {
        setSavingReservation(false);
        setPendingVoucher(null);
        setOutput({ text: issuedMessage, rows });
        return;
      }
      await saveVoucherMessageInDb({
        reservationId: pending.reservationId,
        requestId: pending.requestId,
        requestProof: pending.requestProof,
        message: messageBase,
      });
      setSavingReservation(false);
      setOutput({ text: messageBase, rows, voucherWarning: true });
      return;
    }
    setSavingReservation(false);
    setOutput({ text: messageBase, rows });
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
        packageKey: pendingVoucher.packageKey,
        messageBase: pendingVoucher.messageBase,
      });
      setOutput((current) => current ? { ...current, text: issued.message, voucherWarning: false } : current);
      setPendingVoucher(null);
      toast.success(lang === "pt" ? "Vouchers gerados com sucesso." : lang === "es" ? "Vouchers generados correctamente." : lang === "fr" ? "Vouchers générés avec succès." : lang === "it" ? "Voucher generati correttamente." : "Vouchers generated successfully.");
    } catch {
      toast.error(lang === "pt" ? "Ainda não foi possível gerar o link. Sua reserva continua salva; tente novamente." : lang === "es" ? "Aún no se pudo generar el enlace. Tu reserva sigue guardada; inténtalo de nuevo." : lang === "fr" ? "Le lien n’a pas pu être généré. Votre réservation reste enregistrée ; réessayez." : lang === "it" ? "Non è stato possibile generare il link. La prenotazione è salvata; riprova." : "We could not generate the link yet. Your booking is saved; please retry.");
    } finally {
      setRetryingVoucher(false);
    }
  };

  const handleReservationSent = async () => {
    if (appliedSpecial) markSpecialUsed(appliedSpecial.code, name, fullPhone(phone));
    if (appliedCoupon) markCouponUsed();
    const cupomAplicado = effectiveCoupon?.code ?? null;
    if (cupomAplicado) markCouponUsedInDb(cupomAplicado);
  };

  const clearErr = (k: string) => {
    if (errors[k]) setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
  };

  const reset = () => {
    setName(""); setCpf(""); setPhone({ ddi: "+55", number: "" }); setPax("");
    setDate(undefined); setPousada(""); setRoom(""); setAddress(""); setManualCode("");
    setAppliedCoupon(null); setAppliedSpecial(null);
    setHasKids(""); setKidsCount(""); setAges([]); setPayment(""); setOutput(null);
    setPendingVoucher(null); voucherCredentials.current = null;
  };

  if (output) {
    const adminOn = isAdminMode();
    return (
      <>
        {!adminOn && <QrPromoBoot lang={lang} />}
        {!adminOn && <PromoBanner lang={lang} tourKey={tourKey} />}
        <div className={adminOn ? "" : "pt-12"}>
          <PageShell title={title} lang={lang} onLangChange={onLangChange} onBack={onBack} backgroundImage={backgroundImage}>
            <SummaryOutput text={output.text} rows={output.rows} tourTitle={title} lang={lang} onReset={onBack} onSend={handleReservationSent} voucherWarning={output.voucherWarning} onRetryVoucher={pendingVoucher ? retryVoucherIssue : undefined} retryingVoucher={retryingVoucher} />
          </PageShell>
        </div>
      </>
    );
  }

  const adminOn = isAdminMode();
  return (
    <>
      {!adminOn && <QrPromoBoot lang={lang} />}
      {!adminOn && (
        <PromoBanner
          lang={lang}
          tourKey={tourKey}
          forceOpen={couponPromptOpen}
          onForceOpenChange={setCouponPromptOpen}
          onPromoCreated={(p) => {
            if (!name) setName(p.nome);
            if (!phone.number) {
              const m = p.whatsapp.match(/^(\+\d+)\s*(.*)$/);
              if (m) setPhone({ ddi: m[1], number: m[2].replace(/\D/g, "") });
            }
            setCouponPromptOpen(false);
            toast.success(`Cupom ${p.cupom} criado · -${p.percentualDesconto}%. ${couponText.created}`);
          }}
        />
      )}
      <div className={adminOn ? "" : "pt-12"}>
      <PageShell title={title} lang={lang} onLangChange={onLangChange} onBack={onBack} backgroundImage={backgroundImage}>
        <p className="text-foreground bg-night/50 backdrop-blur-sm rounded-lg p-3 mb-4 text-sm leading-relaxed font-medium">{t.intro}</p>
        {notice && (
          <div className="mb-4 flex items-start gap-2 rounded-md border border-amber-400/30 bg-amber-500/5 px-3 py-2">
            <span className="text-sm opacity-80 mt-0.5">{adultsOnly ? "🔞" : "ℹ️"}</span>
            <p className="text-xs font-normal text-amber-200/90 italic leading-relaxed">
              {notice}
            </p>
          </div>
        )}

        {/* Preço + Aplicar Cupom */}
        {(tourKey || isPackage) && (
          <div className="mb-5 glass-card rounded-2xl p-4 space-y-3">
            <div className="space-y-3">
              <div className="min-w-0">
                <div className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {effectiveCoupon ? PAYMENT_PRICE_LABELS[lang].discountedUnitPrice : PAYMENT_PRICE_LABELS[lang].unitPrice}
                </div>
                {priceInfo ? (
                  <>
                    {(effectiveCoupon || priceInfo.qrApplied) && (
                      <div className="mb-1 text-xs text-muted-foreground line-through">
                        {formatBRL(priceInfo.qrApplied ? priceInfo.meta.value : priceInfo.unitPriceBeforeCoupon)}
                      </div>
                    )}
                    <PaymentPriceDisplay cashPixPrice={priceInfo.unitPriceCashPix} from={!!priceInfo.meta.from} lang={lang} size="md" />
                    {effectiveCoupon && <div className="mt-1 text-[11px] text-emerald-300 font-semibold">{effectiveCoupon.code} · -{effectiveCoupon.percent}%</div>}
                    {priceInfo.qrApplied && <div className="mt-1 text-[11px] text-emerald-300 font-semibold">-{priceInfo.qrPercent}% via QR Code</div>}
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">{tourKey ? tourPriceStatusText(priceStatus, lang) : ""}</div>
                )}
                {tourKey && priceStatus === "error" && (
                  <button type="button" className="mt-1 text-xs underline text-muted-foreground" onClick={() => void forceRefreshCms.tours()}>
                    {lang === "pt" ? "Tentar novamente" : lang === "es" ? "Intentar de nuevo" : lang === "fr" ? "Réessayer" : lang === "it" ? "Riprova" : "Try again"}
                  </button>
                )}
                {isPackage && (
                  <div className="text-[10px] text-amber-200/80 italic mt-1">
                    ✦ {lang === "pt" ? "Combo promocional · cupons não se aplicam" : "Promo combo · coupons not applicable"}
                  </div>
                )}
              </div>
              {eligible && !effectiveCoupon && !adminOn && (
                <button
                  type="button"
                  onClick={requestWelcomeCoupon}
                  className="rgb-border w-full block"
                >
                  <span className="flex items-center gap-1.5 rounded-[0.55rem] bg-gradient-to-r from-turquoise to-turquoise-glow text-night font-bold text-xs px-3 py-2">
                    <Tag className="h-3.5 w-3.5" />
                    {savedPromoAvailable ? couponText.useSaved : couponText.obtain}
                  </span>
                </button>
              )}
            </div>

            {eligible ? (
              <div className="flex gap-2">
                <Input
                  value={effectiveCoupon ? effectiveCoupon.code : manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  disabled={!!effectiveCoupon}
                  placeholder={couponText.placeholder}
                  className={`${fieldClass} h-10 text-sm uppercase tracking-wider`}
                />
                {!effectiveCoupon && (
                  <Button
                    type="button"
                    onClick={tryApplyManual}
                    className="h-10 bg-turquoise/20 border border-turquoise/40 text-foreground hover:bg-turquoise/30"
                  >
                    {couponText.apply}
                  </Button>
                )}
                {effectiveCoupon && (
                  <Button
                    type="button"
                    variant="ghost"
                    aria-label={lang === "pt" ? "Remover cupom" : lang === "es" ? "Quitar cupón" : lang === "fr" ? "Retirer le coupon" : lang === "it" ? "Rimuovi coupon" : "Remove coupon"}
                    onClick={() => { setAppliedCoupon(null); setAppliedSpecial(null); setManualCode(""); }}
                    className="h-10 px-3 text-emerald-300 hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-amber-200/80 italic">
                {ineligibleMsg}
              </p>
            )}
          </div>
        )}

        <div className="space-y-5" key={shake}>
          <Field label={`✍️ ${t.fullName}`} error={errors.name} errorMsg={requiredMsg}>
            <Input value={name} onChange={(e) => { setName(e.target.value); clearErr("name"); }} className={fieldClass} />
          </Field>

          {requireCpf && (
            <Field label={`🪪 ${t.cpfResponsible}`} error={errors.cpf} errorMsg={requiredMsg}>
              <Input
                value={cpf}
                onChange={(e) => { setCpf(e.target.value); clearErr("cpf"); }}
                placeholder="000.000.000-00"
                className={fieldClass}
              />
            </Field>
          )}

          <Field label={`📞 ${t.phone}`} error={errors.phone} errorMsg={requiredMsg}>
            <PhoneInput value={phone} onChange={(v) => { setPhone(v); if (v.number) clearErr("phone"); }} inputClassName={fieldClass} />
          </Field>
          <Field label={`👥 ${t.passengers}`} error={errors.pax} errorMsg={requiredMsg}>
            <Input value={pax} onChange={(e) => { setPax(e.target.value); clearErr("pax"); }} type="number" min={1} className={fieldClass} />
            <p className="text-[11px] text-foreground/60 italic">{t.adultNote}</p>
          </Field>

          <Field label={`📅 ${t.tourDate}`} error={errors.date} errorMsg={requiredMsg}>
            <TourDatePicker
              lang={lang}
              value={date}
              onChange={(d) => { setDate(d); if (d) clearErr("date"); }}
              error={errors.date}
              showCruiseDates={cruiseCalendarLinkVisible}
            />
          </Field>
          {cruiseCalendarLinkVisible && (
            <a href={CRUISE_CALENDAR_PATH} target="_blank" rel="noopener noreferrer" className="-mt-3 inline-flex items-center gap-1 text-xs font-semibold text-turquoise underline underline-offset-2 hover:text-turquoise-glow">
              <ExternalLink className="h-3 w-3" /> {CRUISE_CALENDAR_LINK[lang]}
            </a>
          )}
          {cruiseFeeActive && (
            <div role="status" className="-mt-3 rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-sm leading-relaxed text-amber-100">
              {CRUISE_FEE_BOOKING_NOTICE[lang](cruiseFeePerPerson)}
            </div>
          )}

          {requirePousada && (
            <>
              <Field label={`🛌 ${t.pousadaName}`} error={errors.pousada} errorMsg={requiredMsg}>
                <Input value={pousada} onChange={(e) => { setPousada(e.target.value); clearErr("pousada"); }} className={fieldClass} />
              </Field>
              <Field label={`🔢 ${t.roomNumber}`} error={errors.room} errorMsg={requiredMsg}>
                <Input value={room} onChange={(e) => { setRoom(e.target.value); clearErr("room"); }} className={fieldClass} />
              </Field>
              <Field label={`📍 ${t.pousadaAddress}`} error={errors.address} errorMsg={requiredMsg}>
                <Input value={address} onChange={(e) => { setAddress(e.target.value); clearErr("address"); }} className={fieldClass} />
              </Field>
            </>
          )}

          {!adultsOnly && (
            <>
              <Field label={t.hasChildren} error={errors.hasKids} errorMsg={requiredMsg}>
                <RadioGroup
                  value={hasKids}
                  onValueChange={(v) => { setHasKids(v as "yes" | "no"); clearErr("hasKids"); }}
                  className="flex gap-3"
                >
                  {(["yes", "no"] as const).map((v) => (
                    <label
                      key={v}
                      className={`flex-1 cursor-pointer rounded-xl border-2 p-3 text-center transition-all ${
                        hasKids === v
                          ? "border-turquoise bg-turquoise/10 text-turquoise"
                          : "border-border bg-card/40 hover:border-turquoise/50"
                      }`}
                    >
                      <RadioGroupItem value={v} className="sr-only" />
                      {v === "yes" ? t.yes : t.no}
                    </label>
                  ))}
                </RadioGroup>
              </Field>

              {hasKids === "yes" && (
                <div className="space-y-5 rounded-2xl border border-turquoise/25 bg-card/40 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Field label={t.childrenCount} error={errors.kidsCount} errorMsg={requiredMsg}>
                    <Input
                      type="number" min={1} max={8}
                      value={kidsCount}
                      onChange={(e) => { setKidsCount(e.target.value); clearErr("kidsCount"); }}
                      className={fieldClass}
                    />
                  </Field>
                  {Array.from({ length: kidsN }).map((_, i) => {
                    const badge = ageBadge(ages[i] || "");
                    return (
                      <Field key={i} label={t.childAge(i + 1)} error={errors[`age${i}`]} errorMsg={requiredMsg}>
                        <Input
                          type="number" min={0} max={17} step={1}
                          value={ages[i] || ""}
                          onChange={(e) => { setAge(i, e.target.value); clearErr(`age${i}`); }}
                          className={fieldClass}
                        />
                        {badge && <p className={`mt-2 text-sm font-semibold ${badge.cls}`}>{badge.text}</p>}
                        {cruiseFeeActive && Number.parseInt(ages[i] || "", 10) >= 5 && (
                          <p className="mt-2 text-xs leading-relaxed text-amber-200/90">{CRUISE_CHILD_FEE_NOTICE[lang](cruiseFeePerPerson)}</p>
                        )}
                      </Field>
                    );
                  })}
                  {kidsN > 0 && (
                    <div className="text-sm text-muted-foreground border-t border-border/50 pt-3">
                      {t.freePassengers}: <span className="font-semibold text-turquoise">{freeCount}</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <Field label={t.payment} error={errors.payment} errorMsg={requiredMsg}>
            <Select value={payment} onValueChange={(v) => { setPayment(v as PaymentMethod); clearErr("payment"); }}>
              <SelectTrigger className={fieldClass}>
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent className="bg-card border-turquoise/30">
                <SelectItem value="cash">{t.cash}</SelectItem>
                <SelectItem value="debit">{t.debit}</SelectItem>
                <SelectItem value="credit">{t.credit}</SelectItem>
                <SelectItem value="pix">{t.pix}</SelectItem>
              </SelectContent>
            </Select>
            {isCardPayment(payment) && (
              <p className="mt-2 text-sm text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                {PAYMENT_PRICE_LABELS[lang].cardNotice}
              </p>
            )}
          </Field>

          {priceInfo && payment && (
            <section aria-live="polite" className="rounded-2xl border border-turquoise/25 bg-card/50 p-4 space-y-2 text-sm">
              {(priceInfo.embarkationFee > 0 || priceInfo.localEmbarkationFee > 0 || priceInfo.jardineiraFee > 0) && (
                <div className="flex justify-between gap-4">
                  <span>{isCardPayment(payment) ? PAYMENT_PRICE_LABELS[lang].tourFareCard : PAYMENT_PRICE_LABELS[lang].tourFareCashPix}</span>
                  <span>{formatBRL(priceInfo.fareForPayment)}</span>
                </div>
              )}
              {priceInfo.embarkationFee > 0 && (
                <div className="flex justify-between gap-4">
                  <span>{LABELS[lang].embarkationFee} ({priceInfo.embarkationPassengerCount} {LABELS[lang].feePerPassenger} × {formatBRL(priceInfo.embarkationFeePerPerson)})</span>
                  <span>{formatBRL(priceInfo.embarkationFee)}</span>
                </div>
              )}
              {priceInfo.localEmbarkationFee > 0 && (
                <div className="flex justify-between gap-4">
                  <span>{LABELS[lang].localEmbarkationFee} ({priceInfo.regionalFeePassengerCount} {LABELS[lang].passengerUnit} × {formatBRL(REGIONAL_EMBARKATION_FEE_PER_PERSON)})</span>
                  <span>{formatBRL(priceInfo.localEmbarkationFee)}</span>
                </div>
              )}
              {priceInfo.jardineiraFee > 0 && (
                <div className="flex justify-between gap-4">
                  <span>{LABELS[lang].jardineiraFee} ({priceInfo.regionalFeePassengerCount} {LABELS[lang].passengerUnit} × {formatBRL(JARDINEIRA_FEE_PER_PERSON)})</span>
                  <span>{formatBRL(priceInfo.jardineiraFee)}</span>
                </div>
              )}
              <div className="flex justify-between gap-4 border-t border-turquoise/30 pt-2 font-bold text-base">
                <span>{LABELS[lang].totalDue}</span>
                <span>{formatBRL(priceInfo.final)}</span>
              </div>
            </section>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={savingReservation || (!!tourKey && priceStatus !== "ready")}
            className="rgb-border w-full block disabled:cursor-wait disabled:opacity-70"
          >
            <span className="flex items-center justify-center w-full h-[calc(3.5rem-4px)] rounded-[0.65rem] bg-gradient-to-r from-turquoise to-turquoise-glow text-night font-bold text-base">
              {savingReservation ? "Salvando reserva…" : t.generate}
            </span>
          </button>
        </div>
      </PageShell>
      </div>
    </>
  );
};

const Field = ({ label, children, error, errorMsg }: { label: string; children: React.ReactNode; error?: boolean; errorMsg?: string }) => (
  <div className={`interactive-field space-y-2 ${error ? "field-error field-error-shake" : ""}`}>
    <Label className="text-foreground font-semibold drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]">{label}</Label>
    {children}
    {error && errorMsg && <p className="text-xs text-rose-400 mt-1">{errorMsg}</p>}
  </div>
);
