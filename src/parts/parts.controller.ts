import { Controller, Get, Post, Body, Param, Query, Delete, Put, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { PartsService } from './parts.service';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';
import { I18n, I18nContext } from 'nestjs-i18n';

@Controller('products')
export class PartsController {
  constructor(private readonly partsService: PartsService) {}

  @Post()
  async create(@Body() createPartDto: CreatePartDto, @I18n() i18n: I18nContext) {
    return await this.partsService.create(createPartDto, i18n.lang);
  }

  @Get('all')
  async findAll(@I18n() i18n: I18nContext) {
    return await this.partsService.findAll(i18n.lang);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @I18n() i18n: I18nContext) {
    return await this.partsService.findOne(+id, i18n.lang);
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './Uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + extname(file.originalname);
          callback(null, file.fieldname + '-' + uniqueSuffix);
        },
      }),
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File, @I18n() i18n: I18nContext) {
    return await this.partsService.handleFileUpload(file);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePartDto: UpdatePartDto, @I18n() i18n: I18nContext) {
    return await this.partsService.update(+id, updatePartDto, i18n.lang);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.partsService.remove(+id);
  }

  @Get('oem/all')
  async getAllOem() {
    return await this.partsService.getAllOem();
  }

  @Get('oem/:oem')
  async getOemId(@Param('oem') oem: string) {
    return await this.partsService.getOemId(oem);
  }

  @Get('trt/:trt')
  async getTrtCode(@Param('trt') trt: string) {
    return await this.partsService.getTrtCode(trt);
  }

  @Get('brand/:brand')
  async getBrand(@Param('brand') brand: string) {
    return await this.partsService.getBrand(brand);
  }

  @Get('part/search')
  async search(
    @Query('oem') oem: string,
    @Query('trt') trt: string,
    @Query('brand') brand: string,
    @Query('model') model: string,
    @I18n() i18n: I18nContext,
  ) {
    return await this.partsService.search(oem, trt, brand, model, i18n.lang);
  }

  @Get('part/category/:categoryId')
  async getPartsByCategory(@Param('categoryId') categoryId: string, @I18n() i18n: I18nContext) {
    return await this.partsService.getPartsByCategory(+categoryId, i18n.lang);
  }

  @Get('uploads/:imageName')
  async getImage(@Param('imageName') imageName: string, @Res() res: Response) {
    const imagePath = await this.partsService.getImagePath(imageName);

    if (imagePath) {
      return res.sendFile(imagePath);
    }
    return res.status(404).send('Rasm topilmadi');
  }

  @Get('parts/categories')
  async getCategories(@I18n() i18n: I18nContext) {
    return await this.partsService.getCategories(i18n.lang);
  }

  @Get()
  async searchByName(@Query('value') name: string, @I18n() i18n: I18nContext) {
    return await this.partsService.searchByName(name, i18n.lang);
  }

  @Get('all/count')
  async getTotalCount() {
    return await this.partsService.getTotalCount();
  }
}