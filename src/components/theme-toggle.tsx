"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useT } from "@/lib/i18n";

/**
 * Theme switcher offering Light / Dark / System.
 *
 * Three options rather than a two-way flip because docs/product/settings.md
 * specifies exactly those three. Note that settings.md scopes the *saved*
 * preference to a signed-in user — that belongs to the settings story. This
 * control is the UI-level theme only (next-themes, localStorage), which is what
 * the public screens can offer before anyone has an account.
 */
export function ThemeToggle() {
  const t = useT();
  const { setTheme } = useTheme();

  const options = [
    { value: "light", label: t.theme.light, icon: Sun },
    { value: "dark", label: t.theme.dark, icon: Moon },
    { value: "system", label: t.theme.system, icon: Monitor },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="relative rounded-full">
            {/* Both icons render; CSS swaps them, so there is no wrong icon
                during hydration before the resolved theme is known. */}
            <Sun className="size-4 scale-100 rotate-0 transition-transform dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute size-4 scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0" />
            <span className="sr-only">{t.theme.label}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {options.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem key={value} onClick={() => setTheme(value)}>
            <Icon className="size-4" />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
