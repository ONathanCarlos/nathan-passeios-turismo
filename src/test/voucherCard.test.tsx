import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VoucherCard } from "@/components/vouchers/VoucherCard";
import { VOUCHER_TEMPLATES, type VoucherTourKey } from "@/lib/vouchers";
import type { IssuedVoucherItem, PublicVoucher } from "@/lib/db";

const voucher: PublicVoucher = {
  reservation_code: "ONX-2026-001284",
  language: "pt",
  passenger_name: "Ana Maria da Silva",
  travel_date: "2026-11-12",
  total_people: 4,
  items: [],
};

const keys = Object.keys(VOUCHER_TEMPLATES) as VoucherTourKey[];

describe("official voucher artwork rendering", () => {
  it.each(keys)("renders the official template and variable data for %s", (key) => {
    const template = VOUCHER_TEMPLATES[key];
    if (!template) throw new Error(`missing template for ${key}`);
    const item: IssuedVoucherItem = {
      order: 1,
      tour_key: key,
      code: `${key.toUpperCase()}-2026-001284-01`,
      name: "Nome do passeio",
      date: "2026-11-12",
      schedule: key === "escuna" ? "11:00h" : "A confirmar",
      template_key: key,
    };
    const { container, getByText } = render(
      <VoucherCard voucher={voucher} item={item} lang="pt" />,
    );

    expect(container.querySelector("img")?.getAttribute("src")).toBe(template.src);
    expect(getByText("Ana Maria da Silva")).toBeInTheDocument();
    expect(container.textContent).toContain(item.code);
    expect(getByText("12 de novembro de 2026")).toBeInTheDocument();
    expect(container.textContent).toContain("4 pessoas");
  });

  it("localizes the artwork text across all five site languages", () => {
    const item: IssuedVoucherItem = {
      order: 1,
      tour_key: "escuna",
      code: "ESCUNA-2026-001284-01",
      name: "Paseo en goleta",
      date: "2026-11-12",
      schedule: "11:00h",
      template_key: "escuna",
    };
    for (const lang of ["pt", "es", "en", "fr", "it"] as const) {
      const { container, unmount } = render(<VoucherCard voucher={voucher} item={item} lang={lang} />);
      expect(container.textContent).toContain(VOUCHER_TEMPLATES.escuna?.title[lang]);
      unmount();
    }
  });

  it("uses the Quadriciclo artwork when the CMS tour key uses hyphens", () => {
    const item: IssuedVoucherItem = {
      order: 1,
      tour_key: "quadriciclo-nas-dunas",
      code: "QUADRICICLO-2026-001284-01",
      name: "Quadriciclo nas Dunas",
      date: "2026-11-12",
      schedule: "A confirmar",
      template_key: "quadriciclo_nas_dunas",
    };
    const { container } = render(<VoucherCard voucher={voucher} item={item} lang="pt" />);
    expect(container.querySelector("img")?.getAttribute("src")).toBe("/vouchers/voucher-quadriciclo-nas-dunas.png");
  });
});
