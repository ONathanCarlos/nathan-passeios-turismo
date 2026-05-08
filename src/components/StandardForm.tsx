import { useEffect, useMemo, useState } from "react";
import { Lang, dict } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PageShell } from "./PageShell";
import { SummaryOutput } from "./SummaryOutput";
import { WhatsAppFab } from "./WhatsAppFab";
import { PhoneInput, PhoneValue, fullPhone } from "./PhoneInput";
import { toast } from "sonner";
import { TourDatePicker } from "./TourDatePicker";
import { PromoBanner } from "./PromoBanner";
import { QrPromoBoot } from "./QrPromo";
import { loadQrPromo, urlIsExactRoot } from "@/lib/qrPromo";

import { TourKey } from "@/lib/tours";
import { TOUR_PRICES, formatBRL, tourPriceLabel, COUPON_ELIGIBLE } from "@/lib/prices";
import {
  isExpired, isTester, isAdminMode, loadPromo, markCouponUsed, PromoData,
  validateSpecialCoupon, markSpecialUsed, SpecificCoupon, hasHolidayActiveToday,
} from "@/lib/promo";
import { Tag, Lock } from "lucide-react";

type Payment = "cash" | "debit" | "credit" | "pix";

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
}

const fieldClass =
  "bg-night/70 backdrop-blur-sm border-turquoise/40 text-foreground placeholder:text-foreground/50 focus-visible:ring-turquoise focus-visible:border-turquoise h-12";

