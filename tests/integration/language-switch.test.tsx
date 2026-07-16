import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { LanguageSwitch } from "@/components/language-switch";
import { AuthShell } from "@/features/auth";
import { LocaleProvider, dictionaries } from "@/lib/i18n";

beforeEach(() => {
  document.cookie = "apply-flow-locale=; path=/; max-age=0";
});

describe("LanguageSwitch", () => {
  it("marks the active language for assistive tech", () => {
    render(
      <LocaleProvider initialLocale="vi">
        <LanguageSwitch />
      </LocaleProvider>,
    );

    expect(screen.getByRole("button", { name: "VI" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "EN" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("retranslates the surrounding UI when the language changes", async () => {
    const user = userEvent.setup();

    // AuthShell renders its own LanguageSwitch, so mounting a second one here
    // would make the "EN" query ambiguous. Drive the real one in place.
    render(
      <LocaleProvider initialLocale="vi">
        <AuthShell variant="sign-in" />
      </LocaleProvider>,
    );

    expect(screen.getByText(dictionaries.vi.auth.signIn.title)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "EN" }));

    expect(screen.getByText(dictionaries.en.auth.signIn.title)).toBeInTheDocument();
    expect(
      screen.queryByText(dictionaries.vi.auth.signIn.title),
    ).not.toBeInTheDocument();
  });

  it("persists the choice to a cookie so the server can render it next time", async () => {
    const user = userEvent.setup();

    render(
      <LocaleProvider initialLocale="vi">
        <LanguageSwitch />
      </LocaleProvider>,
    );

    await user.click(screen.getByRole("button", { name: "EN" }));

    expect(document.cookie).toContain("apply-flow-locale=en");
  });
});
