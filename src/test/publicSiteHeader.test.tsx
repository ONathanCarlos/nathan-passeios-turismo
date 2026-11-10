import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it } from "vitest";
import { PublicSiteHeader } from "@/components/PublicSiteHeader";

describe("cabeçalho público", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/");
  });

  it("leva às páginas de passeios, pacotes e Sobre Nós", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <PublicSiteHeader lang="pt" onLangChange={() => {}} />
      </MemoryRouter>,
    );

    const tours = screen.getAllByRole("link", { name: "Nossos passeios" });
    const packages = screen.getAllByRole("link", { name: "Pacotes" });
    const about = screen.getAllByRole("link", { name: "Sobre Nós" });

    expect(tours.some((link) => link.getAttribute("href") === "/passeios")).toBe(true);
    expect(packages.some((link) => link.getAttribute("href") === "/pacotes")).toBe(true);
    expect(about.some((link) => link.getAttribute("href") === "/sobre-nos")).toBe(true);

    const contactLinks = screen.getAllByRole("link", { name: /Fale pelo WhatsApp/ });
    expect(contactLinks.some((link) => link.getAttribute("href")?.startsWith("https://wa.me/5522998216796?text="))).toBe(true);
  });

  it("marca passeios como seção ativa em uma página de detalhe e alterna o menu mobile", () => {
    render(
      <MemoryRouter initialEntries={["/passeios/escuna"]}>
        <PublicSiteHeader lang="pt" onLangChange={() => {}} />
      </MemoryRouter>,
    );

    const tourLinks = screen.getAllByRole("link", { name: "Nossos passeios" });
    expect(tourLinks.some((link) => link.getAttribute("aria-current") === "page")).toBe(true);

    const menuButton = screen.getByRole("button", { name: "Abrir menu" });
    const menu = document.getElementById("public-site-menu");
    expect(menu).not.toBeNull();
    expect(menu?.hidden).toBe(true);

    fireEvent.click(menuButton);
    expect(screen.getByRole("button", { name: "Fechar menu" })).toHaveAttribute("aria-expanded", "true");
    expect(menu?.hidden).toBe(false);
    expect(within(menu as HTMLElement).getByRole("link", { name: "Sobre Nós" })).toHaveAttribute("href", "/sobre-nos");
  });
});