export const StandardForm = ({
  lang, onLangChange, onBack, title, backgroundImage,
  adultsOnly = false, requireCpf = false, notice, requirePousada = false, tourKey,
}: Props) => {
  const t = dict[lang];
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState<PhoneValue>({ ddi: "+55", number: "" });
  const [pax, setPax] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [pousada, setPousada] = useState("");
  const [room, setRoom] = useState("");
  const [address, setAddress] = useState("");
  const [hasKids, setHasKids] = useState<"yes" | "no" | "">("");
  const [kidsCount, setKidsCount] = useState("");
  const [ages, setAges] = useState<string[]>([]);
  const [payment, setPayment] = useState<Payment | "">("");
  const [output, setOutput] = useState<{ text: string; rows: { label: string; value: string }[] } | null>(null);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [shake, setShake] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState<PromoData | null>(null);
  const [appliedSpecial, setAppliedSpecial] = useState<SpecificCoupon | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [couponPromptOpen, setCouponPromptOpen] = useState(false);
  const couponsAllowed = urlIsExactRoot() && !loadQrPromo();
  const eligible = (tourKey ? COUPON_ELIGIBLE.has(tourKey) : false) && couponsAllowed;
  const requiredMsg = lang === "pt" ? "Preenchimento obrigatório" : lang === "es" ? "Campo obligatorio" : "Required field";
  const ineligibleMsg = lang === "pt" ? "Cupom indisponível para este passeio."
    : lang === "es" ? "Cupón no disponible para este paseo."
    : "Coupon not available for this tour.";

  // Cupom efetivo (especial sobrescreve padrão)
  const effectiveCoupon = appliedSpecial
    ? { code: appliedSpecial.code, percent: appliedSpecial.percent }
    : appliedCoupon
    ? { code: appliedCoupon.cupom, percent: appliedCoupon.percentualDesconto }
    : null;

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

  const tryApplyCoupon = () => {
    if (!eligible) { toast.error(ineligibleMsg); return; }
    if (loadQrPromo() && !isAdminMode()) {
      toast.error(lang === "pt"
        ? "Cupom de boas-vindas indisponível: desconto via QR Code já está ativo."
        : "Welcome coupon unavailable: a QR Code discount is already active.");
      return;
    }
    if (hasHolidayActiveToday() && !isAdminMode()) {
      toast.error(lang === "pt"
        ? "Hoje vale apenas o cupom comemorativo. Use o código do dia."
        : "Today only the holiday coupon is valid. Use the day's code.");
      return;
    }
    const p = loadPromo();
    if (!p) {
      setCouponPromptOpen(true);
      return;
    }
    if (p.cupomUsado && !isTester(p) && !isAdminMode()) {
      toast.error(lang === "pt" ? "Você já utilizou este cupom promocional." : "Coupon already used.");
      return;
    }
    if (isExpired(p)) {
      toast.error(lang === "pt" ? "Cupom expirado." : "Coupon expired.");
      return;
    }
    setAppliedCoupon(p);
    setAppliedSpecial(null);
    toast.success(`Cupom ${p.cupom} aplicado · -${p.percentualDesconto}%`);
  };

  const tryApplyManual = () => {
    const code = manualCode.trim();
    if (!code) return;
    if (!eligible) { toast.error(ineligibleMsg); return; }
    const p = loadPromo();
    const v = validateSpecialCoupon(code, { promo: p, name, whatsapp: fullPhone(phone) });
    if (!v.ok) {
      const msg =
        v.reason === "not_found" ? (lang === "pt" ? "Cupom inválido." : "Invalid coupon.")
        : v.reason === "wrong_date" ? (lang === "pt" ? "Cupom indisponível nesta data." : "Coupon not available today.")
        : v.reason === "needs_reminder" ? (lang === "pt" ? "Cupom requer aceite de lembretes promocionais." : "Coupon requires reminder opt-in.")
        : v.reason === "needs_idle" ? (lang === "pt" ? "Cupom de recuperação ainda não disponível." : "Recovery coupon not yet available.")
        : (lang === "pt" ? "Cupom já utilizado." : "Coupon already used.");
      toast.error(msg);
      return;
    }
    setAppliedSpecial(v.coupon!);
    setAppliedCoupon(null); // especial substitui padrão
    toast.success(`${v.coupon!.code} · -${v.coupon!.percent}%`);
  };

  // Cálculo de preço (quando aplicável)
  const priceInfo = useMemo(() => {
    if (!tourKey) return null;
    const meta = TOUR_PRICES[tourKey];
    const paxN = Math.max(1, parseInt(pax) || 1);
    const halfN = (!adultsOnly && hasKids === "yes")
      ? ages.filter((a) => { const n = parseInt(a); return n >= 6 && n <= 10; }).length
      : 0;
    const freeN = (!adultsOnly && hasKids === "yes")
      ? ages.filter((a) => { const n = parseInt(a); return !isNaN(n) && n <= 5; }).length
      : 0;
    // Lancha: valor fixo "a partir de" (não multiplica por pax)
    const baseOriginal = meta.from
      ? meta.value
      : (paxN - freeN - halfN) * meta.value + halfN * (meta.value / 2);
    const qr = loadQrPromo();
    const original = qr ? baseOriginal - (baseOriginal * qr.percent) / 100 : baseOriginal;
    const discount = effectiveCoupon ? (original * effectiveCoupon.percent) / 100 : 0;
    const final = original - discount;
    return { original, discount, final, meta, qrPercent: qr?.percent ?? 0, qrApplied: !!qr, baseOriginal };
  }, [tourKey, pax, hasKids, ages, adultsOnly, effectiveCoupon]);

  const kidsN = Math.min(8, Math.max(0, parseInt(kidsCount) || 0));

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
    ages.forEach((r) => {
      const a = parseInt(r);
      if (isNaN(a)) return;
      if (a <= 5) f++; else if (a <= 10) h++;
    });
    return { freeCount: f, halfCount: h };
  }, [ages, hasKids, adultsOnly]);

  const paymentLabel = (p: Payment) =>
    ({ cash: t.cash, debit: t.debit, credit: t.credit, pix: t.pix }[p]);

  const handleGenerate = () => {
    const newErrors: Record<string, boolean> = {};
    if (!name) newErrors.name = true;
    if (requireCpf && !cpf) newErrors.cpf = true;
    if (!phone.number) newErrors.phone = true;
    if (!pax) newErrors.pax = true;
    if (!date) newErrors.date = true;
    if (requirePousada && !pousada) newErrors.pousada = true;
    if (requirePousada && !room) newErrors.room = true;
    if (requirePousada && !address) newErrors.address = true;
    if (!adultsOnly && !hasKids) newErrors.hasKids = true;
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
    rows.push({ label: t.sumName, value: name });
    if (requireCpf) rows.push({ label: "CPF", value: cpf });
    rows.push({ label: t.sumPhone, value: fullPhone(phone) });
    rows.push({ label: t.sumDate, value: dateStr });
    rows.push({ label: t.sumPax, value: pax });
    if (!adultsOnly && hasKids === "yes" && kidsN > 0) {
      rows.push({ label: t.sumChildren, value: `${kidsN} (${ages.filter(Boolean).map((a) => `${a} ${t.ageYears}`).join(", ")})` });
      rows.push({ label: t.sumFree, value: String(freeCount) });
      rows.push({ label: t.sumHalf, value: String(halfCount) });
    }
    if (requirePousada) {
      rows.push({ label: t.sumPousada, value: pousada });
      rows.push({ label: t.sumRoom, value: room });
      rows.push({ label: t.sumAddress, value: address });
    }
    rows.push({ label: t.sumPay, value: paymentLabel(payment as Payment) });

    // Preço + cupom
    if (priceInfo) {
      rows.push({ label: lang === "pt" ? "Valor original" : "Original value", value: formatBRL(priceInfo.original) });
      if (priceInfo.qrApplied) {
        rows.push({ label: "QR Code", value: `🎟 ${priceInfo.qrPercent}% OFF` });
      }
      if (effectiveCoupon) {
        rows.push({ label: "Cupom", value: `${effectiveCoupon.code} (-${effectiveCoupon.percent}%)` });
        rows.push({ label: lang === "pt" ? "Economia" : "Savings", value: formatBRL(priceInfo.discount) });
        rows.push({ label: lang === "pt" ? "Valor com desconto" : "Final price", value: formatBRL(priceInfo.final) });
      }
    }
    rows.push({ label: lang === "pt" ? "Local Check-in" : "Check-in" , value: "Praça Santos Dummont, Cabine 03 - Búzios/RJ" });
    rows.push({ label: lang === "pt" ? "Horário Check-in" : "Check-in time", value: "Até 11:30 — falar com Nathan ou Mary" });

    const lines = [t.sumTitle, title, "", `👤 ${t.sumName}: ${name}`];
    if (requireCpf) lines.push(`🪪 CPF: ${cpf}`);
    lines.push(
      `📞 ${t.sumPhone}: ${fullPhone(phone)}`,
      `📅 ${t.sumDate}: ${dateStr}`,
      `👥 ${t.sumPax}: ${pax}`,
    );
    if (!adultsOnly && hasKids === "yes" && kidsN > 0) {
      lines.push(`🧒 ${t.sumChildren}: ${kidsN} (${ages.filter(Boolean).map((a) => `${a} ${t.ageYears}`).join(", ")})`);
      lines.push(`🆓 ${t.sumFree}: ${freeCount}`);
      lines.push(`½ ${t.sumHalf}: ${halfCount}`);
    }
    if (requirePousada) {
      lines.push(`🛌 ${t.sumPousada}: ${pousada}`);
      lines.push(`🔢 ${t.sumRoom}: ${room}`);
      lines.push(`📍 ${t.sumAddress}: ${address}`);
    }
    if (adultsOnly) lines.push(`🔞 ${t.adultsOnly}`);
    lines.push(`💳 ${t.sumPay}: ${paymentLabel(payment as Payment)}`);
    if (payment === "credit") lines.push(t.creditWarning);
    if (priceInfo) {
      lines.push("", `💰 Valor original: ${formatBRL(priceInfo.original)}`);
      if (effectiveCoupon) {
        lines.push(
          `🎟️ Cupom ${effectiveCoupon.code}`,
          `Desconto: ${effectiveCoupon.percent}%`,
          `✅ Valor com desconto aplicado: ${formatBRL(priceInfo.final)}`,
        );
      }
      if (priceInfo.qrApplied) {
        lines.push(`🎟 Promoção aplicada: ${priceInfo.qrPercent}% OFF via QR Code`);
      }
    }
    lines.push(
      "",
      "📍 Local do Check-in: Praça Santos Dummont, Cabine de Passeios Número 03 - Armação dos Búzios - RJ.",
      "🕐 Horário do Check-in: até às 11:30 da manhã. Falar com Nathan ou Mary.",
      "",
      "Reserva feita pelo site https://www.nathanturismo.com.br",
    );
    setOutput({ text: lines.join("\n"), rows });
  };

  const handleReservationSent = () => {
    if (appliedSpecial) markSpecialUsed(appliedSpecial.code, name, fullPhone(phone));
    if (appliedCoupon) markCouponUsed();
  };

  const clearErr = (k: string) => {
    if (errors[k]) setErrors((e) => { const n = { ...e }; delete n[k]; return n; });
  };

  const reset = () => {
    setName(""); setCpf(""); setPhone({ ddi: "+55", number: "" }); setPax("");
    setDate(undefined); setPousada(""); setRoom(""); setAddress("");
    setHasKids(""); setKidsCount(""); setAges([]); setPayment(""); setOutput(null);
  };

  if (output) {
    const adminOn = isAdminMode();
    return (
      <>
        {!adminOn && <QrPromoBoot lang={lang} />}
        {!adminOn && <PromoBanner lang={lang} />}
        <div className={adminOn ? "" : "pt-12"}>
          <PageShell title={title} lang={lang} onLangChange={onLangChange} onBack={onBack} backgroundImage={backgroundImage}>
            <SummaryOutput text={output.text} rows={output.rows} tourTitle={title} lang={lang} onReset={onBack} onSend={handleReservationSent} />
          </PageShell>
        </div>
        <WhatsAppFab lang={lang} />
      </>
    );
  }

  return (
    <>
      <QrPromoBoot lang={lang} />
      <PromoBanner
        lang={lang}
        forceOpen={couponPromptOpen}
        onForceOpenChange={setCouponPromptOpen}
        onPromoCreated={(p) => {
          // Auto-aplica e preenche
          setAppliedCoupon(p);
          if (!name) setName(p.nome);
          if (!phone.number) {
            const m = p.whatsapp.match(/^(\+\d+)\s*(.*)$/);
            if (m) setPhone({ ddi: m[1], number: m[2].replace(/\D/g, "") });
          }
          toast.success(`Cupom ${p.cupom} aplicado · -${p.percentualDesconto}%`);
        }}
      />
      <div className="pt-12">
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
        {tourKey && (
          <div className="mb-5 glass-card rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {effectiveCoupon ? (lang === "pt" ? "Com desconto" : "With discount") : (lang === "pt" ? "Valor" : "Price")}
                </div>
                {effectiveCoupon && priceInfo ? (
                  <>
                    <div className="text-xs text-muted-foreground line-through">{formatBRL(priceInfo.original)}</div>
                    <div className="text-2xl font-extrabold bg-gradient-to-r from-emerald-300 to-turquoise-glow bg-clip-text text-transparent">
                      {formatBRL(priceInfo.final)}
                    </div>
                    <div className="text-[11px] text-emerald-300 font-semibold">
                      {effectiveCoupon.code} · -{effectiveCoupon.percent}%
                    </div>
                  </>
                ) : (
                  <div className="text-2xl font-extrabold bg-gradient-to-r from-turquoise to-turquoise-glow bg-clip-text text-transparent">
                    {tourPriceLabel(tourKey, lang)}
                  </div>
                )}
              </div>
              {eligible && !effectiveCoupon && !hasHolidayActiveToday() && (
                <button
                  type="button"
                  onClick={tryApplyCoupon}
                  className="rgb-border shrink-0"
                >
                  <span className="flex items-center gap-1.5 rounded-[0.55rem] bg-gradient-to-r from-turquoise to-turquoise-glow text-night font-bold text-xs px-3 py-2">
                    <Tag className="h-3.5 w-3.5" />
                    {lang === "pt" ? "Aplicar Cupom" : "Apply Coupon"}
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
                  placeholder={lang === "pt" ? "Digite seu cupom" : "Enter your coupon"}
                  className={`${fieldClass} h-10 text-sm uppercase tracking-wider`}
                />
                {!effectiveCoupon && (
                  <Button
                    type="button"
                    onClick={tryApplyManual}
                    className="h-10 bg-turquoise/20 border border-turquoise/40 text-foreground hover:bg-turquoise/30"
                  >
                    {lang === "pt" ? "Aplicar" : "Apply"}
                  </Button>
                )}
                {effectiveCoupon && (
                  <div className="flex items-center px-2 text-emerald-300">
                    <Lock className="h-4 w-4" />
                  </div>
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
          </Field>

          <Field label={`📅 ${t.tourDate}`} error={errors.date} errorMsg={requiredMsg}>
            <TourDatePicker
              lang={lang}
              value={date}
              onChange={(d) => { setDate(d); if (d) clearErr("date"); }}
              error={errors.date}
            />
          </Field>

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
                  <Field label={t.childrenCount}>
                    <Input
                      type="number" min={1} max={8}
                      value={kidsCount}
                      onChange={(e) => setKidsCount(e.target.value)}
                      className={fieldClass}
                    />
                  </Field>
                  {Array.from({ length: kidsN }).map((_, i) => {
                    const badge = ageBadge(ages[i] || "");
                    return (
                      <Field key={i} label={t.childAge(i + 1)}>
                        <Input
                          type="number" min={0} max={17}
                          value={ages[i] || ""}
                          onChange={(e) => setAge(i, e.target.value)}
                          className={fieldClass}
                        />
                        {badge && <p className={`mt-2 text-sm font-semibold ${badge.cls}`}>{badge.text}</p>}
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
            <Select value={payment} onValueChange={(v) => { setPayment(v as Payment); clearErr("payment"); }}>
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
            {payment === "credit" && (
              <p className="mt-2 text-sm text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                {t.creditWarning}
              </p>
            )}
          </Field>

          <button
            type="button"
            onClick={handleGenerate}
            className="rgb-border w-full block"
          >
            <span className="flex items-center justify-center w-full h-[calc(3.5rem-4px)] rounded-[0.65rem] bg-gradient-to-r from-turquoise to-turquoise-glow text-night font-bold text-base">
              {t.generate}
            </span>
          </button>
        </div>
      </PageShell>
      </div>
      <WhatsAppFab lang={lang} />
    </>
  );
};

const Field = ({ label, children, error, errorMsg }: { label: string; children: React.ReactNode; error?: boolean; errorMsg?: string }) => (
  <div className={`space-y-2 ${error ? "field-error field-error-shake" : ""}`}>
    <Label className="text-foreground font-semibold drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]">{label}</Label>
    {children}
    {error && errorMsg && <p className="text-xs text-rose-400 mt-1">{errorMsg}</p>}
  </div>
);
