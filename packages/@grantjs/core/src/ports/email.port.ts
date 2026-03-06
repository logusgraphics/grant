export interface SendInvitationParams {
  to: string;
  organizationName: string;
  inviterName: string;
  invitationUrl: string;
  roleName: string;
  expiresInDays?: number;
  locale?: string;
}

export interface SendOtpParams {
  to: string;
  token: string;
  validUntil: number;
  locale?: string;
}

export interface SendPasswordResetParams {
  to: string;
  token: string;
  validUntil: number;
  locale?: string;
}

export interface SendProjectOAuthMagicLinkParams {
  to: string;
  magicLinkUrl: string;
  appName?: string;
  locale?: string;
}

export interface IEmailService {
  /**
   * Send an organization invitation email
   */
  sendInvitation(params: SendInvitationParams): Promise<void>;

  /**
   * Send a one-time password (OTP) for email verification
   */
  sendOtp(params: SendOtpParams): Promise<void>;

  /**
   * Send a password reset email with reset token
   */
  sendPasswordReset(params: SendPasswordResetParams): Promise<void>;

  /**
   * Send a project OAuth magic link (sign-in link for project app)
   */
  sendProjectOAuthMagicLink(params: SendProjectOAuthMagicLinkParams): Promise<void>;
}
