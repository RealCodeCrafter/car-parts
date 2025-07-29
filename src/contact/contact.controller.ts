import { Controller, Post, Body, Get, Headers } from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async sendMessage(
    @Body() createContactDto: CreateContactDto,
    @Headers('accept-language') lang: string = 'en',
  ) {
    return await this.contactService.sendMessage(createContactDto, lang);
  }

  @Get()
  async getContactInfo(@Headers('accept-language') lang: string = 'en') {
    return await this.contactService.getContactInfo(lang);
  }
}