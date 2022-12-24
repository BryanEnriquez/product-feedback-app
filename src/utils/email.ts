import { join } from 'path';
import nodemailer from 'nodemailer';
import pug from 'pug';
import { convert } from 'html-to-text';
import type { AccountModel } from '../models/accountModel';

type PugTemplate = 'welcome' | 'accountVerification' | 'passwordReset';

const { NODE_ENV, EMAIL_FROM, SENDGRID_USERNAME, SENDGRID_PASSWORD } =
  process.env;

const CWD = process.cwd();

export default class Email {
  to: string;
  firstName: string;
  from: string;

  /**
   * @param user Expects `email` and `firstName` fields on user.
   * @param url
   */
  constructor(user: AccountModel, public url: string) {
    this.to = user.email;
    this.firstName = user.firstName;
    this.from = `Product Feedback Webapp <${EMAIL_FROM}>`;
  }

  protected newTransport() {
    if (NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: SENDGRID_USERNAME,
          pass: SENDGRID_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
    });
  }

  protected async send(template: PugTemplate, subject: string) {
    const html = pug.renderFile(join(CWD, 'templates', `${template}.pug`), {
      firstName: this.firstName,
      url: this.url,
      subject,
    });

    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };

    await this.newTransport().sendMail(mailOptions);
  }

  public async sendWelcome() {
    await this.send('welcome', 'Welcome!');
  }

  public async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset link (valid for 15 minutes)'
    );
  }

  public async resendActivationToken() {
    await this.send(
      'accountVerification',
      'Account verification link (valid for 3 hours)'
    );
  }
}
