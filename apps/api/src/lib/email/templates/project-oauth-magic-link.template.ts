import { SupportedLocale } from '@grantjs/i18n';

import { defaultLocale } from '@/i18n';

import { createAlternativeLink, createButton, renderBaseEmailTemplate } from './base.mjml';

import type { SendProjectOAuthMagicLinkParams } from '@grantjs/core';

export function getProjectOAuthMagicLinkEmailSubject(
  params: SendProjectOAuthMagicLinkParams,
  _locale: SupportedLocale = defaultLocale
): string {
  const appName = params.appName || 'the app';
  return `Sign in to ${appName}`;
}

export function getProjectOAuthMagicLinkEmailHtml(
  params: SendProjectOAuthMagicLinkParams,
  locale: SupportedLocale = defaultLocale
): string {
  const { magicLinkUrl, appName, locale: paramsLocale } = params;
  const emailLocale = (paramsLocale || locale) as SupportedLocale;
  const subject = getProjectOAuthMagicLinkEmailSubject(params, emailLocale);

  const content = `
    <mj-text font-size="24px" font-weight="700" color="#1F2937" align="center" padding="0 0 20px 0">
      ${subject}
    </mj-text>

    <mj-text padding="10px 0">
      Click the button below to sign in${appName ? ` to ${appName}` : ''}.
    </mj-text>

    ${createButton(magicLinkUrl, 'Sign in')}

    ${createAlternativeLink(magicLinkUrl, emailLocale)}
  `;

  return renderBaseEmailTemplate({
    locale: emailLocale,
    subject,
    children: content,
  });
}

export function getProjectOAuthMagicLinkEmailText(
  params: SendProjectOAuthMagicLinkParams,
  _locale: SupportedLocale = defaultLocale
): string {
  const { magicLinkUrl, appName } = params;
  const subject = getProjectOAuthMagicLinkEmailSubject(params);
  return `${subject}\n\nClick the link below to sign in${appName ? ` to ${appName}` : ''}:\n\n${magicLinkUrl}`.trim();
}
