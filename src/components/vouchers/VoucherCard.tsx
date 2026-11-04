import { forwardRef } from "react";
import type { Lang } from "@/lib/i18n";
import type { PublicVoucher, IssuedVoucherItem } from "@/lib/db";
import { VOUCHER_COPY, getVoucherTemplate, voucherScheduleNote } from "@/lib/vouchers";

interface Props {
  voucher: PublicVoucher;
  item: IssuedVoucherItem;
  lang: Lang;
}

const localeFor: Record<Lang, string> = { pt: "pt-BR", es: "es-ES", en: "en-GB", fr: "fr-FR", it: "it-IT" };
const pct = (left: number, top: number, width?: number, height?: number): React.CSSProperties => ({
  position: "absolute",
  zIndex: 1,
  left: `${left}%`,
  top: `${top}%`,
  ...(width == null ? {} : { width: `${width}%` }),
  ...(height == null ? {} : { height: `${height}%` }),
});

const dateText = (value: string, lang: Lang) => {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat(localeFor[lang], { dateStyle: "long", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, day)));
};

export const VoucherCard = forwardRef<HTMLDivElement, Props>(({ voucher, item, lang }, ref) => {
  const template = getVoucherTemplate(item.template_key || item.tour_key);
  if (!template || !item.template_key) return null;
  const copy = VOUCHER_COPY[lang];
  const notes = voucherScheduleNote(item.tour_key, lang);
  const labelStyle: React.CSSProperties = {
    color: "#80ebf4", fontWeight: 800, letterSpacing: ".075em", lineHeight: 1.15,
    fontSize: "1.68cqw", textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  };
  const valueStyle: React.CSSProperties = {
    color: "#f5fbff", fontWeight: 700, lineHeight: 1.15, fontSize: "2cqw",
    whiteSpace: "normal", overflow: "hidden", overflowWrap: "anywhere",
    display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
  };
  const field = (left: number, top: number, label: string, value: string) => (
    <div style={{ ...pct(left, top, 45.1, 7.05), boxSizing: "border-box", border: "1px solid rgba(104,207,232,.4)", borderRadius: "1.4cqw", background: "rgba(5,20,34,.94)", padding: "1.15cqw 1.4cqw", display: "flex", flexDirection: "column", justifyContent: "space-between", overflow: "hidden" }}>
      <span style={labelStyle}>{label}</span>
      <span style={{ ...valueStyle, borderBottom: "1px dashed rgba(209,228,240,.56)", paddingBottom: ".4cqw" }}>{value}</span>
    </div>
  );

  return (
    <div
      ref={ref}
      className="onix-voucher-card"
      style={{ position: "relative", width: "100%", aspectRatio: "1080 / 1356", overflow: "hidden", containerType: "inline-size", backgroundColor: "#061522", color: "#f5fbff", fontFamily: "Arial, Helvetica, sans-serif", isolation: "isolate" }}
      data-voucher-template={item.tour_key}
    >
      <img src={template.src} alt="" aria-hidden="true" crossOrigin="anonymous" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }} />

      {/* Textos da faixa superior são substituídos mantendo a fotografia, molduras e marca da arte original. */}
      <div style={{ ...pct(4.9, 3.45, 27.2, 4.2), background: "rgba(4,18,31,.97)", borderRadius: "999px", display: "flex", alignItems: "center", justifyContent: "center", color: "#f1fbff", fontSize: "1.85cqw", fontWeight: 800, letterSpacing: ".13em", whiteSpace: "nowrap" }}>{copy.digital}</div>
      <div style={{ ...pct(4.5, 25.5, 91, 15.1), background: "linear-gradient(180deg, rgba(3,12,24,.82), rgba(3,12,24,.96) 35%, rgba(3,12,24,.96))", pointerEvents: "none" }} />
      <div style={{ ...pct(5, 27.1, 88, 2.2), color: "#66e8f0", fontSize: "2.0cqw", fontWeight: 800, letterSpacing: ".13em", lineHeight: 1.15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{template.kicker[lang]}</div>
      <div style={{ ...pct(5, 29.8, 90, 4.9), color: "#fff", fontSize: "5.6cqw", fontWeight: 900, lineHeight: 1.02, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textShadow: "0 2px 10px rgba(0,0,0,.35)" }}>{template.title[lang]}</div>
      <div style={{ ...pct(5.1, 35.8, 88, 2.6), color: "#f1f7fb", fontSize: "2.25cqw", fontWeight: 800, letterSpacing: ".1em", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{template.location[lang]}</div>

      {/* Identificador geral no lugar da segunda linha decorativa do cabeçalho; o nome da marca permanece intacto. */}
      <div style={{ ...pct(12.8, 45.65, 44.2, 2.25), boxSizing: "border-box", background: "rgba(4,21,33,.98)", color: "#67e7ef", fontSize: "1.65cqw", fontWeight: 800, letterSpacing: ".08em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "flex", alignItems: "center", paddingLeft: ".5cqw" }}>{copy.reservationCode}: {voucher.reservation_code}</div>
      <div style={{ ...pct(72.1, 43.9, 23.4, 3.2), background: "rgba(4,24,37,.98)", border: "1px solid rgba(39,217,237,.75)", borderRadius: "999px", display: "flex", alignItems: "center", justifyContent: "center", color: "#73edf2", fontSize: "1.55cqw", fontWeight: 800, letterSpacing: ".07em", textAlign: "center", whiteSpace: "nowrap", overflow: "hidden" }}>{copy.reservationVoucher}</div>
      <div style={{ ...pct(70, 47.3, 26, 1.8), color: "#d7eaf0", fontSize: "1.38cqw", fontWeight: 700, textAlign: "right", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{copy.itemCode}: {item.code}</div>

      {/* Título e instrução da seção de dados. */}
      <div style={{ ...pct(4.1, 50.45, 51, 3.3), boxSizing: "border-box", padding: ".2cqw .5cqw", background: "rgba(5,20,34,.98)", color: "#65e6ef", fontSize: "2.1cqw", fontWeight: 900, letterSpacing: ".1em", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "flex", alignItems: "center" }}>{copy.reservationData}</div>
      <div style={{ ...pct(76.2, 50.45, 20, 3.7), boxSizing: "border-box", padding: ".25cqw .3cqw", background: "rgba(5,20,34,.98)", color: "#e4edf2", fontSize: "1.5cqw", lineHeight: 1.3, textAlign: "right", display: "flex", alignItems: "center", justifyContent: "flex-end" }}>{copy.showToTeam}</div>

      {field(4.5, 55.15, copy.passenger, voucher.passenger_name)}
      {field(51.2, 55.15, copy.date, dateText(item.date, lang))}
      {field(4.5, 63.25, copy.time, item.schedule)}
      {field(51.2, 63.25, copy.people, `${voucher.total_people} ${copy.peopleUnit}`)}

      {/* Notas traduzidas substituem o texto português achatado; para Arraial/Cabo Frio a nota de contato é explícita. */}
      <div style={{ ...pct(4.2, 70.45, 91.5, notes ? 5.7 : 4.0), boxSizing: "border-box", padding: ".35cqw .5cqw", background: "rgba(5,20,34,.98)", color: "#dceaf1", fontSize: "1.35cqw", lineHeight: 1.45, overflow: "hidden" }}>
        <div>* {copy.weather}</div>
        {notes && <div>* {notes}</div>}
        <div>** {copy.validity}</div>
      </div>

      {/* Consulta oficial. O QR, o domínio e a identidade visual originais são mantidos. */}
      <div style={{ ...pct(22.9, 77.15, 71.7, 11.65), background: "rgba(5,22,36,.96)", display: "flex", flexDirection: "column", justifyContent: "center", gap: ".55cqw", paddingLeft: "1.3cqw", overflow: "hidden" }}>
        <div style={{ color: "#65e6ef", fontSize: "1.58cqw", fontWeight: 900, letterSpacing: ".1em", lineHeight: 1.2 }}>{copy.officialLookup}</div>
        <div style={{ color: "#f7fbff", fontSize: "2.25cqw", fontWeight: 800, lineHeight: 1.1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{copy.tourDetails}</div>
        <div style={{ color: "#d7e5eb", fontSize: "1.43cqw", lineHeight: 1.25 }}>{copy.scan}</div>
        <div style={{ color: "#7ce6ed", fontSize: "1.43cqw", fontWeight: 700, lineHeight: 1.2 }}>onixturismobuzios.com.br</div>
        <div style={{ color: "#dceef2", fontSize: "1.27cqw", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>✓ {copy.officialService} · ✓ {copy.fastSecure} · ✓ {copy.supportHours}</div>
      </div>

      {/* O número de WhatsApp da arte oficial não é alterado; somente os rótulos recebem tradução. */}
      <div style={{ ...pct(13.8, 91.95, 69.2, 2.0), boxSizing: "border-box", padding: ".15cqw .35cqw", background: "rgba(5,20,34,.98)", color: "#f3fbff", fontSize: "1.62cqw", fontWeight: 800, letterSpacing: ".06em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{copy.whatsapp}</div>
      <div style={{ ...pct(84.2, 93.25, 10.6, 1.4), boxSizing: "border-box", padding: ".1cqw", background: "rgba(5,20,34,.98)", color: "#c6dce5", fontSize: "1.15cqw", fontWeight: 700, textAlign: "center", letterSpacing: ".1em" }}>{copy.contact}</div>
    </div>
  );
});

VoucherCard.displayName = "VoucherCard";
