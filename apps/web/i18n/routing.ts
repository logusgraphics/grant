import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type SupportedLocale,
} from '@logusgraphics/grant-constants';
import { defineRouting } from 'next-intl/routing';

export const locales = SUPPORTED_LOCALES;
export type Locale = SupportedLocale;
export const defaultLocale = DEFAULT_LOCALE;

export const routing = defineRouting({
  locales,
  defaultLocale,
});
