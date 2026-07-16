// Shared i18n. Used by marketing, auth and (later) settings — lifted to shared
// rather than owned by one feature, per src/features/README.md.
export { dictionaries, type Dictionary } from "./dictionaries";
export { LocaleProvider, useLocale, useSetLocale, useT } from "./locale-provider";
export {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALES,
  isLocale,
  parseLocale,
  type Locale,
} from "./locales";
