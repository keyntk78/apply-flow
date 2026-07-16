import { describe, expect, it } from "vitest";

import { dictionaries } from "@/lib/i18n";

/** Every leaf path in a nested object, e.g. "hero.title", "features.items[0].body". */
function leafPaths(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => leafPaths(item, `${prefix}[${index}]`));
  }

  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) =>
      leafPaths(child, prefix ? `${prefix}.${key}` : key),
    );
  }

  return [prefix];
}

function leafEntries(value: unknown, prefix = ""): [string, unknown][] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => leafEntries(item, `${prefix}[${index}]`));
  }

  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, child]) =>
      leafEntries(child, prefix ? `${prefix}.${key}` : key),
    );
  }

  return [[prefix, value]];
}

describe("dictionaries", () => {
  it("VI and EN cover exactly the same keys", () => {
    const vi = leafPaths(dictionaries.vi).sort();
    const en = leafPaths(dictionaries.en).sort();

    // Names the actual gap rather than just failing on length.
    expect(en.filter((key) => !vi.includes(key))).toEqual([]);
    expect(vi.filter((key) => !en.includes(key))).toEqual([]);
    expect(en).toEqual(vi);
  });

  it("has no empty copy in either language", () => {
    for (const locale of ["vi", "en"] as const) {
      for (const [path, value] of leafEntries(dictionaries[locale])) {
        expect(typeof value, `${locale}.${path} should be a string`).toBe("string");
        expect((value as string).trim(), `${locale}.${path} is empty`).not.toBe("");
      }
    }
  });

  it("actually translates the user-facing copy instead of reusing VI strings", () => {
    // Guards the copy/paste failure where `en` is duplicated from `vi` and the
    // key-parity test above still passes.
    const viTitle = dictionaries.vi.hero.title;
    const enTitle = dictionaries.en.hero.title;

    expect(enTitle).not.toBe(viTitle);
    expect(dictionaries.en.status.applied).not.toBe(dictionaries.vi.status.applied);
  });
});
