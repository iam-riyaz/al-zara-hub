export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface IEmailProvider {
  sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId: string }>;
}

export class MockEmailProvider implements IEmailProvider {
  async sendEmail(options: SendEmailOptions) {
    const messageId = `mock_email_${Date.now()}`;
    console.log("==================== MOCK EMAIL DISPATCHED ====================");
    console.log(`TO:      ${options.to}`);
    console.log(`SUBJECT: ${options.subject}`);
    console.log("BODY:");
    console.log(options.text || options.html);
    console.log("===============================================================");
    return { success: true, messageId };
  }
}

export const emailProvider = new MockEmailProvider();
