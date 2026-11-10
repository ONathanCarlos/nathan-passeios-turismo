import { useRef, useState, type ReactNode } from "react";
import type { Lang } from "@/lib/i18n";
import { BookingTermsConsent } from "@/components/BookingTermsConsent";
import { BOOKING_TERMS_VERSION } from "@/lib/bookingTerms";
import { acceptCmsBookingTerms } from "@/lib/db";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function CmsBookingTermsLink({ href, tourKey, lang, children, className, ariaLabel }: {
  href: string; tourKey: string; lang: Lang; children: ReactNode; className?: string; ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef<string | null>(null);
  const continueLabel = {pt:"Continuar no WhatsApp",es:"Continuar en WhatsApp",en:"Continue on WhatsApp",fr:"Continuer sur WhatsApp",it:"Continua su WhatsApp"}[lang];
  const continueToWhatsApp = async () => {
    if (!checked || busy) return;
    setBusy(true); setError("");
    // Abre na ação do cliente para evitar bloqueio de pop-up durante a chamada.
    const target = window.open("about:blank", "_blank");
    if (target) target.opener = null;
    try {
      requestId.current ??= crypto.randomUUID();
      const saved = await acceptCmsBookingTerms({accepted:true,version:BOOKING_TERMS_VERSION,request_id:requestId.current,tour_keys:[tourKey],language:lang});
      if (!saved) throw new Error("terms_not_saved");
      if (target) target.location.replace(href);
      else window.location.assign(href);
      setOpen(false);
    } catch {
      target?.close();
      setError({pt:"Não foi possível registrar o aceite. Tente novamente; nenhum pedido foi enviado.",es:"No se pudo guardar la aceptación. Inténtalo de nuevo; no se envió ninguna solicitud.",en:"We could not record your acceptance. Try again; no request was sent.",fr:"Impossible d’enregistrer votre acceptation. Réessayez ; aucune demande n’a été envoyée.",it:"Impossibile registrare l’accettazione. Riprova; nessuna richiesta è stata inviata."}[lang]);
    } finally { setBusy(false); }
  };
  return <>
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} aria-label={ariaLabel} onClick={e=>{e.preventDefault();requestId.current=null;setChecked(false);setError("");setOpen(true);}}>{children}</a>
    <Dialog open={open} onOpenChange={v=>{if (!busy) setOpen(v);}}>
      <DialogContent className="bg-night border-turquoise/40">
        <DialogTitle>{continueLabel}</DialogTitle>
        <DialogDescription>{ {pt:"Confira as condições antes de iniciar o atendimento.",es:"Consulta las condiciones antes de iniciar la atención.",en:"Review the terms before contacting our team.",fr:"Consultez les conditions avant de contacter notre équipe.",it:"Consulta le condizioni prima di contattare il nostro team."}[lang] }</DialogDescription>
        <BookingTermsConsent checked={checked} onChange={setChecked} lang={lang} disabled={busy} />
        {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
        <Button disabled={!checked || busy} onClick={()=>void continueToWhatsApp()}>{continueLabel}</Button>
      </DialogContent>
    </Dialog>
  </>;
}
