import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { getMergedMessages } from '@grantjs/i18n/loader';

import { mergeLocaleMessages } from './merge-locale-messages';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const sharedMessages = getMergedMessages(locale) as Record<string, unknown>;
  // Explicit imports per locale so the full web locale JSON is always resolved (see locale layout).
  const webOnlyModule =
    locale === 'de'
      ? await import('@/i18n/locales/de.json')
      : await import('@/i18n/locales/en.json');
  const webOnly = webOnlyModule.default as Record<string, unknown>;
  const messages = mergeLocaleMessages(sharedMessages, webOnly);

  return {
    locale,
    messages,
  };
});
