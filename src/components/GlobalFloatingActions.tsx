import { useEffect, useState } from "react";
import { AdminFab } from "@/components/AdminPanel";
import { WhatsAppFab } from "@/components/WhatsAppFab";
import { isVerifiedAdmin, subscribeAdmin } from "@/lib/adminAuth";
import { loadLang, type Lang } from "@/lib/i18n";

export const GlobalFloatingActions = () => {
  const [admin, setAdmin] = useState(isVerifiedAdmin());
  const [lang, setLang] = useState<Lang>(() => loadLang());

  useEffect(() => {
    const unsubscribeAdmin = subscribeAdmin(() => setAdmin(isVerifiedAdmin()));
    const onLangChange = () => setLang(loadLang());
    window.addEventListener("nathan:lang-change", onLangChange);

    return () => {
      unsubscribeAdmin();
      window.removeEventListener("nathan:lang-change", onLangChange);
    };
  }, []);

  return admin ? <AdminFab /> : <WhatsAppFab lang={lang} />;
};
