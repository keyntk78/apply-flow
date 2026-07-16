import { beforeEach, describe, expect, it } from "vitest";

import { createLocaleStore } from "@/lib/i18n/locale-store";

describe("locale store", () => {
  beforeEach(() => {
    // Expire anything a previous test wrote.
    document.cookie = "apply-flow-locale=; path=/; max-age=0";
  });

  it("starts from the locale the server resolved", () => {
    expect(createLocaleStore("en").getState().locale).toBe("en");
    expect(createLocaleStore("vi").getState().locale).toBe("vi");
  });

  it("switches language and writes the cookie the server reads back", () => {
    const store = createLocaleStore("vi");

    store.getState().setLocale("en");

    expect(store.getState().locale).toBe("en");
    expect(document.cookie).toContain("apply-flow-locale=en");
  });

  it("keeps stores independent so one request cannot leak into another", () => {
    // The reason createLocaleStore is a factory rather than a module singleton.
    const first = createLocaleStore("vi");
    const second = createLocaleStore("en");

    first.getState().setLocale("en");

    expect(first.getState().locale).toBe("en");
    expect(second.getState().locale).toBe("en");

    const third = createLocaleStore("vi");
    expect(third.getState().locale).toBe("vi");
  });
});
