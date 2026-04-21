import type {
  SendInvitationParams,
  SendOtpParams,
  SendPasswordResetParams,
  SendProjectOAuthMagicLinkParams,
} from '@grantjs/core';

/**
 * Template rendering functions that adapters use to produce email content.
 * The application provides its own implementation (e.g. MJML-based) at construction.
 */
export interface EmailTemplates {
  getInvitationEmailSubject(params: SendInvitationParams): string;
  getInvitationEmailHtml(params: SendInvitationParams): Promise<string>;
  getInvitationEmailText(params: SendInvitationParams): string;
  getOtpEmailSubject(params: SendOtpParams): string;
  getOtpEmailHtml(params: SendOtpParams): Promise<string>;
  getOtpEmailText(params: SendOtpParams): string;
  getPasswordResetEmailSubject(params: SendPasswordResetParams): string;
  getPasswordResetEmailHtml(params: SendPasswordResetParams): Promise<string>;
  getPasswordResetEmailText(params: SendPasswordResetParams): string;
  getProjectOAuthMagicLinkEmailSubject(params: SendProjectOAuthMagicLinkParams): string;
  getProjectOAuthMagicLinkEmailHtml(params: SendProjectOAuthMagicLinkParams): Promise<string>;
  getProjectOAuthMagicLinkEmailText(params: SendProjectOAuthMagicLinkParams): string;
}
