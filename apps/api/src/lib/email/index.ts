// Re-export from @grantjs/email — canonical adapter implementations live there
export {
  ConsoleEmailAdapter,
  EmailFactory,
  type EmailTemplates,
  MailgunEmailAdapter,
  MailjetEmailAdapter,
  SesEmailAdapter,
  SmtpEmailAdapter,
} from '@grantjs/email';

// Re-export types from @grantjs/core
export type {
  IEmailService,
  SendInvitationParams,
  SendOtpParams,
  SendPasswordResetParams,
  SendProjectOAuthMagicLinkParams,
} from '@grantjs/core';

// Templates stay in the API
export * from './templates';
