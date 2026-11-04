import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  VOUCHER_COPY,
  VOUCHER_TEMPLATES,
  randomVoucherSecret,
  voucherSchedule,
  voucherScheduleNote,
  voucherUrl,
} from "@/lib/vouchers";

describe("digital voucher contracts", () => {
  it("maps the seven official PNGs without replacing their source files", () => {
    const expected = {
      arraial: "voucher-arraial-do-cabo.png",
      buggy: "voucher-buggy.png",
      cabofrio: "voucher-cabo-frio.png",
      catamara: "voucher-catamara.png",
      escuna: "voucher-escuna.png",
      mergulho: "voucher-mergulho.png",
      quadriciclo_nas_dunas: "voucher-quadriciclo-nas-dunas.png",
    };

    expect(Object.keys(VOUCHER_TEMPLATES).sort()).toEqual(Object.keys(expected).sort());
    for (const [key, filename] of Object.entries(expected)) {
      const template = VOUCHER_TEMPLATES[key as keyof typeof VOUCHER_TEMPLATES];
      expect(template?.src).toBe(`/vouchers/${filename}`);
      expect(existsSync(resolve(process.cwd(), "public", template!.src.slice(1)))).toBe(true);
      expect(Object.keys(template!.title).sort()).toEqual(["en", "es", "fr", "it", "pt"]);
    }
  });

  it("uses text-only vouchers instead of borrowing another tour's official artwork", () => {
    expect(VOUCHER_TEMPLATES.jardineira).toBeUndefined();
    expect(VOUCHER_TEMPLATES.lancha).toBeUndefined();
    expect(VOUCHER_TEMPLATES.almoco).toBeUndefined();
  });

  it("uses the confirmed times and notes in all supported languages", () => {
    const languages = ["pt", "es", "en", "fr", "it"] as const;
    for (const lang of languages) {
      expect(voucherSchedule("escuna", lang)).toBe("11:00h");
      expect(voucherSchedule("arraial", lang)).toContain("8:30h*");
      expect(voucherSchedule("cabofrio", lang)).toContain("8:30h*");
      expect(voucherSchedule("buggy", lang)).toBe(VOUCHER_COPY[lang].toConfirm);
      expect(voucherSchedule("catamara", lang)).toBe(VOUCHER_COPY[lang].toConfirm);
      expect(voucherSchedule("mergulho", lang)).toBe(VOUCHER_COPY[lang].toConfirm);
      expect(voucherScheduleNote("arraial", lang)).toBe(VOUCHER_COPY[lang].contactFrom);
      expect(voucherScheduleNote("cabofrio", lang)).toBe(VOUCHER_COPY[lang].contactFrom);
      expect(voucherScheduleNote("buggy", lang)).toBe(VOUCHER_COPY[lang].timeFlex);
      expect(voucherScheduleNote("mergulho", lang)).toBe(VOUCHER_COPY[lang].timeFlex);
    }
    expect(voucherSchedule("arraial", "pt")).toBe("A partir das 8:30h*");
  });

  it("creates unpredictable 256-bit access secrets and places them only in the URL fragment", () => {
    const first = randomVoucherSecret();
    const second = randomVoucherSecret();
    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(second).toMatch(/^[a-f0-9]{64}$/);
    expect(first).not.toBe(second);

    const url = voucherUrl(first, "https://onixturismobuzios.com.br");
    expect(url).toBe(`https://onixturismobuzios.com.br/vouchers#token=${first}`);
    expect(new URL(url).search).toBe("");
    expect(new URL(url).hash).toBe(`#token=${first}`);
  });
});
