import { useId, type ChangeEvent } from "react";
import type { Lang } from "@/lib/i18n";
import { BOOKING_TERMS_PATH, BOOKING_TERMS_VERSION } from "@/lib/bookingTerms";

export interface BookingTermsConsentProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: boolean;
  lang: Lang;
  disabled?: boolean;
}

const PORTUGUESE_TEXT_NOTE: Record<Lang, string> = {
  pt: "Texto dos termos em português.",
  es: "El texto de los términos está en portugués.",
  en: "The terms text is in Portuguese.",
  fr: "Le texte des conditions est en portugais.",
  it: "Il testo dei termini è in portoghese.",
};

const CONSENT_TEXT =
  "Declaro que li e concordo com os Termos de Uso, a Política de Cancelamento e as condições de Reembolso da Ônix Turismo Búzios.";

const ERROR_TEXT: Record<Lang, string> = {
  pt: "Marque esta opção para confirmar que você leu e concorda com os termos.",
  es: "Marca esta opción para confirmar que leíste y aceptas los términos.",
  en: "Check this option to confirm that you have read and agree to the terms.",
  fr: "Cochez cette option pour confirmer que vous avez lu et accepté les conditions.",
  it: "Seleziona questa opzione per confermare di aver letto e accettato i termini.",
};

export const BookingTermsConsent = ({
  checked,
  onChange,
  error = false,
  lang,
  disabled = false,
}: BookingTermsConsentProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => onChange(event.target.checked);
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const termsHref = `${BOOKING_TERMS_PATH}?version=${encodeURIComponent(BOOKING_TERMS_VERSION)}`;

  return (
    <fieldset
      className={`rounded-2xl border border-turquoise/25 bg-night/70 p-4 backdrop-blur-sm ${
        error ? "field-error" : ""
      } ${disabled ? "opacity-70" : ""}`}
    >
      <legend className="sr-only">Aceite dos termos da reserva</legend>
      <div className="flex items-start gap-3">
        <input
          id={inputId}
          type="checkbox"
          checked={checked}
          onChange={handleChange}
          disabled={disabled}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? errorId : undefined}
          className="mt-1 h-5 w-5 shrink-0 cursor-pointer accent-[hsl(var(--turquoise))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise focus-visible:ring-offset-2 focus-visible:ring-offset-night disabled:cursor-not-allowed"
        />
        <label
          htmlFor={inputId}
          className="cursor-pointer text-sm leading-relaxed text-foreground/90 peer-disabled:cursor-not-allowed"
        >
          {CONSENT_TEXT.split("Termos de Uso")[0]}
          <a
            href={termsHref}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-turquoise underline decoration-turquoise/60 underline-offset-2 hover:text-turquoise-glow"
          >
            Termos de Uso{CONSENT_TEXT.split("Termos de Uso")[1]}
          </a>
        </label>
      </div>
      {lang !== "pt" && (
        <p className="mt-3 pl-8 text-xs font-medium text-turquoise-glow/90" role="note">
          {PORTUGUESE_TEXT_NOTE[lang]}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-3 pl-8 text-sm font-semibold text-rose-200">
          {ERROR_TEXT[lang]}
        </p>
      )}
    </fieldset>
  );
};
