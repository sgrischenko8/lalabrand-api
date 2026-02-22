import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs-extra';
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from 'src/category/entities/category.entity';
import { CategoryCreateDto } from './dto/category-create.dto';
import { CategoryUpdateDto } from './dto/category-update.dto';
import { CategoryTranslate } from './entities/category-translate.entity';
import { CategoryCreateTranslateDto } from './dto/category-create-translate.dto';
import { CategoryUpdateTranslateDto } from './dto/category-update-translate.dto';
import { CategoryCreateImageDto } from './dto/category-create-image.dto';
import { CategoryImage } from './entities/category-image.entity';
import { LANG } from 'src/common/enums/translation.enum';
import { applyTranslations } from 'src/common/utils/apply-translates.util';
import { calcRating } from 'src/common/utils/apply-rating';
import { Request } from 'express';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(CategoryTranslate)
    private readonly entityTranslateRepo: Repository<CategoryTranslate>,
    @InjectRepository(CategoryImage)
    private readonly entityImageRepo: Repository<CategoryImage>,
  ) {}

  async findOne(id: number, lang: LANG): Promise<Category | null> {
    const entity = await this.categoryRepo.findOne({
      where: { id },
      relations: ['images', 'translates', 'promotion_id', 'promotion_id.translates'],
    });

    if (!entity) throw new NotFoundException('category is NOT_FOUND');

    const mappedEntity = applyTranslations([entity], lang);

    if (mappedEntity[0]?.promotion_id) {
      const [translatedPromotion] = applyTranslations([mappedEntity[0].promotion_id], lang);
      mappedEntity[0].promotion_id = translatedPromotion;
    }

    return mappedEntity[0];
  }

  async create(dto: CategoryCreateDto): Promise<Category> {
    const data = this.categoryRepo.create(dto);

    try {
      return await this.categoryRepo.save(data);
    } catch (err) {
      this.logger.error(`Error while creating category ${err}`);
      throw new BadRequestException('category is NOT_CREATED');
    }
  }

  async findAllList(lang: LANG): Promise<{ entities: Category[] }> {
    const entities = await this.categoryRepo.find({
      order: { created_at: 'DESC' },
      relations: ['products', 'images', 'translates', 'promotion_id', 'promotion_id.translates'],
    });

    const mappedEntities = applyTranslations(entities, lang);

    for (const category of mappedEntities) {
      if (category.promotion_id) {
        const [translatedPromotion] = applyTranslations([category.promotion_id], lang);
        category.promotion_id = translatedPromotion;
      }
    }

    return { entities: mappedEntities };
  }

  async findInShowRoom(lang: LANG): Promise<{ entities: Category[] }> {
    const entities = await this.categoryRepo.find({
      where: { show_on_main_page: true },
      order: { created_at: 'DESC' },
      relations: [
        'images',
        'translates',
        'promotion_id',
        'promotion_id.translates',
        'products',
        'products.ratings',
        'products.translates',
      ],
    });

    const mappedEntities = applyTranslations(entities, lang);

    for (const category of mappedEntities) {
      if (category.promotion_id) {
        const [translatedPromotion] = applyTranslations([category.promotion_id], lang);
        category.promotion_id = translatedPromotion;
      }
      if (category.products?.length) {
        category.products = calcRating(category.products.slice(0, 20)) as typeof category.products;
      }
    }

    return { entities: mappedEntities };
  }

  async findAll(
    take: number,
    skip: number,
    lang: LANG,
  ): Promise<{ entities: Category[]; count: number }> {
    const entities = await this.categoryRepo.find({
      take,
      skip,
      order: { created_at: 'DESC' },
      relations: ['translates', 'images', 'promotion_id', 'promotion_id.translates'],
    });

    const mappedEntities = applyTranslations(entities, lang);

    for (const category of mappedEntities) {
      if (category.promotion_id) {
        const [translatedPromotion] = applyTranslations([category.promotion_id], lang);
        category.promotion_id = translatedPromotion;
      }
    }

    const count = await this.categoryRepo.count();

    return { entities: mappedEntities, count };
  }

  async update(id: number, dto: CategoryUpdateDto): Promise<Category | null> {
    const result = await this.categoryRepo.update(id, { ...dto });

    if (result.affected === 0) throw new NotFoundException('category is NOT_FOUND');

    const updatedCategory = await this.categoryRepo.findOne({
      where: { id },
    });

    return updatedCategory;
  }

  async delete(id: number): Promise<{ message: string }> {
    try {
      const result = await this.categoryRepo.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException('category is NOT_FOUND');
      } else {
        await this.deleteImages(id);
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('foreign key')) {
        throw new BadRequestException('category HAS_CHILDS');
      }

      this.logger.error(`Error while deleting category \n ${err}`);
      throw err;
    }

    return { message: 'SUCCESS' };
  }

  async createTranslates(dto: CategoryCreateTranslateDto[]): Promise<CategoryTranslate[] | null> {
    if (dto?.length) {
      const results: CategoryTranslate[] = [];

      for (const translate of dto) {
        const data = this.entityTranslateRepo.create(translate);
        const result = await this.entityTranslateRepo.save(data);
        results.push(result);
      }

      return results;
    }
    return null;
  }

  async updateTranslates(dto: CategoryUpdateTranslateDto[]): Promise<CategoryTranslate[] | null> {
    const results: CategoryTranslate[] = [];

    for (const translate of dto) {
      const result = await this.entityTranslateRepo.update(translate.id, {
        ...translate,
      });

      if (result.affected === 0) throw new NotFoundException('category translate is NOT_FOUND');

      const updatedEntityTranslate = await this.entityTranslateRepo.findOne({
        where: { id: translate.id },
      });

      if (updatedEntityTranslate) results.push(updatedEntityTranslate);
    }

    return results;
  }

  async deleteTranslate(id: number): Promise<{ message: string } | NotFoundException> {
    const result = await this.entityTranslateRepo.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('category translate is NOT_FOUND');
    }

    return { message: 'OK' };
  }

  async createImage(dto: CategoryCreateImageDto): Promise<CategoryImage> {
    const entity_id = typeof dto.entity_id === 'number' ? { id: dto.entity_id } : dto.entity_id;

    const newImage = this.entityImageRepo.create({
      ...dto,
      entity_id,
    });
    return await this.entityImageRepo.save(newImage);
  }

  async uploadImages(
    files: Express.Multer.File[],
    entity_id: number,
  ): Promise<{ message: string }> {
    const fileName = `${Date.now()}.webp`;

    const isCategoryExist = await this.categoryRepo.findOne({
      where: { id: entity_id },
    });

    if (!isCategoryExist) new NotFoundException('category is NOT_FOUND');

    const uploadDir = path.join(process.cwd(), 'uploads', 'category');
    await fs.ensureDir(uploadDir);

    const outputFilePath = path.join(uploadDir, fileName);

    for (const file of files) {
      try {
        await sharp(file.buffer).avif().toFile(outputFilePath);

        const body: CategoryCreateImageDto = {
          custom_id: '',
          name: fileName,
          path: outputFilePath,
          entity_id: entity_id,
        };

        try {
          await this.createImage(body);
        } catch (err) {
          this.logger.warn(`Error to create image for entity_id: ${entity_id}: ${err}`);
          throw new BadRequestException('category image is NOT_CREATED');
        }
      } catch (err) {
        this.logger.warn(`Error to upload file ${fileName}: ${err}`);
        throw new BadRequestException('category image is NOT_UPLOADED');
      }
    }

    return {
      message: 'Images saved',
    };
  }

  async deleteImage(id: number): Promise<void> {
    const image = await this.entityImageRepo.findOne({ where: { id } });

    if (!image) throw new NotFoundException('category image is NOT_FOUND');

    try {
      if (fs.existsSync(image.path)) {
        fs.unlinkSync(image.path);
      } else {
        this.logger.warn(`File at path ${image.path} does not exist`);
      }
    } catch (err) {
      this.logger.error(`Failed to delete file at path ${image.path}: ${err}`);
    }

    await this.entityImageRepo.delete(id);
  }

  async deleteImages(entity_id: number): Promise<{ message: string } | void> {
    const deleteCandidates = await this.entityImageRepo.find({
      where: { entity_id: { id: entity_id } },
    });

    if (deleteCandidates?.length) {
      const filePathList = deleteCandidates.map((field) => field.path);

      for (const filePath of filePathList) {
        try {
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          } else {
            this.logger.warn(`File at path ${filePath} does not exist`);
          }
        } catch (err) {
          this.logger.error(`Failed to delete file at path ${filePath}: ${err}`);
        }
      }
    }
  }
}
