import { describe, expect, it } from "vitest";
import { isDisplayableReview } from "@/lib/publicReviews";

describe("visibilidade pública da avaliação do passeio", () => {
  it.each([4, 4.5, 5])("exibe notas a partir de quatro estrelas (%s)", (nota) => {
    expect(isDisplayableReview({ nota })).toBe(true);
  });

  it.each([0, 1, 3.5, 3.99, Number.NaN, Number.POSITIVE_INFINITY])("oculta notas abaixo de quatro ou inválidas (%s)", (nota) => {
    expect(isDisplayableReview({ nota })).toBe(false);
  });
});
