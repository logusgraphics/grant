import mjml from 'mjml';

import { translateStatic, type SupportedLocale } from '@/i18n';

export interface EmailTemplateParams {
  locale: SupportedLocale;
  primaryColor?: string;
  logoUrl?: string;
  companyName?: string;
}

export interface BaseEmailTemplateProps extends EmailTemplateParams {
  subject: string;
  children: string;
}

export function renderBaseEmailTemplate(props: BaseEmailTemplateProps): string {
  const {
    locale,
    primaryColor = '#2563eb',
    logoUrl,
    companyName = 'Grant Platform',
    subject,
    children,
  } = props;

  const mjmlTemplate = `
    <mjml>
      <mj-head>
        <mj-title>${subject}</mj-title>
        <mj-font name="Inter" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" />
        <mj-attributes>
          <mj-all font-family="Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" />
          <mj-text font-size="16px" line-height="24px" color="#4B5563" />
          <mj-button background-color="${primaryColor}" color="white" font-weight="600" />
        </mj-attributes>
        <mj-style>
          .primary-color { color: ${primaryColor}; }
          .bg-primary { background-color: ${primaryColor}; }
          .border-primary { border-color: ${primaryColor}; }
        </mj-style>
      </mj-head>

      <mj-body background-color="#F9FAFB">
        <mj-section background-color="#FFFFFF" padding="40px">
          <!-- Header -->
          <mj-column>
            <mj-text align="center" font-size="24px" font-weight="700" color="#1F2937">
              ${logoUrl ? `<img src="${logoUrl}" alt="${companyName}" width="120" />` : companyName}
            </mj-text>
          </mj-column>

          <!-- Content -->
          <mj-column>
            ${children}
          </mj-column>

          <!-- Footer -->
          <mj-column>
            <mj-divider border-color="#E5E7EB" padding="20px 0 0 0" />
            <mj-text align="center" font-size="14px" color="#6B7280" padding="20px 0 0 0">
              ${translateStatic('email:common.footer.noRequest', locale)}<br />
              ${translateStatic('email:common.footer.typo', locale)}<br />
              <br />
              ${companyName}
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `;

  const { html } = mjml(mjmlTemplate);
  return html;
}

export function createButton(
  url: string,
  text: string,
  variant: 'primary' | 'secondary' = 'primary'
): string {
  const backgroundColor = variant === 'primary' ? '#2563eb' : '#6B7280';

  return `
    <mj-button href="${url}" background-color="${backgroundColor}" border-radius="6px" padding="14px 32px" font-size="16px" font-weight="600">
      ${text}
    </mj-button>
  `;
}

export function createAlternativeLink(url: string, locale: SupportedLocale): string {
  return `
    <mj-text font-size="12px" color="#6B7280" background-color="#F9FAFB" padding="15px" border-radius="6px">
      <strong>${translateStatic('email:common.alternativeText', locale)}</strong><br />
      <span style="word-break: break-all;">${url}</span>
    </mj-text>
  `;
}
