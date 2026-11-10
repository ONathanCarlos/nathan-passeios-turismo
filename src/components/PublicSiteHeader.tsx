import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "@/assets/onyx-turismo-buzios-logo.jpg.asset.json";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getCachedConfig } from "@/lib/cmsCache";
import { bookingWhatsApp } from "@/lib/brand";
import type { Lang } from "@/lib/i18n";

interface Props {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
}

const COPY: Record<Lang, {
  tours: string;
  packages: string;
  about: string;
  contact: string;
  navLabel: string;
  menu: string;
  closeMenu: string;
  home: string;
  message: string;
}> = {
  pt: {
    tours: "Nossos passeios", packages: "Pacotes", about: "Sobre Nós (Sobre a Ônix)",
    contact: "Fale pelo WhatsApp", navLabel: "Navegação principal", menu: "Abrir menu", closeMenu: "Fechar menu",
    home: "Página inicial Ônix Turismo Búzios", message: "Olá! Vim pelo site e gostaria de informações sobre os passeios.",
  },
  es: {
    tours: "Nuestros paseos", packages: "Paquetes", about: "Sobre nosotros (Sobre Ônix)",
    contact: "Habla por WhatsApp", navLabel: "Navegación principal", menu: "Abrir menú", closeMenu: "Cerrar menú",
    home: "Inicio Ônix Turismo Búzios", message: "¡Hola! Vine por el sitio y me gustaría informaciones sobre los paseos.",
  },
  en: {
    tours: "Our tours", packages: "Packages", about: "About us (About Ônix)",
    contact: "Chat on WhatsApp", navLabel: "Main navigation", menu: "Open menu", closeMenu: "Close menu",
    home: "Ônix Turismo Búzios home", message: "Hello! I came from the website and I'd like information about the tours.",
  },
  fr: {
    tours: "Nos excursions", packages: "Forfaits", about: "À propos de nous (Ônix)",
    contact: "Contacter sur WhatsApp", navLabel: "Navigation principale", menu: "Ouvrir le menu", closeMenu: "Fermer le menu",
    home: "Accueil Ônix Turismo Búzios", message: "Bonjour ! Je viens du site et j'aimerais des informations sur les excursions.",
  },
  it: {
    tours: "I nostri tour", packages: "Pacchetti", about: "Chi siamo (Ônix)",
    contact: "Contatta su WhatsApp", navLabel: "Navigazione principale", menu: "Apri il menu", closeMenu: "Chiudi il menu",
    home: "Home Ônix Turismo Búzios", message: "Ciao! Vengo dal sito e vorrei informazioni sulle escursioni.",
  },
};

const WHATSAPP_ICON_PATH = "M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.745.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.79 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.15-.515 2.478-1.318.13-.302.13-.561.13-.762 0-.53-.057-.72-.486-.93-.428-.215-1.43-.701-1.96-.701zM16.066 6.733c-5.244 0-9.553 4.31-9.553 9.554 0 1.79.5 3.532 1.46 5.05L6 26.067l4.818-1.502a9.482 9.482 0 0 0 5.266 1.59h.014c5.252 0 9.561-4.309 9.561-9.553 0-2.55-1.075-4.945-2.864-6.756a9.49 9.49 0 0 0-6.729-2.713zm0 17.486h-.013a7.93 7.93 0 0 1-4.046-1.103l-.288-.172-3.022.945.96-2.937-.187-.302a7.929 7.929 0 0 1-1.218-4.252c0-4.382 3.561-7.943 7.943-7.943a7.886 7.886 0 0 1 5.61 2.32 7.881 7.881 0 0 1 2.327 5.616 7.972 7.972 0 0 1-7.957 7.928z";

export const PublicSiteHeader = ({ lang, onLangChange }: Props) => {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const text = COPY[lang];
  const whatsapp = bookingWhatsApp(getCachedConfig("whatsapp"));
  const whatsappHref = `https://wa.me/${whatsapp}?text=${encodeURIComponent(text.message)}`;
  const navItems = [
    { to: "/passeios", label: text.tours },
    { to: "/pacotes", label: text.packages },
    { to: "/sobre-nos", label: text.about },
  ];

  useEffect(() => setMenuOpen(false), [pathname]);

  const linkClass = (active: boolean) =>
    `rounded-md px-2 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise ${
      active ? "text-turquoise-glow" : "text-slate-200 hover:text-turquoise-glow"
    }`;

  const whatsappLink = (mobile = false) => (
    <a
      href={whatsappHref}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-500/10 px-3.5 py-2 text-sm font-semibold text-emerald-100 transition-colors hover:border-emerald-300/60 hover:bg-emerald-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 ${mobile ? "w-full" : "whitespace-nowrap"}`}
    >
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#25D366] text-white" aria-hidden="true">
        <svg viewBox="0 0 32 32" className="h-4 w-4 fill-current"><path d={WHATSAPP_ICON_PATH} /></svg>
      </span>
      {text.contact}
    </a>
  );

  return (
    <header className="relative z-40 border-b border-white/10 bg-[#061521]/90 text-foreground shadow-[0_8px_30px_rgba(0,0,0,.12)] backdrop-blur-xl">
      <div className="mx-auto flex min-h-[76px] max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
        <Link to="/" aria-label={text.home} className="flex min-w-0 items-center gap-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise">
          <span className="h-10 w-10 shrink-0 overflow-hidden rounded-full border border-turquoise/45 bg-[#071b2a] shadow-[0_0_14px_hsl(var(--turquoise)/.26)] sm:h-11 sm:w-11">
            <img src={logo.url} alt="" className="h-full w-full object-contain" />
          </span>
          <span className="truncate text-sm font-bold tracking-wide text-slate-100 sm:text-base">Ônix Turismo Búzios</span>
        </Link>

        <nav aria-label={text.navLabel} className="hidden items-center gap-5 lg:flex xl:gap-7">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => linkClass(isActive)}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden lg:block">{whatsappLink()}</div>
          <LanguageSwitcher lang={lang} onChange={onLangChange} compact />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-slate-100 hover:border-turquoise/40 hover:bg-turquoise/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turquoise lg:hidden"
            aria-label={menuOpen ? text.closeMenu : text.menu}
            aria-expanded={menuOpen}
            aria-controls="public-site-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div id="public-site-menu" hidden={!menuOpen} className="border-t border-white/10 bg-[#061521]/98 px-4 py-4 lg:hidden">
        <nav aria-label={text.navLabel} className="mx-auto flex max-w-[1440px] flex-col gap-1 sm:px-2">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => linkClass(isActive)}>
              {item.label}
            </NavLink>
          ))}
          <div className="pt-2">{whatsappLink(true)}</div>
        </nav>
      </div>
    </header>
  );
};
