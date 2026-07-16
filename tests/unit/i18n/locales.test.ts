import { describe, expect, it } from "vitest";

import { DEFAULT_LOCALE, isLocale, parseLocale } from "@/lib/i18n";

describe("parseLocale", () => {
  it("accepts the supported languages", () => {
    expect(parseLocale("vi")).toBe("vi");
    expect(parseLocale("en")).toBe("en");
  });

  it("defaults to Vietnamese", () => {
    // docs/product/settings.md leaves the initial default to the implementing
    // story; US-001 chose VI. If that ever changes, this test should change too.
    expect(DEFAULT_LOCALE).toBe("vi");
    expect(parseLocale(undefined)).toBe("vi");
  });

  it("falls back instead of trusting a cookie value", () => {
    // The cookie is attacker-controllable, so this is a boundary parse
    // (docs/ARCHITECTURE.md) — never let an unknown value reach the app.
    for (const hostile of [
      "fr",
      "",
      "VI",
      "vi-VN",
      "../../etc/passwd",
      "<script>alert(1)</script>",
      null,
      42,
      {},
      ["vi"],
    ]) {
      expect(parseLocale(hostile)).toBe(DEFAULT_LOCALE);
    }
  });
});

describe("isLocale", () => {
  it("narrows only exact matches", () => {
    expect(isLocale("vi")).toBe(true);
    expect(isLocale("en")).toBe(true);
    expect(isLocale("EN")).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });
});
