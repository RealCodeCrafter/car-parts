import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CategoryService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { I18n, I18nContext } from 'nestjs-i18n';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto, @I18n() i18n: I18nContext) {
    return await this.categoryService.create(createCategoryDto, i18n.lang);
  }

  @Get()
  async findAll(@I18n() i18n: I18nContext) {
    return await this.categoryService.findAll(i18n.lang);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @I18n() i18n: I18nContext) {
    return await this.categoryService.findOne(+id, i18n.lang);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @I18n() i18n: I18nContext,
  ) {
    return await this.categoryService.updateCategory(+id, updateCategoryDto, i18n.lang);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.categoryService.remove(+id);
  }
}