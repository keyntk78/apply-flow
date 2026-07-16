import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AuthShell } from "@/features/auth";
import { LocaleProvider, dictionaries } from "@/lib/i18n";

function renderShell(variant: "sign-in" | "sign-up") {
  return render(
    <LocaleProvider initialLocale="vi">
      <AuthShell variant={variant} />
    </LocaleProvider>,
  );
}

describe("AuthShell", () => {
  it("shows the sign-in heading and a link to register", () => {
    renderShell("sign-in");

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      dictionaries.vi.auth.signIn.title,
    );
    expect(screen.getByRole("link", { name: dictionaries.vi.auth.signIn.switchCta })).toHaveAttribute(
      "href",
      "/sign-up",
    );
  });

  it("shows the sign-up heading and a link back to login", () => {
    renderShell("sign-up");

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      dictionaries.vi.auth.signUp.title,
    );
    expect(screen.getByRole("link", { name: dictionaries.vi.auth.signUp.switchCta })).toHaveAttribute(
      "href",
      "/sign-in",
    );
  });

  it.each(["sign-in", "sign-up"] as const)(
    "collects no credentials on /%s",
    (variant) => {
      // Guards docs/decisions/0008-clerk-authentication.md: Clerk owns every
      // credential. If someone adds a password box to this shell, this fails.
      const { container } = renderShell(variant);

      expect(container.querySelector("form")).toBeNull();
      expect(container.querySelector("input")).toBeNull();
      expect(container.querySelector('[type="password"]')).toBeNull();
    },
  );

  it("says plainly that the form is not wired up yet", () => {
    renderShell("sign-in");

    expect(screen.getByText(dictionaries.vi.auth.placeholder.body)).toBeInTheDocument();
  });

  it("renders a caller-provided form into the slot", () => {
    // The seam US-000 uses to mount Clerk's <SignIn/> without touching the shell.
    render(
      <LocaleProvider initialLocale="vi">
        <AuthShell variant="sign-in">
          <div data-testid="clerk-form">clerk</div>
        </AuthShell>
      </LocaleProvider>,
    );

    expect(screen.getByTestId("clerk-form")).toBeInTheDocument();
    expect(
      screen.queryByText(dictionaries.vi.auth.placeholder.body),
    ).not.toBeInTheDocument();
  });
});
