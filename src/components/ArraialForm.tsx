import { useState } from "react";
import { Lang, dict } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PageShell } from "./PageShell";
import { SummaryOutput } from "./SummaryOutput";
import { toast } from "sonner";

type Payment = "cash" | "debit" | "credit" | "pix";

interface Props {
  lang: Lang;
  onLangChange: (l: Lang) => void;
  onBack: () => void;
}

const fieldClass =
  "bg-input/60 border-turquoise/25 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-turquoise focus-visible:border-turquoise h-12";

export const ArraialForm = ({ lang, onLangChange, onBack }: Props) => {
  const t = dict[lang];
  const [name, setName] = useState("");
  const [pousada, setPousada] = useState("");
  const [room, setRoom] = useState("");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState<Payment | "">("");
  const [output, setOutput] = useState<string | null>(null);

  const paymentLabel = (p: Payment) =>
    ({ cash: t.cash, debit: t.debit, credit: t.credit, pix: t.pix }[p]);

  const handleGenerate = () => {
    if (!name || !pousada || !room || !address || !payment) {
      toast.error(t.required);
      return;
    }
    const lines = [
      t.sumTitle,
      t.optArraial,
      "",
      `✍️ ${t.sumName}: ${name}`,
      `🛌 ${t.sumPousada}: ${pousada}`,
      `🔢 ${t.sumRoom}: ${room}`,
      `📍 ${t.sumAddress}: ${address}`,
      `💳 ${t.sumPay}: ${paymentLabel(payment as Payment)}`,
    ];
    if (payment === "credit") lines.push(t.creditWarning);
    setOutput(lines.join("\n"));
  };

  const reset = () => {
    setName(""); setPousada(""); setRoom(""); setAddress(""); setPayment(""); setOutput(null);
  };

  if (output) {
    return (
      <PageShell title={t.optArraial} lang={lang} onLangChange={onLangChange} onBack={onBack}>
        <SummaryOutput text={output} lang={lang} onReset={reset} />
      </PageShell>
    );
  }

  return (
    <PageShell title={t.optArraial} lang={lang} onLangChange={onLangChange} onBack={onBack}>
      <p className="text-foreground/80 mb-6 text-sm leading-relaxed">{t.introArraial}</p>
      <div className="space-y-5">
        <Field label={`✍️ ${t.fullName}`}>
          <Input value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} />
        </Field>
        <Field label={`🛌 ${t.pousadaName}`}>
          <Input value={pousada} onChange={(e) => setPousada(e.target.value)} className={fieldClass} />
        </Field>
        <Field label={`🔢 ${t.roomNumber}`}>
          <Input value={room} onChange={(e) => setRoom(e.target.value)} className={fieldClass} />
        </Field>
        <Field label={`📍 ${t.pousadaAddress}`}>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} className={fieldClass} />
        </Field>

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
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <Label className="text-foreground/90 font-medium">{label}</Label>
    {children}
  </div>
);
