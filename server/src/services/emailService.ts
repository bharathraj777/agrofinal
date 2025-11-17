import nodemailer from 'nodemailer';
import { AppError } from '../middleware';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private emailProvider: 'smtp' | 'emailjs' | 'sendgrid' | 'console';
  private isConfigured: boolean = false;

  constructor() {
    this.emailProvider = this.determineProvider();
    this.initializeProvider();
  }

  private determineProvider(): 'smtp' | 'emailjs' | 'sendgrid' | 'console' {
    // Check for SendGrid first (highest reliability)
    if (process.env.SENDGRID_API_KEY) {
      return 'sendgrid';
    }

    // Check for EmailJS (client-side friendly)
    if (process.env.EMAILJS_PUBLIC_KEY && process.env.EMAILJS_SERVICE_ID && process.env.EMAILJS_TEMPLATE_ID) {
      return 'emailjs';
    }

    // Check for SMTP configuration (Gmail, etc.)
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      return 'smtp';
    }

    // Fallback to console output for development
    console.warn('⚠️  No email service configured. Emails will be logged to console only.');
    return 'console';
  }

  private async initializeProvider() {
    try {
      switch (this.emailProvider) {
        case 'smtp':
          await this.initializeSMTP();
          break;
        case 'sendgrid':
          await this.initializeSendGrid();
          break;
        case 'emailjs':
          await this.initializeEmailJS();
          break;
        case 'console':
          this.isConfigured = true;
          break;
      }
    } catch (error) {
      console.error('Failed to initialize email provider:', error);
      this.emailProvider = 'console';
      this.isConfigured = true;
    }
  }

  private async initializeSMTP() {
    try {
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false // Allow self-signed certificates
        }
      });

      // Verify connection
      await this.transporter.verify();
      this.isConfigured = true;
      console.log('✅ SMTP email service configured successfully');
    } catch (error) {
      console.error('❌ SMTP configuration failed:', error);
      throw error;
    }
  }

  private async initializeSendGrid() {
    // SendGrid implementation using their API
    try {
      const sendgridTransporter = require('nodemailer-sendgrid-transport');
      this.transporter = nodemailer.createTransporter(
        sendgridTransporter({
          apiKey: process.env.SENDGRID_API_KEY
        })
      );
      this.isConfigured = true;
      console.log('✅ SendGrid email service configured successfully');
    } catch (error) {
      console.error('❌ SendGrid configuration failed:', error);
      throw error;
    }
  }

  private async initializeEmailJS() {
    // EmailJS is primarily client-side, but we can prepare server-side templates
    this.isConfigured = true;
    console.log('✅ EmailJS service configured (client-side sending)');
  }

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!this.isConfigured) {
        console.log('Email service not configured, skipping...');
        return { success: false, error: 'Email service not configured' };
      }

      switch (this.emailProvider) {
        case 'smtp':
        case 'sendgrid':
          return await this.sendWithNodemailer(options);
        case 'emailjs':
          return await this.sendWithEmailJS(options);
        case 'console':
          return await this.sendToConsole(options);
        default:
          throw new Error('No email provider configured');
      }
    } catch (error: any) {
      console.error('Email sending failed:', error);
      return { success: false, error: error.message };
    }
  }

  private async sendWithNodemailer(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    if (!this.transporter) {
      throw new Error('Email transporter not initialized');
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@agriculture-app.com',
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        text: options.text || this.extractTextFromHtml(options.html),
        html: options.html,
        attachments: options.attachments
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error: any) {
      console.error('❌ Nodemailer sending failed:', error);
      throw error;
    }
  }

  private async sendWithEmailJS(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // EmailJS is typically used on the client-side
    // For server-side, we'll return template information for client to use
    const templateInfo = {
      serviceId: process.env.EMAILJS_SERVICE_ID,
      templateId: process.env.EMAILJS_TEMPLATE_ID,
      publicKey: process.env.EMAILJS_PUBLIC_KEY,
      templateParams: {
        to_email: Array.isArray(options.to) ? options.to[0] : options.to,
        subject: options.subject,
        message: options.text || this.extractTextFromHtml(options.html),
        from_name: 'AgriSupport'
      }
    };

    console.log('📧 EmailJS template prepared for client-side sending:', templateInfo);
    return {
      success: true,
      messageId: 'emailjs-template',
      error: 'This email should be sent from client-side using EmailJS'
    };
  }

  private async sendToConsole(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const emailData = {
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      timestamp: new Date().toISOString()
    };

    console.log('📧 EMAIL CONSOLE OUTPUT (Development Mode)');
    console.log('=' .repeat(50));
    console.log('To:', emailData.to);
    console.log('Subject:', emailData.subject);
    console.log('Timestamp:', emailData.timestamp);
    console.log('Content:');
    console.log(emailData.html || emailData.text);
    console.log('=' .repeat(50));

    return { success: true, messageId: 'console-output' };
  }

  private extractTextFromHtml(html?: string): string {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  }

  async sendWelcomeEmail(email: string, name: string): Promise<{ success: boolean; error?: string }> {
    const template = this.getWelcomeTemplate(name);
    const result = await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });

    return { success: result.success, error: result.error };
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<{ success: boolean; error?: string }> {
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    const template = this.getPasswordResetTemplate(resetLink);
    const result = await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });

    return { success: result.success, error: result.error };
  }

  async sendEmailVerificationEmail(email: string, verificationToken: string): Promise<{ success: boolean; error?: string }> {
    const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    const template = this.getEmailVerificationTemplate(verificationLink);
    const result = await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });

    return { success: result.success, error: result.error };
  }

  async sendSupportTicketEmail(ticket: {
    id: string;
    userEmail: string;
    subject: string;
    message: string;
    category: string;
  }): Promise<{ success: boolean; error?: string }> {
    const template = this.getSupportTicketTemplate(ticket);
    const result = await this.sendEmail({
      to: ['support@agriculture-app.com', ticket.userEmail],
      subject: template.subject,
      html: template.html,
      text: template.text
    });

    return { success: result.success, error: result.error };
  }

  async sendSchemeNotificationEmail(email: string, scheme: {
    title: string;
    description: string;
    deadline?: string;
    category: string;
  }): Promise<{ success: boolean; error?: string }> {
    const template = this.getSchemeNotificationTemplate(scheme);
    const result = await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });

    return { success: result.success, error: result.error };
  }

  async sendPriceAlertEmail(email: string, crop: string, price: number, location: string): Promise<{ success: boolean; error?: string }> {
    const template = this.getPriceAlertTemplate(crop, price, location);
    const result = await this.sendEmail({
      to: email,
      subject: template.subject,
      html: template.html,
      text: template.text
    });

    return { success: result.success, error: result.error };
  }

  private getWelcomeTemplate(name: string): EmailTemplate {
    return {
      subject: 'Welcome to AgriSupport - Your Smart Agriculture Assistant',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .header { background: linear-gradient(135deg, #22c55e, #16a34a); color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f9fafb; }
            .feature { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .cta-button { background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🌾 Welcome to AgriSupport!</h1>
            <p>Hello ${name}, your smart agriculture journey begins now.</p>
          </div>
          <div class="content">
            <h2>Get Started with Our Features:</h2>

            <div class="feature">
              <h3>🌱 Crop Recommendations</h3>
              <p>Get personalized crop suggestions based on your soil and weather conditions.</p>
            </div>

            <div class="feature">
              <h3>🔍 Disease Detection</h3>
              <p>Identify plant diseases instantly with AI-powered image analysis.</p>
            </div>

            <div class="feature">
              <h3>💰 Market Insights</h3>
              <p>Stay updated with current market prices and trends.</p>
            </div>

            <div class="feature">
              <h3>🤖 Chat Assistant</h3>
              <p>Get instant answers to your farming questions from our AI assistant.</p>
            </div>

            <div class="feature">
              <h3>📋 Government Schemes</h3>
              <p>Discover government schemes and subsidies available for farmers.</p>
            </div>

            <a href="${process.env.CLIENT_URL}/farmer/dashboard" class="cta-button">
              Get Started Now →
            </a>

            <p>Need help? Our support team is always here to assist you.</p>
          </div>
          <div class="footer">
            <p>© 2024 AgriSupport. Empowering farmers with technology.</p>
            <p>If you didn't create this account, please ignore this email.</p>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to AgriSupport!

Hello ${name},

Thank you for joining AgriSupport, your smart agriculture assistant. We're excited to help you on your farming journey!

Our Features:
• Crop Recommendations - Personalized suggestions for your farm
• Disease Detection - AI-powered plant health analysis
• Market Insights - Current prices and trends
• Chat Assistant - Instant farming advice
• Government Schemes - Available subsidies and support

Get started now: ${process.env.CLIENT_URL}/farmer/dashboard

If you need any help, our support team is here for you.

Happy farming!
The AgriSupport Team
      `
    };
  }

  private getPasswordResetTemplate(resetLink: string): EmailTemplate {
    return {
      subject: 'Reset Your AgriSupport Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #22c55e; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1>🔐 Password Reset</h1>
          </div>
          <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
            <p>Hello,</p>
            <p>We received a request to reset your password for your AgriSupport account.</p>
            <p>Click the button below to reset your password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetLink}" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p>If you didn't request this password reset, please ignore this email.</p>
            <p>This link will expire in 1 hour for security reasons.</p>
          </div>
        </div>
      `,
      text: `
Password Reset - AgriSupport

Hello,

We received a request to reset your password for your AgriSupport account.

Click the link below to reset your password:
${resetLink}

If you didn't request this password reset, please ignore this email.

This link will expire in 1 hour for security reasons.

The AgriSupport Team
      `
    };
  }

  private getEmailVerificationTemplate(verificationLink: string): EmailTemplate {
    return {
      subject: 'Verify Your AgriSupport Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #22c55e; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1>✉️ Verify Your Email</h1>
          </div>
          <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
            <p>Welcome to AgriSupport!</p>
            <p>Please verify your email address to complete your registration.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" style="background: #22c55e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Verify Email
              </a>
            </div>
            <p>If the button doesn't work, copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationLink}</p>
          </div>
        </div>
      `,
      text: `
Verify Your Email - AgriSupport

Welcome to AgriSupport!

Please verify your email address to complete your registration.

Click the link below to verify:
${verificationLink}

The AgriSupport Team
      `
    };
  }

  private getSupportTicketTemplate(ticket: {
    id: string;
    userEmail: string;
    subject: string;
    message: string;
    category: string;
  }): EmailTemplate {
    return {
      subject: `Support Ticket #${ticket.id}: ${ticket.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1>🎫 Support Ticket Created</h1>
          </div>
          <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
            <p>A new support ticket has been created:</p>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p><strong>Ticket ID:</strong> #${ticket.id}</p>
              <p><strong>Category:</strong> ${ticket.category}</p>
              <p><strong>From:</strong> ${ticket.userEmail}</p>
              <p><strong>Subject:</strong> ${ticket.subject}</p>
            </div>
            <div style="background: #f3f4f6; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p><strong>Message:</strong></p>
              <p>${ticket.message}</p>
            </div>
            <p>We'll get back to you as soon as possible.</p>
          </div>
        </div>
      `,
      text: `
Support Ticket Created - AgriSupport

A new support ticket has been created:

Ticket ID: #${ticket.id}
Category: ${ticket.category}
From: ${ticket.userEmail}
Subject: ${ticket.subject}

Message:
${ticket.message}

We'll get back to you as soon as possible.

The AgriSupport Team
      `
    };
  }

  private getSchemeNotificationTemplate(scheme: {
    title: string;
    description: string;
    deadline?: string;
    category: string;
  }): EmailTemplate {
    return {
      subject: `New Government Scheme: ${scheme.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1>📋 New Government Scheme Available</h1>
          </div>
          <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
            <h2>${scheme.title}</h2>
            <p><strong>Category:</strong> ${scheme.category}</p>
            ${scheme.deadline ? `<p><strong>Deadline:</strong> ${new Date(scheme.deadline).toLocaleDateString()}</p>` : ''}
            <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p><strong>Description:</strong></p>
              <p>${scheme.description}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL}/farmer/schemes" style="background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Details
              </a>
            </div>
          </div>
        </div>
      `,
      text: `
New Government Scheme - AgriSupport

${scheme.title}
Category: ${scheme.category}
${scheme.deadline ? `Deadline: ${new Date(scheme.deadline).toLocaleDateString()}` : ''}

Description:
${scheme.description}

View details: ${process.env.CLIENT_URL}/farmer/schemes

The AgriSupport Team
      `
    };
  }

  private getPriceAlertTemplate(crop: string, price: number, location: string): EmailTemplate {
    return {
      subject: `Price Alert: ${crop} - ₹${price}/quintal in ${location}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1>💰 Price Alert</h1>
          </div>
          <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
            <h2>${crop} Price Update</h2>
            <div style="background: #d1fae5; padding: 15px; border-radius: 6px; margin: 15px 0; text-align: center;">
              <p style="font-size: 24px; font-weight: bold; color: #059669;">₹${price} per quintal</p>
              <p style="color: #047857;">in ${location}</p>
            </div>
            <p>This is a price alert based on your preferences. Market prices are updated regularly.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.CLIENT_URL}/farmer/marketplace" style="background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                View Market Trends
              </a>
            </div>
          </div>
        </div>
      `,
      text: `
Price Alert - AgriSupport

${crop} Price Update

Current Price: ₹${price} per quintal
Location: ${location}

This is a price alert based on your preferences.

View market trends: ${process.env.CLIENT_URL}/farmer/marketplace

The AgriSupport Team
      `
    };
  }

  async testEmailConfiguration(): Promise<{ success: boolean; provider: string; error?: string }> {
    try {
      const testResult = await this.sendEmail({
        to: 'test@example.com',
        subject: 'Email Service Test',
        text: 'This is a test email to verify the email configuration.',
        html: '<p>This is a <strong>test email</strong> to verify the email configuration.</p>'
      });

      return {
        success: testResult.success,
        provider: this.emailProvider,
        error: testResult.error
      };
    } catch (error: any) {
      return {
        success: false,
        provider: this.emailProvider,
        error: error.message
      };
    }
  }

  getProviderInfo(): {
    provider: string;
    isConfigured: boolean;
    features: string[];
  } {
    const features = {
      console: ['Development logging', 'No external dependencies'],
      smtp: ['Custom SMTP', 'TLS support', 'Attachments', 'HTML templates'],
      sendgrid: ['100 emails/day free', 'High deliverability', 'Analytics', 'Templates'],
      emailjs: ['200 emails/month free', 'Client-side sending', 'Easy setup']
    };

    return {
      provider: this.emailProvider,
      isConfigured: this.isConfigured,
      features: features[this.emailProvider] || []
    };
  }
}

export default new EmailService();