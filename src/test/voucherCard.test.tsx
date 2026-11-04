import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VoucherCard } from "@/components/vouchers/VoucherCard";
import { VOUCHER_COPY, VOUCHER_TEMPLATES, type VoucherTourKey } from "@/lib/vouchers";
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

const makeItem = (key: VoucherTourKey): IssuedVoucherItem => ({
  order: 1,
  tour_key: key,
  code: `${key.toUpperCase()}-2026-001284-01`,
  name: "Nome do passeio",
  date: "2026-11-12",
  schedule: key === "escuna" ? "11:00h" : "A confirmar",
  template_key: key,
});

describe("official voucher artwork rendering", () => {
  it.each(keys)("fills only the blank data lines on the original %s artwork", (key) => {
    const template = VOUCHER_TEMPLATES[key];
    if (!template) throw new Error(`missing template for ${key}`);

    const { container, getByText } = render(
      <VoucherCard voucher={voucher} item={makeItem(key)} lang="pt" />,
    );
    const image = container.querySelector("img");
    const values = Array.from(container.querySelectorAll<HTMLElement>("[data-voucher-value]"));

    expect(image?.getAttribute("src")).toBe(template.src);
    expect(image?.style.objectFit).toBe("contain");
    expect(getByText("Ana Maria da Silva")).toBeInTheDocument();
    expect(getByText("12 de novembro de 2026")).toBeInTheDocument();
    expect(getByText(key === "escuna" ? "11:00h" : "A confirmar")).toBeInTheDocument();
    expect(getByText("4 pessoas")).toBeInTheDocument();
    expect(values.map((value) => value.dataset.voucherValue)).toEqual([
      "passenger",
      "date",
      "schedule",
      "people",
    ]);
    expect(values.map((value) => value.style.left)).toEqual(["6.05%", "52.8%", "6.05%", "52.8%"]);
    expect(values.map((value) => value.style.top)).toEqual(["58.1%", "58.1%", "66.2%", "66.2%"]);
    expect(values.map((value) => value.style.width)).toEqual(["42%", "42%", "42%", "42%"]);

    for (const value of values) {
      expect(value.style.position).toBe("absolute");
      expect(value.style.backgroundColor).toBe("transparent");
      expect(value.style.border).toBe("");
      expect(value.style.boxShadow).toBe("none");
      expect(value.style.textShadow).toBe("none");
    }
    expect(container.querySelectorAll("div")).toHaveLength(1);
    expect(container.textContent).not.toContain(voucher.reservation_code);
    expect(container.textContent).not.toContain(makeItem(key).code);
  });

  it("keeps all printed artwork text untouched while localizing only variable values", () => {
    const item = makeItem("escuna");
    for (const lang of ["pt", "es", "en", "fr", "it"] as const) {
      const { container, unmount } = render(<VoucherCard voucher={voucher} item={item} lang={lang} />);
      const peopleValue = container.querySelector<HTMLElement>('[data-voucher-value="people"]');
      const dateValue = container.querySelector<HTMLElement>('[data-voucher-value="date"]');

      expect(peopleValue?.textContent).toBe(`4 ${VOUCHER_COPY[lang].peopleUnit}`);
      expect(dateValue?.textContent).toBeTruthy();
      expect(container.textContent).not.toContain(VOUCHER_TEMPLATES.escuna?.title[lang]);
      expect(container.textContent).not.toContain("ONX-2026-001284");
      unmount();
    }
  });

  it("uses the Quadriciclo artwork when the CMS tour key uses hyphens", () => {
    const item: IssuedVoucherItem = {
      ...makeItem("quadriciclo_nas_dunas"),
      tour_key: "quadriciclo-nas-dunas",
      template_key: "quadriciclo_nas_dunas",
    };
    const { container } = render(<VoucherCard voucher={voucher} item={item} lang="pt" />);
    expect(container.querySelector("img")?.getAttribute("src")).toBe("/vouchers/voucher-quadriciclo-nas-dunas.png");
  });
});
