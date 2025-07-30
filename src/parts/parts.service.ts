import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Part } from './entities/part.entity';
import { CreatePartDto } from './dto/create-part.dto';
import { UpdatePartDto } from './dto/update-part.dto';
import { Category } from '../categories/entities/category.entity';
import * as path from 'path';
import * as fs from 'fs';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

@Injectable()
export class PartsService {
  constructor(
    @InjectRepository(Part)
    private readonly partsRepository: Repository<Part>,
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {
    const uploadDir = join(__dirname, '..', 'Uploads');
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir);
    }
  }

  async handleFileUpload(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Rasm yuklanmadi');
    }
    const fileUrl = `https://car-parts-1.onrender.com/products/uploads/${file.filename}`;
    return { message: 'Rasm muvaffaqiyatli yuklandi', fileUrl };
  }

  async create(createPartDto: CreatePartDto) {
    const existingPart = await this.partsRepository.findOne({
      where: { trtCode: createPartDto.trtCode },
    });

    if (existingPart) {
      throw new BadRequestException(`TRT kodi ${createPartDto.trtCode} bilan qism allaqachon mavjud`);
    }

    const categories = createPartDto.categories
      ? await this.categoriesRepository.findByIds(createPartDto.categories)
      : [];

    if (createPartDto.categories && (!categories || categories.length === 0)) {
      throw new NotFoundException('Kategoriya topilmadi');
    }

    const part = this.partsRepository.create({
      ...createPartDto,
      categories,
    });

    const savedPart = await this.partsRepository.save(part);

    return {
      id: savedPart.id,
      sku: savedPart.sku,
      translations: savedPart.translations,
      images: savedPart.images,
      carName: savedPart.carName,
      model: savedPart.model,
      oem: savedPart.oem,
      years: savedPart.years,
      imageUrl: savedPart.imageUrl,
      trtCode: savedPart.trtCode,
      brand: savedPart.brand,
      categories: savedPart.categories.map(category => ({
        id: category.id,
        translations: category.translations,
        imageUrl: category.imageUrl,
      })),
    };
  }

  async findAll() {
    const parts = await this.partsRepository.find({
      relations: ['categories'],
      order: { id: 'ASC' },
    });

    if (!parts.length) {
      throw new NotFoundException('Hech qanday qism topilmadi');
    }

    return parts.map(part => ({
      id: part.id,
      sku: part.sku,
      translations: part.translations,
      images: part.images,
      carName: part.carName,
      model: part.model,
      oem: part.oem,
      years: part.years,
      imageUrl: part.imageUrl,
      trtCode: part.trtCode,
      brand: part.brand,
      categories: part.categories.map(category => ({
        id: category.id,
        translations: category.translations,
        imageUrl: category.imageUrl,
      })),
    }));
  }

  async findOne(id: number) {
    const part = await this.partsRepository.findOne({ where: { id }, relations: ['categories'] });
    if (!part) {
      throw new NotFoundException(`ID ${id} bilan qism topilmadi`);
    }
    return {
      id: part.id,
      sku: part.sku,
      translations: part.translations,
      images: part.images,
      carName: part.carName,
      model: part.model,
      oem: part.oem,
      years: part.years,
      imageUrl: part.imageUrl,
      trtCode: part.trtCode,
      brand: part.brand,
      categories: part.categories.map(category => ({
        id: category.id,
        translations: category.translations,
        imageUrl: category.imageUrl,
      })),
    };
  }

  async update(id: number, updatePartDto: UpdatePartDto) {
    const part = await this.partsRepository.findOne({
      where: { id },
      relations: ['categories'],
    });

    if (!part) {
      throw new NotFoundException(`ID ${id} bilan qism topilmadi`);
    }

    if (updatePartDto.translations) {
      part.translations = {
        en: {
          name: updatePartDto.translations.en?.name || part.translations.en.name,
        },
        ru: {
          name: updatePartDto.translations.ru?.name || part.translations.ru.name,
        },
      };
    }

    part.sku = updatePartDto.sku || part.sku;
    part.images = updatePartDto.images || part.images;
    part.carName = updatePartDto.carName || part.carName;
    part.model = updatePartDto.model || part.model;
    part.oem = updatePartDto.oem || part.oem;
    part.years = updatePartDto.years || part.years;
    part.imageUrl = updatePartDto.imageUrl || part.imageUrl;
    part.trtCode = updatePartDto.trtCode || part.trtCode;
    part.brand = updatePartDto.brand || part.brand;

    if (updatePartDto.categories) {
      part.categories = await this.categoriesRepository.findByIds(updatePartDto.categories);
    }

    const updatedPart = await this.partsRepository.save(part);
    return {
      id: updatedPart.id,
      sku: updatedPart.sku,
      translations: updatedPart.translations,
      images: updatedPart.images,
      carName: updatedPart.carName,
      model: updatedPart.model,
      oem: updatedPart.oem,
      years: updatedPart.years,
      imageUrl: updatedPart.imageUrl,
      trtCode: updatedPart.trtCode,
      brand: updatedPart.brand,
      categories: updatedPart.categories.map(category => ({
        id: category.id,
        translations: category.translations,
        imageUrl: category.imageUrl,
      })),
    };
  }

  async remove(id: number) {
    const existingPart = await this.partsRepository.findOne({ where: { id } });
    if (!existingPart) {
      throw new NotFoundException(`ID ${id} bilan qism topilmadi`);
    }
    await this.partsRepository.delete(id);
    return { message: 'Qism muvaffaqiyatli o‘chirildi' };
  }

  async getPartsByCategory(categoryId: number) {
    const category = await this.categoriesRepository.findOne({
      where: { id: categoryId },
      relations: ['parts'],
    });

    if (!category) {
      throw new NotFoundException('Kategoriya topilmadi');
    }

    return {
      category: {
        id: category.id,
        translations: category.translations,
        imageUrl: category.imageUrl,
      },
      parts: category.parts.map(part => ({
        id: part.id,
        sku: part.sku,
        translations: part.translations,
        images: part.images,
        carName: part.carName,
        model: part.model,
        oem: part.oem,
        years: part.years,
        imageUrl: part.imageUrl,
        trtCode: part.trtCode,
        brand: part.brand,
      })),
    };
  }

  async getAllOem() {
    const distinctOems = await this.partsRepository
      .createQueryBuilder('part')
      .select('DISTINCT part.oem')
      .getRawMany();

    return distinctOems.map((oem) => oem.oem).filter(Boolean);
  }

  async getOemId(oem: string) {
    const trts = await this.partsRepository
      .createQueryBuilder('part')
      .select('DISTINCT part.trtCode')
      .where('part.oem = :oem', { oem })
      .getRawMany();
    return trts.map((trt) => trt.trtCode);
  }

  async getTrtCode(trt: string) {
    const brands = await this.partsRepository
      .createQueryBuilder('part')
      .select('DISTINCT part.brand')
      .where('part.trtCode = :trt', { trt })
      .getRawMany();
    return brands.map((brand) => brand.brand);
  }

  async getBrand(brand: string) {
    const models = await this.partsRepository
      .createQueryBuilder('part')
      .select('DISTINCT part.model')
      .where('part.brand = :brand', { brand })
      .getRawMany();
    return models.map((model) => model.model).filter(Boolean);
  }

  async search(oem: string, trt: string, brand: string, model: string) {
    const queryBuilder = this.partsRepository.createQueryBuilder('part');

    if (oem) queryBuilder.andWhere('LOWER(part.oem) = LOWER(:oem)', { oem: oem.toLowerCase() });
    if (trt) queryBuilder.andWhere('LOWER(part.trtCode) = LOWER(:trt)', { trt: trt.toLowerCase() });
    if (brand) queryBuilder.andWhere('LOWER(part.brand) = LOWER(:brand)', { brand: brand.toLowerCase() });
    if (model) queryBuilder.andWhere('LOWER(part.model) = LOWER(:model)', { model: model.toLowerCase() });

    const parts = await queryBuilder.getMany();
    return parts.map(part => ({
      id: part.id,
      sku: part.sku,
      translations: part.translations,
      images: part.images,
      carName: part.carName,
      model: part.model,
      oem: part.oem,
      years: part.years,
      imageUrl: part.imageUrl,
      trtCode: part.trtCode,
      brand: part.brand,
      categories: part.categories.map(category => ({
        id: category.id,
        translations: category.translations,
        imageUrl: category.imageUrl,
      })),
    }));
  }

  async getCategories() {
    const categories = await this.categoriesRepository.find();
    if (categories.length === 0) {
      throw new NotFoundException('Kategoriyalar topilmadi');
    }
    return categories.map(category => ({
      id: category.id,
      translations: category.translations,
      imageUrl: category.imageUrl,
    }));
  }

  async searchByName(name: string) {
    const parts = await this.partsRepository
      .createQueryBuilder('part')
      .where('LOWER(part.translations->>\'en\'->>\'name\') LIKE LOWER(:name) OR LOWER(part.translations->>\'ru\'->>\'name\') LIKE LOWER(:name)', {
        name: `%${name.toLowerCase()}%`,
      })
      .getMany();

    if (parts.length === 0) {
      throw new NotFoundException(`Nomi ${name} bilan qism topilmadi`);
    }

    return parts.map(part => ({
      id: part.id,
      sku: part.sku,
      translations: part.translations,
      images: part.images,
      carName: part.carName,
      model: part.model,
      oem: part.oem,
      years: part.years,
      imageUrl: part.imageUrl,
      trtCode: part.trtCode,
      brand: part.brand,
      categories: part.categories.map(category => ({
        id: category.id,
        translations: category.translations,
        imageUrl: category.imageUrl,
      })),
    }));
  }

  async getTotalCount() {
    const totalCount = await this.partsRepository.count();
    return { total: totalCount };
  }

  async getImagePath(imageName: string): Promise<string | null> {
    if (!imageName) {
      return null;
    }
    const imagePath = path.join(__dirname, '..', '..', 'Uploads', imageName);
    if (fs.existsSync(imagePath)) {
      return imagePath;
    }
    throw new NotFoundException('Rasm topilmadi');
  }
}