import { useEffect, useState } from "react";
import { AdminFab } from "@/components/AdminPanel";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { isVerifiedAdmin, subscribeAdmin } from "@/lib/adminAuth";
import { loadLang, type Lang } from "@/lib/i18n";

export const GlobalFloatingActions = () => {
  const [admin, setAdmin] = useState(isVerifiedAdmin());
  const [lang, setLang] = useState<Lang>(() => loadLang());
  const [hideWhatsApp, setHideWhatsApp] = useState(false);

  useEffect(() => {
    const unsubscribeAdmin = subscribeAdmin(() => setAdmin(isVerifiedAdmin()));
    const onLangChange = () => setLang(loadLang());
    const onBookingOutput = (event: Event) => {
      setHideWhatsApp((event as CustomEvent<{ hidden?: boolean }>).detail?.hidden === true);
    };
    window.addEventListener("nathan:lang-change", onLangChange);
    window.addEventListener("nathan:booking-output", onBookingOutput);

    return () => {
      unsubscribeAdmin();
      window.removeEventListener("nathan:lang-change", onLangChange);
      window.removeEventListener("nathan:booking-output", onBookingOutput);
    };
  }, []);

  return admin ? <AdminFab /> : hideWhatsApp ? null : <WhatsAppFab lang={lang} />;
};
