import { useMemo, useState } from "react";
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
}

const fieldClass =
  "bg-night/70 backdrop-blur-sm border-turquoise/40 text-foreground placeholder:text-foreground/50 focus-visible:ring-turquoise focus-visible:border-turquoise h-12";

export const StandardForm = ({
  lang, onLangChange, onBack, title, backgroundImage,
  adultsOnly = false, requireCpf = false, notice,
}: Props) => {
  const t = dict[lang];
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState<PhoneValue>({ ddi: "+55", number: "" });
  const [pax, setPax] = useState("");
  const [hasKids, setHasKids] = useState<"yes" | "no" | "">("");
  const [kidsCount, setKidsCount] = useState("");
  const [ages, setAges] = useState<string[]>([]);
  const [payment, setPayment] = useState<Payment | "">("");
  const [output, setOutput] = useState<string | null>(null);

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
    const baseMissing = !name || !phone.number || !pax || !payment;
    const kidsMissing = !adultsOnly && !hasKids;
    const cpfMissing = requireCpf && !cpf;
    if (baseMissing || kidsMissing || cpfMissing) {
      toast.error(t.required);
      return;
    }
    const lines = [
      t.sumTitle,
      title,
      "",
      `👤 ${t.sumName}: ${name}`,
    ];
    if (requireCpf) lines.push(`🪪 CPF: ${cpf}`);
    lines.push(
      `📞 ${t.sumPhone}: ${fullPhone(phone)}`,
      `👥 ${t.sumPax}: ${pax}`,
    );
    if (!adultsOnly && hasKids === "yes" && kidsN > 0) {
      lines.push(`🧒 ${t.sumChildren}: ${kidsN} (${ages.filter(Boolean).map((a) => `${a} ${t.ageYears}`).join(", ")})`);
      lines.push(`🆓 ${t.sumFree}: ${freeCount}`);
      lines.push(`½ ${t.sumHalf}: ${halfCount}`);
    }
    if (adultsOnly) lines.push(`🔞 ${t.adultsOnly}`);
    lines.push(`💳 ${t.sumPay}: ${paymentLabel(payment as Payment)}`);
    if (payment === "credit") lines.push(t.creditWarning);
    setOutput(lines.join("\n"));
  };

  const reset = () => {
    setName(""); setCpf(""); setPhone({ ddi: "+55", number: "" }); setPax("");
    setHasKids(""); setKidsCount(""); setAges([]); setPayment(""); setOutput(null);
  };

  if (output) {
    return (
      <>
        <PageShell title={title} lang={lang} onLangChange={onLangChange} onBack={onBack} backgroundImage={backgroundImage}>
          <SummaryOutput text={output} lang={lang} onReset={reset} />
        </PageShell>
        <WhatsAppFab lang={lang} />
      </>
    );
  }

  return (
    <>
      <PageShell title={title} lang={lang} onLangChange={onLangChange} onBack={onBack} backgroundImage={backgroundImage}>
        <p className="text-foreground bg-night/50 backdrop-blur-sm rounded-lg p-3 mb-4 text-sm leading-relaxed font-medium">{t.intro}</p>
        {notice && (
          <div className="mb-6 rounded-lg border border-amber-400/50 bg-amber-500/15 backdrop-blur-sm p-3 text-sm font-semibold text-amber-200">
            ⚠️ {notice}
          </div>
        )}
        <div className="space-y-5">
          <Field label={`✍️ ${t.fullName}`}>
            <Input value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
          </Field>

          {requireCpf && (
            <Field label={`🪪 ${t.cpfResponsible}`}>
              <Input
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="000.000.000-00"
                className={fieldClass}
              />
            </Field>
          )}

          <Field label={`📞 ${t.phone}`}>
            <PhoneInput value={phone} onChange={setPhone} inputClassName={fieldClass} />
          </Field>
          <Field label={`👥 ${t.passengers}`}>
            <Input value={pax} onChange={(e) => setPax(e.target.value)} type="number" min={1} className={fieldClass} />
          </Field>

          {!adultsOnly && (
            <>
              <Field label={t.hasChildren}>
                <RadioGroup
                  value={hasKids}
                  onValueChange={(v) => setHasKids(v as "yes" | "no")}
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

          <Field label={t.payment}>
            <Select value={payment} onValueChange={(v) => setPayment(v as Payment)}>
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

          <Button
            onClick={handleGenerate}
            className="w-full h-14 bg-gradient-to-r from-turquoise to-turquoise-glow text-night font-bold text-base hover:opacity-90 turquoise-glow"
          >
            {t.generate}
          </Button>
        </div>
      </PageShell>
      <WhatsAppFab lang={lang} />
    </>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <Label className="text-foreground font-semibold drop-shadow-[0_1px_3px_rgba(0,0,0,0.85)]">{label}</Label>
    {children}
  </div>
);
