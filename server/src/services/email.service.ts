/**
 * Brevo (Sendinblue) Transactional Email Service
 * Handles transactional emails for password recovery and staff onboarding.
 * Falls back to structured development console logging when BREVO_API_KEY is not configured.
 */

interface SendEmailParams {
  toEmail: string;
  toName: string;
  subject: string;
  htmlContent: string;
}

export class EmailService {
  private static apiKey = process.env.BREVO_API_KEY || "";
  private static senderEmail = process.env.BREVO_SENDER_EMAIL || "alumni@imcc.mespune.in";
  private static senderName = process.env.BREVO_SENDER_NAME || "MES IMCC AlmaLink";

  /**
   * Dispatches a transactional email via Brevo REST API
   */
  static async sendEmail({
    toEmail,
    toName,
    subject,
    htmlContent,
  }: SendEmailParams): Promise<boolean> {
    const isConfigured = this.apiKey && this.apiKey !== "placeholder_brevo_key";

    if (!isConfigured) {
      console.log(`\n📧 [EMAIL SIMULATION - Brevo API Key not provided]`);
      console.log(`   To: ${toName} <${toEmail}>`);
      console.log(`   Subject: ${subject}`);
      console.log(`   Sender: ${this.senderName} <${this.senderEmail}>`);
      console.log(`----------------------------------------------------------------`);
      return true;
    }

    try {
      const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": this.apiKey,
        },
        body: JSON.stringify({
          sender: { name: this.senderName, email: this.senderEmail },
          to: [{ email: toEmail, name: toName }],
          subject,
          htmlContent,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[BREVO ERROR] Failed to send email to ${toEmail}:`, errorText);
        return false;
      }

      console.log(`✅ [BREVO] Email dispatched successfully to ${toEmail}`);
      return true;
    } catch (err) {
      console.error(`[BREVO ERROR] Network error while sending email:`, err);
      return false;
    }
  }

  /**
   * Dispatches a secure Password Reset email with branded HTML template
   */
  static async sendPasswordResetEmail(
    toEmail: string,
    toName: string,
    resetLink: string
  ): Promise<boolean> {
    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 12px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #161D2C; margin: 0; font-size: 24px;">MES IMCC AlmaLink</h2>
          <p style="color: #64748B; font-size: 13px; margin-top: 4px;">Alumni Management & Engagement Platform</p>
        </div>
        
        <h3 style="color: #1E293B; font-size: 18px;">Password Recovery Request</h3>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">Hello ${toName},</p>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          We received a request to reset your password for your IMCC AlmaLink account. Click the button below to choose a new password:
        </p>
        
        <div style="text-align: center; margin: 28px 0;">
          <a href="${resetLink}" style="background-color: #5D5FEF; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
            Reset Password
          </a>
        </div>
        
        <p style="color: #64748B; font-size: 12px; line-height: 1.5;">
          This link will expire in <strong>1 hour</strong>. If you did not request this password reset, please ignore this email or contact <a href="mailto:alumni@imcc.mespune.in" style="color: #5D5FEF;">alumni@imcc.mespune.in</a>.
        </p>
        
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
        <p style="color: #94A3B8; font-size: 11px; text-align: center; margin: 0;">
          MES Institute of Management & Career Courses, Pune · Since 1983
        </p>
      </div>
    `;

    return this.sendEmail({
      toEmail,
      toName,
      subject: "Reset your IMCC AlmaLink Password",
      htmlContent,
    });
  }

  /**
   * Dispatches a Staff / Coordinator Onboarding Invitation email
   */
  static async sendStaffInvitationEmail(
    toEmail: string,
    toName: string,
    cellName: string,
    invitationLink: string
  ): Promise<boolean> {
    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 12px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #161D2C; margin: 0; font-size: 24px;">MES IMCC AlmaLink</h2>
          <p style="color: #64748B; font-size: 13px; margin-top: 4px;">Faculty & Cell Coordinator Portal</p>
        </div>
        
        <h3 style="color: #1E293B; font-size: 18px;">Welcome to AlmaLink</h3>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">Dear ${toName},</p>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          You have been appointed as a Cell Coordinator for the <strong>${cellName}</strong> by the IMCC College Administration.
        </p>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          Please click the button below to set up your password and access your cell's workspace:
        </p>
        
        <div style="text-align: center; margin: 28px 0;">
          <a href="${invitationLink}" style="background-color: #5D5FEF; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
            Activate Staff Account
          </a>
        </div>
        
        <p style="color: #64748B; font-size: 12px; line-height: 1.5;">
          This link will remain active for 7 days. If you have questions, please reach out to Dr. Anjali Joshi or IT support.
        </p>
        
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
        <p style="color: #94A3B8; font-size: 11px; text-align: center; margin: 0;">
          MES Institute of Management & Career Courses, Pune · Since 1983
        </p>
      </div>
    `;

    return this.sendEmail({
      toEmail,
      toName,
      subject: "Invitation: Activate your IMCC AlmaLink Coordinator Account",
      htmlContent,
    });
  }

  /**
   * Dispatches an acknowledgment email when an alumnus registers
   */
  static async sendAlumniRegistrationReceivedEmail(
    toEmail: string,
    toName: string,
    referenceId: string
  ): Promise<boolean> {
    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 12px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #161D2C; margin: 0; font-size: 24px;">MES IMCC AlmaLink</h2>
          <p style="color: #64748B; font-size: 13px; margin-top: 4px;">Alumni Management & Engagement Platform</p>
        </div>
        
        <h3 style="color: #1E293B; font-size: 18px;">Registration Received — Verification Pending</h3>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">Hello ${toName},</p>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          Thank you for registering on MES IMCC AlmaLink. Your registration reference is <strong>${referenceId}</strong>.
        </p>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          Our administration is currently verifying your details against college records. Verification usually takes 2–3 working days. We will notify you once your account has been activated.
        </p>
        
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
        <p style="color: #94A3B8; font-size: 11px; text-align: center; margin: 0;">
          MES Institute of Management & Career Courses, Pune · Since 1983
        </p>
      </div>
    `;

    return this.sendEmail({
      toEmail,
      toName,
      subject: `Registration Received [Ref: ${referenceId}] - IMCC AlmaLink`,
      htmlContent,
    });
  }

  /**
   * Dispatches an approval notification when alumnus is verified by Admin
   */
  static async sendAlumniApprovedEmail(
    toEmail: string,
    toName: string,
    loginLink: string
  ): Promise<boolean> {
    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 12px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #161D2C; margin: 0; font-size: 24px;">MES IMCC AlmaLink</h2>
          <p style="color: #64748B; font-size: 13px; margin-top: 4px;">Alumni Portal Access Granted</p>
        </div>
        
        <h3 style="color: #1E293B; font-size: 18px;">Welcome to the IMCC Alumni Community!</h3>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">Hello ${toName},</p>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          Your alumni registration has been verified and approved by the college administration. You now have full access to AlmaLink.
        </p>
        
        <div style="text-align: center; margin: 28px 0;">
          <a href="${loginLink}" style="background-color: #5D5FEF; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block;">
            Sign In to AlmaLink
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
        <p style="color: #94A3B8; font-size: 11px; text-align: center; margin: 0;">
          MES Institute of Management & Career Courses, Pune · Since 1983
        </p>
      </div>
    `;

    return this.sendEmail({
      toEmail,
      toName,
      subject: "Account Approved - Welcome to IMCC AlmaLink",
      htmlContent,
    });
  }

  /**
   * Dispatches a changes-requested notification
   */
  static async sendAlumniChangesRequestedEmail(
    toEmail: string,
    toName: string,
    changesNeeded: string
  ): Promise<boolean> {
    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 12px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #161D2C; margin: 0; font-size: 24px;">MES IMCC AlmaLink</h2>
          <p style="color: #64748B; font-size: 13px; margin-top: 4px;">Alumni Verification Update</p>
        </div>
        
        <h3 style="color: #1E293B; font-size: 18px;">Action Required: Clarification for your Alumni Account</h3>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">Hello ${toName},</p>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          During verification of your alumni registration, the administration requested the following changes or clarification:
        </p>
        <div style="background-color: #F8FAFC; border-left: 4px solid #F59E0B; padding: 12px 16px; margin: 16px 0; border-radius: 4px; font-size: 14px; color: #334155;">
          ${changesNeeded}
        </div>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          Please reply to this email or contact <a href="mailto:alumni@imcc.mespune.in" style="color: #5D5FEF;">alumni@imcc.mespune.in</a> with your updated details.
        </p>
        
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
        <p style="color: #94A3B8; font-size: 11px; text-align: center; margin: 0;">
          MES Institute of Management & Career Courses, Pune · Since 1983
        </p>
      </div>
    `;

    return this.sendEmail({
      toEmail,
      toName,
      subject: "Changes Requested for your IMCC Alumni Account",
      htmlContent,
    });
  }

  /**
   * Dispatches a rejection notification
   */
  static async sendAlumniRejectedEmail(
    toEmail: string,
    toName: string,
    reason: string
  ): Promise<boolean> {
    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #E2E8F0; border-radius: 12px; background: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #161D2C; margin: 0; font-size: 24px;">MES IMCC AlmaLink</h2>
          <p style="color: #64748B; font-size: 13px; margin-top: 4px;">Alumni Verification Update</p>
        </div>
        
        <h3 style="color: #1E293B; font-size: 18px;">Registration Update</h3>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">Hello ${toName},</p>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          We were unable to verify your alumni registration against IMCC college records.
        </p>
        <div style="background-color: #FEF2F2; border-left: 4px solid #EF4444; padding: 12px 16px; margin: 16px 0; border-radius: 4px; font-size: 14px; color: #991B1B;">
          <strong>Reason:</strong> ${reason}
        </div>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          If you believe this is in error, please contact the college administration at <a href="mailto:alumni@imcc.mespune.in" style="color: #5D5FEF;">alumni@imcc.mespune.in</a>.
        </p>
        
        <hr style="border: none; border-top: 1px solid #E2E8F0; margin: 24px 0;" />
        <p style="color: #94A3B8; font-size: 11px; text-align: center; margin: 0;">
          MES Institute of Management & Career Courses, Pune · Since 1983
        </p>
      </div>
    `;

    return this.sendEmail({
      toEmail,
      toName,
      subject: "Update Regarding your IMCC Alumni Registration",
      htmlContent,
    });
  }
}
