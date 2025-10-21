import {
  IEmailService,
  SendInvitationParams,
  SendOtpParams,
  SendPasswordResetParams,
} from '../email.interface';
import {
  getInvitationEmailSubject,
  getInvitationEmailText,
  getOtpEmailSubject,
  getOtpEmailText,
  getPasswordResetEmailSubject,
  getPasswordResetEmailText,
} from '../templates';

/**
 * Console email adapter for development
 * Logs emails to console instead of actually sending them
 */
export class ConsoleEmailAdapter implements IEmailService {
  constructor(private readonly from: string) {}

  async sendInvitation(params: SendInvitationParams): Promise<void> {
    const subject = getInvitationEmailSubject(params);
    const text = getInvitationEmailText(params);

    console.log('\n' + '='.repeat(80));
    console.log('📧 EMAIL (Console Adapter - Development Mode)');
    console.log('='.repeat(80));
    console.log(`From: ${this.from}`);
    console.log(`To: ${params.to}`);
    console.log(`Subject: ${subject}`);
    console.log('-'.repeat(80));
    console.log(text);
    console.log('='.repeat(80) + '\n');
  }

  async sendOtp(params: SendOtpParams): Promise<void> {
    const subject = getOtpEmailSubject(params);
    const text = getOtpEmailText(params);

    console.log('\n' + '='.repeat(80));
    console.log('📧 EMAIL (Console Adapter - Development Mode)');
    console.log('='.repeat(80));
    console.log(`From: ${this.from}`);
    console.log(`To: ${params.to}`);
    console.log(`Subject: ${subject}`);
    console.log('-'.repeat(80));
    console.log(text);
    console.log('='.repeat(80) + '\n');
  }

  async sendPasswordReset(params: SendPasswordResetParams): Promise<void> {
    const subject = getPasswordResetEmailSubject(params);
    const text = getPasswordResetEmailText(params);

    console.log('\n' + '='.repeat(80));
    console.log('📧 PASSWORD RESET EMAIL (Console Adapter - Development Mode)');
    console.log('='.repeat(80));
    console.log(`From: ${this.from}`);
    console.log(`To: ${params.to}`);
    console.log(`Subject: ${subject}`);
    console.log('-'.repeat(80));
    console.log(text);
    console.log('='.repeat(80) + '\n');
  }
}
