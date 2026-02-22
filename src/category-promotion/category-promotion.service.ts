import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CategoryPromotionCreateDto } from './dto/category-promotion-create.dto';
import { CategoryPromotionUpdateDto } from './dto/category-promotion-update.dto';
import { CategoryPromotionTranslate } from './entities/category-promotion-translate.entity';
import { CategoryPromotiontCreateTranslateDto } from './dto/category-promotion-create-translate.dto';
import { CategoryPromotionUpdateTranslateDto } from './dto/category-promotion-update-translate.dto';
import { LANG } from 'src/common/enums/translation.enum';
import { applyTranslations } from 'src/common/utils/apply-translates.util';
import { CategoryPromotion } from './entities/category-promotion.entity';
import { Category } from 'src/category/entities/category.entity';

@Injectable()
export class CategoryPromotionService {
  private readonly logger = new Logger(CategoryPromotionService.name);

  constructor(
    @InjectRepository(CategoryPromotion)
    private readonly categoryPromotionRepo: Repository<CategoryPromotion>,
    @InjectRepository(CategoryPromotionTranslate)
    private readonly entityTranslateRepo: Repository<CategoryPromotionTranslate>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async findOne(id: number, lang: LANG): Promise<CategoryPromotion | null> {
    const entity = await this.categoryPromotionRepo.findOne({
      where: { id },
      relations: ['translates', 'categories'],
    });

    if (!entity) throw new NotFoundException('category promotion is NOT_FOUND');

    const mappedEntity = applyTranslations([entity], lang);

    return mappedEntity[0];
  }

  async findAll(
    take: number,
    skip: number,
    lang: LANG,
  ): Promise<{ entities: CategoryPromotion[]; count: number }> {
    const entities = await this.categoryPromotionRepo.find({
      take,
      skip,
      order: { created_at: 'DESC' },
      relations: ['translates', 'categories'],
    });

    const mappedEntities = applyTranslations(entities, lang);

    const count = await this.categoryPromotionRepo.count();

    return { entities: mappedEntities, count };
  }

  async findAllList(lang: LANG): Promise<{ entities: CategoryPromotion[] }> {
    const entities = await this.categoryPromotionRepo.find({
      order: { created_at: 'DESC' },
      relations: ['translates', 'categories'],
    });

    const mappedEntities = applyTranslations(entities, lang);

    return { entities: mappedEntities };
  }

  async create(dto: CategoryPromotionCreateDto): Promise<CategoryPromotion> {
    const { categories = [], ...rest } = dto;

    const data = this.categoryPromotionRepo.create(rest);

    if (Array.isArray(categories) && categories.length) {
      const list = await this.categoryRepo.find({
        where: { id: In(categories) },
      });

      if (!list.length) {
        throw new NotFoundException('category promotion is NOT_FOUND');
      }

      data.categories = list;
    } else {
      data.categories = [];
    }

    try {
      return await this.categoryPromotionRepo.save(data);
    } catch (err) {
      this.logger.error(`Error while creating category promotion: ${err}`);
      throw new BadRequestException('category promotion is NOT_CREATED');
    }
  }

  async update(id: number, dto: CategoryPromotionUpdateDto): Promise<CategoryPromotion | null> {
    const { categories, ...rest } = dto;

    const entity = await this.categoryPromotionRepo.findOne({
      where: { id },
      relations: ['categories'],
    });

    if (!entity) throw new NotFoundException('category promotion is NOT_FOUND');

    if (categories) {
      let list: Category[] = [];

      if (categories.length) {
        list = await this.categoryRepo.find({
          where: { id: In(categories) },
        });
      }

      if (list.length) {
        entity.categories = list;
      } else {
        throw new NotFoundException('category promotion is NOT_FOUND');
      }
    }

    Object.assign(entity, rest);

    try {
      return await this.categoryPromotionRepo.save(entity);
    } catch (err) {
      this.logger.error(`Error while updating category promotion: ${err}`);
      throw new BadRequestException('category promotion is NOT_UPDATED');
    }
  }

  async delete(id: number): Promise<{ message: string }> {
    try {
      const result = await this.categoryPromotionRepo.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException('category promotion is NOT_FOUND');
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes('foreign key')) {
        throw new BadRequestException('category promotion HAS_CHILDS');
      }

      this.logger.error(`Error while deleting category-promotion \n ${err}`);
      throw err;
    }

    return { message: 'SUCCESS' };
  }

  async createTranslates(
    dto: CategoryPromotiontCreateTranslateDto[],
  ): Promise<CategoryPromotionTranslate[] | null> {
    if (dto?.length) {
      const results: CategoryPromotionTranslate[] = [];

      for (const translate of dto) {
        const data = this.entityTranslateRepo.create(translate);
        const result = await this.entityTranslateRepo.save(data);
        results.push(result);
      }

      return results;
    }
    return null;
  }

  async updateTranslates(
    dto: CategoryPromotionUpdateTranslateDto[],
  ): Promise<CategoryPromotionTranslate[] | null> {
    const results: CategoryPromotionTranslate[] = [];

    for (const translate of dto) {
      const result = await this.entityTranslateRepo.update(translate.id, {
        ...translate,
      });

      if (result.affected === 0)
        throw new NotFoundException('category promotion translate is NOT_FOUND');

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
      throw new NotFoundException('category promotion transalte is NOT_FOUND');
    }

    return { message: 'SUCCESS' };
  }
}
