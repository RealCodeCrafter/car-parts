import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import * as nodemailer from 'nodemailer';

@Injectable()
export class ContactService {
  async sendMessage(createContactDto: CreateContactDto) {
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
        subject: 'Yangi xabar',
        text: `
          Ism: ${createContactDto.name}
          Telefon: ${createContactDto.phone}
          Izoh: ${createContactDto.comment}
        `,
      };

      await transporter.sendMail(mailOptions);
      return { message: 'Xabar muvaffaqiyatli yuborildi' };
    } catch (error) {
      throw new InternalServerErrorException('Xabar yuborishda xatolik yuz berdi');
    }
  }

  async getContactInfo() {
    return {
      title: 'Biz bilan bog‘lanish',
      contacts: 'Kontaktlar',
      description: 'Biz bilan bog‘lanish uchun quyidagi ma’lumotlarni ishlating',
      phone_label: 'Telefon',
      phone: '+998901234567',
      email: 'contact@trt-parts.com',
      address: 'Toshkent, Chilanzar, 45-uy',
      form_title: 'Xabar yuborish',
      name_label: 'Ism',
      phone_label_form: 'Telefon raqami',
      comment_label: 'Izoh',
      submit_button: 'Yuborish',
      data_processing_consent: 'Ma’lumotlarimni qayta ishlashga roziman',
    };
  }
}