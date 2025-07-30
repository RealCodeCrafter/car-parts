import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Part } from '../parts/entities/part.entity';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Part)
    private readonly partRepository: Repository<Part>,
    private readonly i18n: I18nService,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, lang: string = 'en') {
    const { translations, imageUrl, parts } = createCategoryDto;

    const existingCategory = await this.categoryRepository
      .createQueryBuilder('category')
      .where('category.translations->\'en\'->>\'name\' = :name OR category.translations->\'ru\'->>\'name\' = :name', {
        name: translations.en.name,
      })
      .getOne();

    if (existingCategory) {
      throw new BadRequestException(
        await this.i18n.translate('categories.category_exists', { args: { name: translations.en.name } }),
      );
    }

    const category = this.categoryRepository.create({
      translations,
      imageUrl,
      parts: parts ? await this.partRepository.findByIds(parts) : [],
    });

    const savedCategory = await this.categoryRepository.save(category);
    return {
      id: savedCategory.id,
      name: savedCategory.translations[lang]?.name || savedCategory.translations.en.name,
      description: savedCategory.translations[lang]?.description || savedCategory.translations.en.description,
      imageUrl: savedCategory.imageUrl,
      parts: savedCategory.parts,
    };
  }

  async findAll(lang: string = 'en') {
    const categories = await this.categoryRepository.find();
    if (!categories.length) {
      throw new NotFoundException(await this.i18n.translate('categories.no_categories'));
    }
    return categories.map(category => ({
      id: category.id,
      name: category.translations[lang]?.name || category.translations.en.name,
      description: category.translations[lang]?.description || category.translations.en.description,
      imageUrl: category.imageUrl,
      parts: category.parts,
    }));
  }

  async findOne(id: number, lang: string = 'en') {
    const category = await this.categoryRepository.findOne({ where: { id }, relations: ['parts'] });
    if (!category) {
      throw new NotFoundException(
        await this.i18n.translate('categories.category_not_found', { args: { id } }),
      );
    }
    return {
      id: category.id,
      name: category.translations[lang]?.name || category.translations.en.name,
      description: category.translations[lang]?.description || category.translations.en.description,
      imageUrl: category.imageUrl,
      parts: category.parts,
    };
  }

  async updateCategory(id: number, updateCategoryDto: UpdateCategoryDto, lang: string = 'en') {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(
        await this.i18n.translate('categories.category_not_found', { args: { id } }),
      );
    }

    if (updateCategoryDto.translations) {
      const existingCategory = await this.categoryRepository
        .createQueryBuilder('category')
        .where('category.id != :id AND (category.translations->\'en\'->>\'name\' = :name OR category.translations->\'ru\'->>\'name\' = :name)', {
          id,
          name: updateCategoryDto.translations.en?.name || category.translations.en.name,
        })
        .getOne();

      if (existingCategory) {
        throw new BadRequestException(
          await this.i18n.translate('categories.category_name_exists', {
            args: { name: updateCategoryDto.translations.en?.name || category.translations.en.name },
          }),
        );
      }

      category.translations = {
        en: {
          name: updateCategoryDto.translations.en?.name || category.translations.en.name,
          description: updateCategoryDto.translations.en?.description || category.translations.en.description,
        },
        ru: {
          name: updateCategoryDto.translations.ru?.name || category.translations.ru.name,
          description: updateCategoryDto.translations.ru?.description || category.translations.ru.description,
        },
      };
    }

    if (updateCategoryDto.imageUrl) {
      category.imageUrl = updateCategoryDto.imageUrl;
    }

    if (updateCategoryDto.parts) {
      category.parts = await this.partRepository.findByIds(updateCategoryDto.parts);
    }

    const updatedCategory = await this.categoryRepository.save(category);
    return {
      id: updatedCategory.id,
      name: updatedCategory.translations[lang]?.name || updatedCategory.translations.en.name,
      description: updatedCategory.translations[lang]?.description || updatedCategory.translations.en.description,
      imageUrl: updatedCategory.imageUrl,
      parts: updatedCategory.parts,
    };
  }
async remove(id: number) {
  const category = await this.categoryRepository.findOne({
    where: { id },
    relations: ['parts'], // ManyToMany aloqani chaqiryapmiz
  });

  if (!category) {
    throw new NotFoundException(
      await this.i18n.translate('categories.category_not_found', { args: { id } }),
    );
  }

  for (const part of category.parts) {
    part.categories = part.categories.filter((c) => c.id !== id);
    await this.partRepository.save(part);
  }

  await this.categoryRepository.remove(category);

  return {
    message: await this.i18n.translate('categories.category_delete_success'),
  };
}

}