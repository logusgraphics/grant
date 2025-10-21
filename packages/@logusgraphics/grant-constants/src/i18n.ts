/**
 * Internationalization (i18n) Constants
 *
 * Single source of truth for supported locales and default locale
 * across the entire Grant platform (API, web, and other apps).
 */

/**
 * Supported locales for the Grant platform
 */
export const SUPPORTED_LOCALES = ['en', 'de'] as const;

/**
 * Default locale
 */
export const DEFAULT_LOCALE = 'en' as const;

/**
 * Type for supported locales
 */
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Type guard to check if a string is a supported locale
 */
export function isSupportedLocale(locale: string): locale is SupportedLocale {
  return SUPPORTED_LOCALES.includes(locale as SupportedLocale);
}
