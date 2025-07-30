import { Controller, Get, Post, Body, Param, Query, Delete, Put, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { PartsService } from './parts.service';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';

@Controller('products')
export class PartsController {
  constructor(private readonly partsService: PartsService) {}

  @Post()
  async create(@Body() createPartDto: CreatePartDto) {
    return await this.partsService.create(createPartDto);
  }

  @Get('all')
  async findAll() {
    return await this.partsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.partsService.findOne(+id);
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
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return await this.partsService.handleFileUpload(file);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePartDto: UpdatePartDto) {
    return await this.partsService.update(+id, updatePartDto);
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
  ) {
    return await this.partsService.search(oem, trt, brand, model);
  }

  @Get('part/category/:categoryId')
  async getPartsByCategory(@Param('categoryId') categoryId: string) {
    return await this.partsService.getPartsByCategory(+categoryId);
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
  async getCategories() {
    return await this.partsService.getCategories();
  }

  @Get()
  async searchByName(@Query('value') name: string) {
    return await this.partsService.searchByName(name);
  }

  @Get('all/count')
  async getTotalCount() {
    return await this.partsService.getTotalCount();
  }
}