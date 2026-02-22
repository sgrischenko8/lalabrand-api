import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs-extra';
import { BadRequestException, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { In, Not, Repository } from 'typeorm';
import { ProductCreateDto } from 'src/product/dto/product-create.dto';
import { ProductUpdateDto } from 'src/product/dto/product-update.dto';
import { ProductParametersDto } from './dto/product-parameters.dto';
import { Parameter } from 'src/parameter/entities/parameter.entity';
import { applyTranslations } from 'src/common/utils/apply-translates.util';
import { LANG } from 'src/common/enums/translation.enum';
import { ProductCreateTranslateDto } from './dto/product-create-translate.dto';
import { ProductTranslate } from './entities/product-translate.entity';
import { ProductUpdateTranslateDto } from './dto/product-update-translate.dto';
import { ProductCreateImageDto } from './dto/product-create-image.dto';
import { ProductImage } from './entities/product-image.entity';
import { ProductUploadImageDto } from './dto/product-upload-image.dto';
import { calcRating, ProductWithoutRatings } from 'src/common/utils/apply-rating';
import { Request } from 'express';
import { SORT_BY } from 'src/common/enums/products.enum';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Parameter) private parameterRepo: Repository<Parameter>,
    @InjectRepository(ProductTranslate)
    private entityTranslateRepo: Repository<ProductTranslate>,
    @InjectRepository(ProductImage)
    private entityImageRepo: Repository<ProductImage>,
  ) {}

  async searchByTitle(
    query: string,
    lang: LANG,
  ): Promise<{
    entities: ProductWithoutRatings[];
    restCount: number;
    categories: { id: number; title: string }[];
  }> {
    let entities = await this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.translates', 'translates')
      .leftJoinAndSelect('product.category_id', 'category_id')
      .leftJoinAndSelect('product.promotion_id', 'promotion_id')
      .leftJoinAndSelect('product.images', 'images')
      .where('LOWER(product.title) LIKE :title', {
        title: `%${query.toLowerCase()}%`,
      })
      .orderBy('product.created_at', 'DESC')
      .take(5)
      .getMany();

    if (!entities.length) {
      entities = await this.productRepo
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.translates', 'translates')
        .leftJoinAndSelect('product.category_id', 'category_id')
        .leftJoinAndSelect('product.promotion_id', 'promotion_id')
        .leftJoinAndSelect('product.images', 'images')
        .where('LOWER(translates.value) LIKE :title', {
          title: `%${query.toLowerCase()}%`,
        })
        .andWhere('translates.field = :field', { field: 'title' })
        .orderBy('product.created_at', 'DESC')
        .take(5)
        .getMany();
    }

    const restCount = Math.max(
      (await this.productRepo
        .createQueryBuilder('product')
        .leftJoin('product.translates', 'translates')
        .where('LOWER(translates.value) LIKE :title', {
          title: `%${query.toLowerCase()}%`,
        })
        .andWhere('translates.field = :field', { field: 'title' })
        .getCount()) - entities.length,
      0,
    );

    const categories = [
      ...new Map(
        entities
          .filter((e) => e.category_id)
          .map((e) => [e.category_id.id, { id: e.category_id.id, title: e.category_id.title }]),
      ).values(),
    ];

    const mappedEntitiesWithRating = calcRating(entities);
    const mappedEntities = applyTranslations(mappedEntitiesWithRating, lang);

    for (const product of mappedEntities) {
      if (product.category_id && product.category_id.translates) {
        product.category_id = applyTranslations([product.category_id], lang)[0];
      }

      if (product.measurement_id && product.measurement_id.translates) {
        product.measurement_id = applyTranslations([product.measurement_id], lang)[0];
      }

      if (product.parameters && Array.isArray(product.parameters)) {
        product.parameters = product.parameters.map((param) =>
          param && param.translates ? applyTranslations([param], lang)[0] : param,
        );
      }
    }

    return {
      entities: mappedEntities,
      restCount,
      categories,
    };
  }

  async findPromotedOnMainPage(lang: LANG): Promise<ProductWithoutRatings[]> {
    const products = await this.productRepo.find({
      relations: [
        'category_id',
        'category_id.translates',
        'images',
        'translates',
        'parameters',
        'parameters.translates',
        'measurement_id',
        'measurement_id.translates',
        'brand_id',
        'promotion_id',
        'promotion_id.translates',
        'stock',
        'ratings',
      ],
      where: {
        promotion_id: {
          show_on_main_page: true,
        },
      },
    });

    const mappedEntitiesWithRating = calcRating(products);
    const mappedEntities = applyTranslations(mappedEntitiesWithRating, lang);

    for (const product of mappedEntities) {
      if (product.measurement_id && product.measurement_id.translates) {
        product.measurement_id = applyTranslations([product.measurement_id], lang)[0];
      }

      if (product.category_id && product.category_id.translates) {
        product.category_id = applyTranslations([product.category_id], lang)[0];
      }

      if (product.parameters && Array.isArray(product.parameters)) {
        product.parameters = product.parameters.map((param) =>
          param && param.translates ? applyTranslations([param], lang)[0] : param,
        );
      }

      if (product.promotion_id && product.promotion_id.translates) {
        product.promotion_id = applyTranslations([product.promotion_id], lang)[0];
      }
    }

    return mappedEntities;
  }

  async find(
    take: number,
    skip: number,
    lang: LANG,
  ): Promise<{ entities: ProductWithoutRatings[]; count: number }> {
    const entities = await this.productRepo.find({
      take,
      skip,
      order: { created_at: 'DESC' },
      relations: [
        'category_id',
        'category_id.translates',
        'images',
        'translates',
        'parameters',
        'parameters.translates',
        'measurement_id',
        'measurement_id.translates',
        'brand_id',
        'brand_id.translates',
        'ratings',
        'promotion_id',
        'promotion_id.translates',
        'stock',
      ],
    });

    const mappedEntitiesWithRating = calcRating(entities);
    let mappedEntities = applyTranslations(mappedEntitiesWithRating, lang);

    mappedEntities = mappedEntities.map((product) => {
      if (product.category_id && product.category_id.translates) {
        product.category_id = applyTranslations([product.category_id], lang)[0];
      }

      if (product.measurement_id && product.measurement_id.translates) {
        product.measurement_id = applyTranslations([product.measurement_id], lang)[0];
      }

      if (product.brand_id && product.brand_id.translates) {
        product.brand_id = applyTranslations([product.brand_id], lang)[0];
      }

      if (product.promotion_id && product.promotion_id.translates) {
        product.promotion_id = applyTranslations([product.promotion_id], lang)[0];
      }

      if (product.parameters && Array.isArray(product.parameters)) {
        product.parameters = product.parameters.map((param) =>
          param && param.translates ? applyTranslations([param], lang)[0] : param,
        );
      }

      return product;
    });

    const count = await this.productRepo.count();

    return { entities: mappedEntities, count };
  }

  async filter(
    categories: string,
    parameters: string,
    take: number,
    skip: number,
    sortBy: SORT_BY,
    lang: LANG,
  ) {
    const mappedCategories = categories.trim().length
      ? categories.split(',').map((item) => Number(item))
      : [];
    const mappedParameters = parameters.trim().length
      ? parameters.split(',').map((item) => Number(item))
      : [];

    const queryBuilder = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.brand_id', 'brand_id')
      .leftJoinAndSelect('brand_id.translates', 'brand_translates')
      .leftJoinAndSelect('product.measurement_id', 'measurement_id')
      .leftJoinAndSelect('measurement_id.translates', 'measurement_translates')
      .leftJoinAndSelect('product.category_id', 'category_id')
      .leftJoinAndSelect('category_id.translates', 'category_translates')
      .leftJoinAndSelect('product.parameters', 'parameters')
      .leftJoinAndSelect('parameters.translates', 'parameter_translates')
      .leftJoinAndSelect('product.images', 'images')
      .leftJoinAndSelect('product.translates', 'translates')
      .leftJoinAndSelect('product.stock', 'stock')
      .leftJoinAndSelect('product.promotion_id', 'promotion_id')
      .leftJoinAndSelect('promotion_id.translates', 'promotion_translates')
      .leftJoinAndSelect('product.ratings', 'ratings')
      .andWhere('product.is_hidden = :isHidden', { isHidden: false })
      .take(take)
      .skip(skip);

    if (mappedCategories.length > 0) {
      queryBuilder.andWhere('product.category_id IN (:...categories)', {
        categories: mappedCategories,
      });
    }

    if (mappedParameters.length > 0) {
      queryBuilder.andWhere('parameters.id IN (:...parameters)', {
        parameters: mappedParameters,
      });
    }

    if (sortBy === SORT_BY.PRICE_ASC || sortBy === SORT_BY.PRICE_DESC) {
      queryBuilder.addSelect(
        `
        CASE 
          WHEN product.promotion_id IS NOT NULL AND promotion_id.discount IS NOT NULL
            THEN (product.price - (product.price * promotion_id.discount / 100))
          ELSE product.price
        END`,
        'final_price',
      );
      queryBuilder.orderBy('final_price', sortBy === SORT_BY.PRICE_ASC ? 'ASC' : 'DESC');
    } else if (sortBy === SORT_BY.RATING_ASC || sortBy === SORT_BY.RATING_DESC) {
      queryBuilder.addSelect('COALESCE(AVG(ratings.rating), 0)', 'avg_rating');
      queryBuilder.groupBy('product.id');
      queryBuilder.addGroupBy('category_id.id');
      queryBuilder.addGroupBy('brand_id.id');
      queryBuilder.addGroupBy('measurement_id.id');
      queryBuilder.addGroupBy('promotion_id.id');
      queryBuilder.addGroupBy('category_translates.id');
      queryBuilder.addGroupBy('brand_translates.id');
      queryBuilder.addGroupBy('measurement_translates.id');
      queryBuilder.addGroupBy('promotion_translates.id');
      queryBuilder.addGroupBy('images.id');
      queryBuilder.addGroupBy('translates.id');
      queryBuilder.addGroupBy('parameters.id');
      queryBuilder.addGroupBy('parameter_translates.id');
      queryBuilder.addGroupBy('stock.id');
      queryBuilder.addGroupBy('ratings.id');
      queryBuilder.orderBy('avg_rating', sortBy === SORT_BY.RATING_ASC ? 'ASC' : 'DESC');
    } else {
      queryBuilder.orderBy('product.created_at', 'DESC');
    }

    const [entities, count] = await queryBuilder.getManyAndCount();

    const mappedEntitiesWithRating = calcRating(entities);
    let mappedEntities = applyTranslations(mappedEntitiesWithRating, lang);

    mappedEntities = mappedEntities.map((product) => {
      if (product.category_id && product.category_id.translates) {
        product.category_id = applyTranslations([product.category_id], lang)[0];
      }

      if (product.measurement_id && product.measurement_id.translates) {
        product.measurement_id = applyTranslations([product.measurement_id], lang)[0];
      }

      if (product.brand_id && product.brand_id.translates) {
        product.brand_id = applyTranslations([product.brand_id], lang)[0];
      }

      if (product.promotion_id && product.promotion_id.translates) {
        product.promotion_id = applyTranslations([product.promotion_id], lang)[0];
      }

      if (product.parameters && Array.isArray(product.parameters)) {
        product.parameters = product.parameters.map((param) =>
          param && param.translates ? applyTranslations([param], lang)[0] : param,
        );
      }

      return product;
    });

    return { entities: mappedEntities, count };
  }

  async findMany(ids: number[], lang: LANG): Promise<Product[]> {
    const products = await this.productRepo.find({
      where: { id: In(ids) },
      relations: [
        'category_id',
        'parent_id',
        'images',
        'translates',
        'parameters',
        'parameters.translates',
        'measurement_id',
        'measurement_id.translates',
        'brand_id',
        'brand_id.translates',
        'promotion_id',
        'promotion_id.translates',
        'stock',
      ],
    });

    if (!products.length) throw new NotFoundException('product is NOT_FOUND');

    let mappedProducts = applyTranslations(products, lang);

    mappedProducts = mappedProducts.map((prod) => {
      if (prod.category_id && prod.category_id.translates) {
        prod.category_id = applyTranslations([prod.category_id], lang)[0];
      }

      if (prod.measurement_id && prod.measurement_id.translates) {
        prod.measurement_id = applyTranslations([prod.measurement_id], lang)[0];
      }

      if (prod.brand_id && prod.brand_id.translates) {
        prod.brand_id = applyTranslations([prod.brand_id], lang)[0];
      }

      if (prod.promotion_id && prod.promotion_id.translates) {
        prod.promotion_id = applyTranslations([prod.promotion_id], lang)[0];
      }

      if (prod.parameters && Array.isArray(prod.parameters)) {
        prod.parameters = prod.parameters.map((param) =>
          param && param.translates ? applyTranslations([param], lang)[0] : param,
        );
      }

      return prod;
    });

    return mappedProducts;
  }

  async findOne(id: number, lang: LANG, req: Request): Promise<Product> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: [
        'category_id',
        'parent_id',
        'images',
        'translates',
        'parameters',
        'parameters.translates',
        'measurement_id',
        'measurement_id.translates',
        'brand_id',
        'brand_id.translates',
        'promotion_id',
        'promotion_id.translates',
        'stock',
      ],
    });

    if (!product) throw new NotFoundException('product is NOT_FOUND');

    if (req?.session) {
      if (!Array.isArray(req.session.products)) {
        req.session.products = [];
      }
      if (!req.session.products.includes(id)) {
        req.session.products.push(id);
      }
    }

    let mappedProduct = applyTranslations([product], lang);

    mappedProduct = mappedProduct.map((prod) => {
      if (prod.category_id && prod.category_id.translates) {
        prod.category_id = applyTranslations([prod.category_id], lang)[0];
      }

      if (prod.measurement_id && prod.measurement_id.translates) {
        prod.measurement_id = applyTranslations([prod.measurement_id], lang)[0];
      }

      if (prod.brand_id && prod.brand_id.translates) {
        prod.brand_id = applyTranslations([prod.brand_id], lang)[0];
      }

      if (prod.promotion_id && prod.promotion_id.translates) {
        prod.promotion_id = applyTranslations([prod.promotion_id], lang)[0];
      }

      if (prod.parameters && Array.isArray(prod.parameters)) {
        prod.parameters = prod.parameters.map((param) =>
          param && param.translates ? applyTranslations([param], lang)[0] : param,
        );
      }

      return prod;
    });

    return mappedProduct[0];
  }

  async findSimilar(id: number, lang: LANG): Promise<ProductWithoutRatings[]> {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: [
        'category_id',
        'brand_id',
        'parameters',
        'parameters.translates',
        'category_id.translates',
        'brand_id.translates',
      ],
    });

    if (!product) throw new NotFoundException('product is NOT_FOUND');

    const similarProducts = await this.productRepo.find({
      where: {
        category_id: { id: product.category_id?.id },
        brand_id: product.brand_id ? { id: product.brand_id.id } : undefined,
        id: Not(id),
      },
      relations: [
        'category_id',
        'category_id.translates',
        'images',
        'translates',
        'parameters',
        'parameters.translates',
        'measurement_id',
        'measurement_id.translates',
        'brand_id',
        'brand_id.translates',
        'promotion_id',
        'promotion_id.translates',
        'stock',
      ],
      take: 10,
    });

    const mappedEntitiesWithRating = calcRating(similarProducts);
    let mappedEntities = applyTranslations(mappedEntitiesWithRating, lang);

    mappedEntities = mappedEntities.map((product) => {
      if (product.category_id && product.category_id.translates) {
        product.category_id = applyTranslations([product.category_id], lang)[0];
      }
      if (product.measurement_id && product.measurement_id.translates) {
        product.measurement_id = applyTranslations([product.measurement_id], lang)[0];
      }
      if (product.brand_id && product.brand_id.translates) {
        product.brand_id = applyTranslations([product.brand_id], lang)[0];
      }
      if (product.promotion_id && product.promotion_id.translates) {
        product.promotion_id = applyTranslations([product.promotion_id], lang)[0];
      }
      if (product.parameters && Array.isArray(product.parameters)) {
        product.parameters = product.parameters.map((param) =>
          param && param.translates ? applyTranslations([param], lang)[0] : param,
        );
      }
      return product;
    });

    return mappedEntities;
  }

  async findPackages(lang: LANG): Promise<ProductWithoutRatings[]> {
    const products = await this.productRepo.find({
      relations: [
        'category_id',
        'category_id.translates',
        'images',
        'translates',
        'parameters',
        'parameters.translates',
        'measurement_id',
        'measurement_id.translates',
        'brand_id',
        'brand_id.translates',
        'promotion_id',
        'promotion_id.translates',
        'stock',
      ],
      where: {
        category_id: {
          is_packages: true,
        },
      },
    });

    const mappedEntitiesWithRating = calcRating(products);
    let mappedEntities = applyTranslations(mappedEntitiesWithRating, lang);

    mappedEntities = mappedEntities.map((product) => {
      if (product.category_id && product.category_id.translates) {
        product.category_id = applyTranslations([product.category_id], lang)[0];
      }

      if (product.measurement_id && product.measurement_id.translates) {
        product.measurement_id = applyTranslations([product.measurement_id], lang)[0];
      }

      if (product.brand_id && product.brand_id.translates) {
        product.brand_id = applyTranslations([product.brand_id], lang)[0];
      }

      if (product.promotion_id && product.promotion_id.translates) {
        product.promotion_id = applyTranslations([product.promotion_id], lang)[0];
      }

      if (product.parameters && Array.isArray(product.parameters)) {
        product.parameters = product.parameters.map((param) =>
          param && param.translates ? applyTranslations([param], lang)[0] : param,
        );
      }

      return product;
    });

    return mappedEntities;
  }

  async findOneByUrl(
    url: string,
    lang: LANG,
  ): Promise<{
    product: ProductWithoutRatings;
    children: ProductWithoutRatings[];
  }> {
    const product = await this.productRepo.findOne({
      where: { url },
      relations: [
        'category_id',
        'parent_id',
        'images',
        'translates',
        'parameters',
        'parameters.translates',
        'measurement_id',
        'measurement_id.translates',
        'brand_id',
        'brand_id.translates',
        'promotion_id',
        'promotion_id.translates',
        'stock',
      ],
    });

    if (!product) throw new NotFoundException('product is NOT_FOUND');

    let children: Product[] = [];

    if (product) {
      children = await this.productRepo.find({
        where: { parent_id: { id: product.id } },
        relations: [
          'category_id',
          'category_id.translates',
          'parent_id',
          'images',
          'translates',
          'parameters',
          'parameters.translates',
          'measurement_id',
          'measurement_id.translates',
          'brand_id',
          'brand_id.translates',
          'promotion_id',
          'promotion_id.translates',
          'ratings',
          'stock',
        ],
      });
    }

    const mappedProductWithRating = calcRating([product]);
    let mappedProduct = applyTranslations([mappedProductWithRating[0]], lang);
    mappedProduct = mappedProduct.map((prod) => {
      if (prod.category_id && prod.category_id.translates) {
        prod.category_id = applyTranslations([prod.category_id], lang)[0];
      }

      if (prod.measurement_id && prod.measurement_id.translates) {
        prod.measurement_id = applyTranslations([prod.measurement_id], lang)[0];
      }

      if (prod.brand_id && prod.brand_id.translates) {
        prod.brand_id = applyTranslations([prod.brand_id], lang)[0];
      }

      if (prod.promotion_id && prod.promotion_id.translates) {
        prod.promotion_id = applyTranslations([prod.promotion_id], lang)[0];
      }

      if (prod.parameters && Array.isArray(prod.parameters)) {
        prod.parameters = prod.parameters.map((param) =>
          param && param.translates ? applyTranslations([param], lang)[0] : param,
        );
      }

      return prod;
    });

    const mappedChildrenWithRating = calcRating(children);
    let mappedChildren = applyTranslations(mappedChildrenWithRating, lang);
    mappedChildren = mappedChildren.map((child) => {
      if (child.category_id && child.category_id.translates) {
        child.category_id = applyTranslations([child.category_id], lang)[0];
      }

      if (child.measurement_id && child.measurement_id.translates) {
        child.measurement_id = applyTranslations([child.measurement_id], lang)[0];
      }

      if (child.brand_id && child.brand_id.translates) {
        child.brand_id = applyTranslations([child.brand_id], lang)[0];
      }

      if (child.promotion_id && child.promotion_id.translates) {
        child.promotion_id = applyTranslations([child.promotion_id], lang)[0];
      }

      if (child.parameters && Array.isArray(child.parameters)) {
        child.parameters = child.parameters.map((param) =>
          param && param.translates ? applyTranslations([param], lang)[0] : param,
        );
      }

      return child;
    });

    return {
      product: mappedProduct[0],
      children: mappedChildren,
    };
  }

  async create(dto: ProductCreateDto): Promise<Product> {
    console.log('dto', dto);

    const product = this.productRepo.create({
      ...dto,
      parent_id: dto.parent_id ?? undefined,
    });

    try {
      return await this.productRepo.save(product);
    } catch (err) {
      this.logger.error(`Error while creating product \n ${err}`);
      throw new BadRequestException('product is NOT_CREATED');
    }
  }

  async update(id: number, dto: ProductUpdateDto): Promise<Product | null> {
    const product = await this.productRepo.findOne({ where: { id } });

    if (!product) throw new NotFoundException('product is NOT_FOUND');

    try {
      await this.productRepo.update(
        { id },
        {
          ...dto,
          parent_id: dto.parent_id ?? undefined,
        },
      );

      return await this.productRepo.findOne({ where: { id } });
    } catch (err) {
      this.logger.error(`Error while updating product \n ${err}`);
      throw new BadRequestException(`product is NOT_UPDATED`);
    }
  }

  async updateParameters(id: number, dto: ProductParametersDto): Promise<Product | null> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('product is NOT_FOUND');

    try {
      const parameters = await this.parameterRepo.findBy({
        id: In(dto.parameters),
      });

      product.parameters = parameters.length ? parameters : [];
      await this.productRepo.save(product);
    } catch (err) {
      this.logger.error(`Error to update paramaters in product \n ${err}`);
      throw new BadRequestException('NOT_UPDATED');
    }

    return await this.productRepo.findOne({
      where: { id },
      relations: [
        'category_id',
        'parent_id',
        'images',
        'translates',
        'parameters',
        'measurement_id',
        'brand_id',
        'promotion_id',
        'ratings',
        'stock',
      ],
    });
  }

  async delete(id: number): Promise<{ message: string }> {
    try {
      const result = await this.productRepo.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException('product is NOT_FOUND');
      } else {
        await this.deleteImages(id);
      }
    } catch (err) {
      this.logger.error(`Error while deleting product \n ${err}`);

      if (err instanceof Error && err.message.includes('foreign key')) {
        throw new BadRequestException('product HAS_CHILDS');
      }

      throw err;
    }

    return { message: 'SUCCESS' };
  }

  async createTranslates(dto: ProductCreateTranslateDto[]): Promise<ProductTranslate[] | null> {
    if (dto?.length) {
      const results: ProductTranslate[] = [];

      for (const translate of dto) {
        const data = this.entityTranslateRepo.create(translate);
        const result = await this.entityTranslateRepo.save(data);
        results.push(result);
      }

      return results;
    }
    return null;
  }

  async updateTranslates(dto: ProductUpdateTranslateDto[]): Promise<ProductTranslate[] | null> {
    const results: ProductTranslate[] = [];

    for (const translate of dto) {
      const result = await this.entityTranslateRepo.update(translate.id, {
        ...translate,
      });

      if (result.affected === 0) throw new NotFoundException('product translate is NOT_FOUND');

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
      throw new NotFoundException('product translate is NOT_FOUND');
    }

    return { message: 'OK' };
  }

  async createImage(dto: ProductCreateImageDto): Promise<ProductImage> {
    const entity_id = typeof dto.entity_id === 'number' ? { id: dto.entity_id } : dto.entity_id;

    const newImage = this.entityImageRepo.create({
      ...dto,
      entity_id,
    });
    try {
      return await this.entityImageRepo.save(newImage);
    } catch (err) {
      this.logger.error(`Error while saving product image: ${err}`);
      throw new BadRequestException('product image is NOT_CREATED');
    }
  }

  async uploadImages(
    files: Express.Multer.File[],
    dto: ProductUploadImageDto,
  ): Promise<{ message: string }> {
    const { entity_id } = dto;

    const fileName = `${Date.now()}.webp`;

    const uploadDir = path.join(process.cwd(), 'uploads', 'product');
    await fs.ensureDir(uploadDir);

    const outputFilePath = path.join(uploadDir, fileName);

    for (const file of files) {
      try {
        await sharp(file.buffer).avif().toFile(outputFilePath);

        const body: ProductCreateImageDto = {
          custom_id: '',
          name: fileName,
          path: outputFilePath,
          entity_id: entity_id,
        };

        try {
          await this.createImage(body);
        } catch (err) {
          this.logger.warn(`Error to create image for entity_id: ${entity_id}: ${err}`);
          throw new BadRequestException('product image is NOT_CREATED');
        }
      } catch (err) {
        this.logger.warn(`Error to upload file ${fileName}: ${err}`);
        throw new BadRequestException('product image is NOT_UPLOADED');
      }
    }

    return {
      message: 'Images saved',
    };
  }

  async deleteImage(id: number): Promise<void> {
    const image = await this.entityImageRepo.findOne({ where: { id } });

    if (!image) throw new NotFoundException('product is NOT_FOUND');

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
