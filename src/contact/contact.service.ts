import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ContactService {
  private translations: { [key: string]: any } = {};

  constructor() {
    this.loadTranslations();
  }

  private loadTranslations() {
    const i18nPath = path.join('./src/i18n');

    try {
      const files = fs.readdirSync(i18nPath);

      for (const file of files) {
        if (file.endsWith('.json')) {
          const lang = file.replace('.json', '');
          const filePath = path.join(i18nPath, file);
          const data = fs.readFileSync(filePath, 'utf8');
          this.translations[lang] = JSON.parse(data);
        }
      }
    } catch (error) {
      throw new InternalServerErrorException('Failed to load translations');
    }
  }

  private getTranslation(key: string, lang: string): string {
    const keys = key.split('.');
    let current = this.translations[lang] || this.translations['en'] || {};
    for (const k of keys) {
      current = current[k] || {};
    }
    return typeof current === 'string' ? current : key;
  }

  async sendMessage(createContactDto: CreateContactDto, lang: string = 'en') {
    const translations = {
      email_subject: this.getTranslation('contact.email_subject', lang),
      name_label: this.getTranslation('contact.name_label', lang),
      phone_label: this.getTranslation('contact.phone_label_form', lang),
      comment_label: this.getTranslation('contact.comment_label', lang),
      message_sent: this.getTranslation('contact.message_sent', lang),
      message_error: this.getTranslation('contact.message_error', lang),
      test: this.getTranslation('test.hello', lang),
    };

    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'valireyimbergenov79@gmail.com',
          pass: 'mmewnxpntrxxsbvz',
        },
      });

      const mailOptions = {
        from: 'sales@trt-parts.com',
        to: 'reyimbergenovvali702@gmail.com',
        subject: translations.email_subject,
        text: `
          ${translations.name_label}: ${createContactDto.name}
          ${translations.phone_label}: ${createContactDto.phone}
          ${translations.comment_label}: ${createContactDto.comment}
        `,
      };

      await transporter.sendMail(mailOptions);
      return { message: translations.message_sent };
    } catch (error) {
      throw new InternalServerErrorException(translations.message_error);
    }
  }

  async getContactInfo(lang: string = 'en') {
    console.log('Fetching contact info with language:', lang);

    const translations = {
      title: this.getTranslation('contact.title', lang),
      contacts: this.getTranslation('contact.contacts', lang),
      description: this.getTranslation('contact.description', lang),
      phone_label: this.getTranslation('contact.phone_label', lang),
      phone: this.getTranslation('contact.phone', lang),
      email: this.getTranslation('contact.email', lang),
      address: this.getTranslation('contact.address', lang),
      form_title: this.getTranslation('contact.form_title', lang),
      name_label: this.getTranslation('contact.name_label', lang),
      phone_label_form: this.getTranslation('contact.phone_label_form', lang),
      comment_label: this.getTranslation('contact.comment_label', lang),
      submit_button: this.getTranslation('contact.submit_button', lang),
      data_processing_consent: this.getTranslation('contact.data_processing_consent', lang),
      test: this.getTranslation('test.hello', lang),
    };
    return translations;
  }
}