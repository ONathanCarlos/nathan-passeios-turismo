import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { detectDeviceLang, loadLang, saveLang } from "@/lib/i18n";

const setDeviceLanguages = (languages: string[], language: string) => {
  vi.stubGlobal("navigator", { languages, language });
};

const setUrl = (url: string) => window.history.replaceState({}, "", url);

describe("automatic device language", () => {
  beforeEach(() => {
    localStorage.clear();
    setUrl("/");
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
    setUrl("/");
  });

  it("uses the first supported browser preference, including regional Spanish", () => {
    setDeviceLanguages(["de-DE", "es-AR", "pt-BR"], "de-DE");

    expect(detectDeviceLang()).toBe("es");
    expect(loadLang()).toBe("es");
    expect(localStorage.getItem("nathan_lang_v1")).toBeNull();
  });

  it("respects a language explicitly selected by the customer over the device language", () => {
    setDeviceLanguages(["es-MX"], "es-MX");
    saveLang("fr");

    expect(loadLang()).toBe("fr");
  });

  it("lets an explicit ?lang= parameter override the saved preference and accepts regional codes", () => {
    setDeviceLanguages(["pt-BR"], "pt-BR");
    localStorage.setItem("nathan_lang_v1", "es");
    setUrl("/?lang=it-IT");

    expect(loadLang()).toBe("it");
    expect(localStorage.getItem("nathan_lang_v1")).toBe("it");
  });

  it("uses the browser language when languages list has no supported locale", () => {
    setDeviceLanguages(["de-DE"], "fr-CA");

    expect(loadLang()).toBe("fr");
  });

  it("falls back to Portuguese when the browser language is unsupported", () => {
    setDeviceLanguages(["de-DE", "ja-JP"], "de-DE");

    expect(detectDeviceLang()).toBeNull();
    expect(loadLang()).toBe("pt");
  });
});
