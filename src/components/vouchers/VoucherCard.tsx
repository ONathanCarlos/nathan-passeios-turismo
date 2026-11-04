import { forwardRef, type CSSProperties } from "react";
import type { Lang } from "@/lib/i18n";
import type { PublicVoucher, IssuedVoucherItem } from "@/lib/db";
import { VOUCHER_COPY, getVoucherTemplate } from "@/lib/vouchers";

interface Props {
  voucher: PublicVoucher;
  item: IssuedVoucherItem;
  lang: Lang;
}

const localeFor: Record<Lang, string> = {
  pt: "pt-BR",
  es: "es-ES",
  en: "en-GB",
  fr: "fr-FR",
  it: "it-IT",
};

const dateText = (value: string, lang: Lang) => {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return value;
  return new Intl.DateTimeFormat(localeFor[lang], {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
};

const valueStyle = (left: number, top: number): CSSProperties => ({
  position: "absolute",
  zIndex: 1,
  left: `${left}%`,
  top: `${top}%`,
  width: "42%",
  margin: 0,
  padding: 0,
  color: "#f0f6fa",
  backgroundColor: "transparent",
  boxShadow: "none",
  fontFamily: "Montserrat, Arial, sans-serif",
  fontSize: "1.67cqw",
  fontWeight: 600,
  lineHeight: 1.15,
  letterSpacing: "-0.014cqw",
  textShadow: "none",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

export const VoucherCard = forwardRef<HTMLDivElement, Props>(({ voucher, item, lang }, ref) => {
  const template = getVoucherTemplate(item.template_key || item.tour_key);
  if (!template || !item.template_key) return null;

  const copy = VOUCHER_COPY[lang];
  const formattedDate = dateText(item.date, lang);
  const people = `${voucher.total_people} ${copy.peopleUnit}`;

  return (
    <div
      ref={ref}
      className="onix-voucher-card"
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "1080 / 1356",
        overflow: "hidden",
        containerType: "inline-size",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
      data-voucher-template={item.tour_key}
    >
      <img
        src={template.src}
        alt=""
        aria-hidden="true"
        crossOrigin="anonymous"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", zIndex: 0 }}
      />

      <span
        className="onix-voucher-value"
        data-voucher-value="passenger"
        aria-label={`${copy.passenger}: ${voucher.passenger_name}`}
        style={valueStyle(6.05, 58.1)}
      >
        {voucher.passenger_name}
      </span>
      <span
        className="onix-voucher-value"
        data-voucher-value="date"
        aria-label={`${copy.date}: ${formattedDate}`}
        style={valueStyle(52.8, 58.1)}
      >
        {formattedDate}
      </span>
      <span
        className="onix-voucher-value"
        data-voucher-value="schedule"
        aria-label={`${copy.time}: ${item.schedule}`}
        style={valueStyle(6.05, 66.2)}
      >
        {item.schedule}
      </span>
      <span
        className="onix-voucher-value"
        data-voucher-value="people"
        aria-label={`${copy.people}: ${people}`}
        style={valueStyle(52.8, 66.2)}
      >
        {people}
      </span>
    </div>
  );
});

VoucherCard.displayName = "VoucherCard";
