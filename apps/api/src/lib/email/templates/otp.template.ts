import { config } from '@/config';
import { defaultLocale, translateStatic, type SupportedLocale } from '@/i18n';

import { SendOtpParams } from '../email.interface';

export function getOtpEmailSubject(params: SendOtpParams): string {
  const emailLocale = (params.locale || defaultLocale) as SupportedLocale;
  return translateStatic('email:verification.subject', emailLocale);
}

export function getOtpEmailHtml(params: SendOtpParams, locale: SupportedLocale = 'en'): string {
  const { token, validUntil, locale: paramsLocale } = params;
  const emailLocale = (paramsLocale || locale) as SupportedLocale;
  const verificationUrl = `${config.security.frontendUrl}/${emailLocale}/verify-email?token=${encodeURIComponent(token)}`;
  const expirationMinutes = Math.floor((validUntil - Date.now()) / 1000 / 60);

  const t = {
    greeting: translateStatic('email:verification.greeting', emailLocale),
    message: translateStatic('email:verification.message', emailLocale),
    button: translateStatic('email:verification.button', emailLocale),
    expiresIn: translateStatic('email:verification.expiresIn', emailLocale, {
      minutes: expirationMinutes,
    }),
    alternativeText: translateStatic('email:verification.alternativeText', emailLocale),
    footerNoRequest: translateStatic('email:verification.footer.noRequest', emailLocale),
    footerTypo: translateStatic('email:verification.footer.typo', emailLocale),
    signature: translateStatic('email:verification.signature', emailLocale),
  };

  return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t.button}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 40px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #2563eb;
    }
    h1 {
      font-size: 24px;
      margin-bottom: 20px;
      color: #1f2937;
    }
    p {
      margin-bottom: 15px;
      color: #4b5563;
    }
    .button-container {
      text-align: center;
      margin: 30px 0;
    }
    .verify-button {
      display: inline-block;
      background-color: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 16px;
      transition: background-color 0.2s;
    }
    .verify-button:hover {
      background-color: #1d4ed8;
    }
    .alternative-link {
      margin-top: 20px;
      padding: 15px;
      background-color: #f9fafb;
      border-radius: 6px;
      font-size: 12px;
      color: #6b7280;
      word-break: break-all;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 14px;
      color: #6b7280;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">${t.signature}</div>
    </div>
    
    <h1>${translateStatic('email:verification.subject', emailLocale)}</h1>
    
    <p>${t.greeting}</p>
    
    <p>${t.message}</p>
    
    <div class="button-container">
      <a href="${verificationUrl}" class="verify-button">${t.button}</a>
    </div>
    
    <p style="text-align: center; font-size: 14px; color: #6b7280;">
      ${t.expiresIn}
    </p>
    
    <div class="alternative-link">
      <p style="margin: 0 0 8px 0; font-weight: 600; color: #374151;">${t.alternativeText}</p>
      <p style="margin: 0;">${verificationUrl}</p>
    </div>
    
    <div class="footer">
      <p>${t.footerNoRequest}</p>
      <p>${t.footerTypo}</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function getOtpEmailText(params: SendOtpParams, locale: SupportedLocale = 'en'): string {
  const { token, validUntil, locale: paramsLocale } = params;
  const emailLocale = (paramsLocale || locale) as SupportedLocale;
  const verificationUrl = `${config.security.frontendUrl}/${emailLocale}/verify-email?token=${encodeURIComponent(token)}`;
  const expirationMinutes = Math.floor((validUntil - Date.now()) / 1000 / 60);

  const t = {
    subject: translateStatic('email:verification.subject', emailLocale),
    greeting: translateStatic('email:verification.greeting', emailLocale),
    message: translateStatic('email:verification.message', emailLocale),
    expiresIn: translateStatic('email:verification.expiresIn', emailLocale, {
      minutes: expirationMinutes,
    }),
    footerNoRequest: translateStatic('email:verification.footer.noRequest', emailLocale),
    footerTypo: translateStatic('email:verification.footer.typo', emailLocale),
    signature: translateStatic('email:verification.signature', emailLocale),
  };

  return `
${t.subject}

${t.greeting}

${t.message}

${verificationUrl}

${t.expiresIn}

${t.footerNoRequest}
${t.footerTypo}

---
${t.signature}
  `.trim();
}
