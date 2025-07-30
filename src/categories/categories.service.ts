import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Part } from '../parts/entities/part.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Part)
    private readonly partRepository: Repository<Part>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const { translations, imageUrl, parts } = createCategoryDto;

    const existingCategory = await this.categoryRepository
      .createQueryBuilder('category')
      .where('category.translations->\'en\'->>\'name\' = :name OR category.translations->\'ru\'->>\'name\' = :name', {
        name: translations.en.name,
      })
      .getOne();

    if (existingCategory) {
      throw new BadRequestException(`Kategoriya ${translations.en.name} nomi bilan allaqachon mavjud`);
    }

    const category = this.categoryRepository.create({
      translations,
      imageUrl,
      parts: parts ? await this.partRepository.findByIds(parts) : [],
    });

    const savedCategory = await this.categoryRepository.save(category);

    return {
      id: savedCategory.id,
      translations: savedCategory.translations,
      imageUrl: savedCategory.imageUrl,
      parts: savedCategory.parts,
    };
  }

  async findAll() {
    const categories = await this.categoryRepository.find();
    if (!categories.length) {
      throw new NotFoundException('Hech qanday kategoriya topilmadi');
    }
    return categories.map(category => ({
      id: category.id,
      translations: category.translations,
      imageUrl: category.imageUrl,
      parts: category.parts,
    }));
  }

  async findOne(id: number) {
    const category = await this.categoryRepository.findOne({ where: { id }, relations: ['parts'] });
    if (!category) {
      throw new NotFoundException(`ID ${id} bilan kategoriya topilmadi`);
    }
    return {
      id: category.id,
      translations: category.translations,
      imageUrl: category.imageUrl,
      parts: category.parts,
    };
  }

  async updateCategory(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`ID ${id} bilan kategoriya topilmadi`);
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
        throw new BadRequestException(`Kategoriya ${updateCategoryDto.translations.en?.name || category.translations.en.name} nomi bilan allaqachon mavjud`);
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
      translations: updatedCategory.translations,
      imageUrl: updatedCategory.imageUrl,
      parts: updatedCategory.parts,
    };
  }

  async remove(id: number) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parts', 'parts.categories'],
    });

    if (!category) {
      throw new NotFoundException(`ID ${id} bilan kategoriya topilmadi`);
    }

    if (category.parts?.length) {
      for (const part of category.parts) {
        if (part.categories) {
          part.categories = part.categories.filter((c) => c.id !== id);
          await this.partRepository.save(part);
        }
      }
    }

    await this.categoryRepository.remove(category);

    return {
      message: 'Kategoriya muvaffaqiyatli o‘chirildi',
    };
  }
}