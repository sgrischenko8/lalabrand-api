import { IsBoolean, IsString, IsInt, Min, IsOptional, IsPositive, Validate } from 'class-validator';
import { IsExist } from 'src/common/validators/isExist.validator';
import { Parameter } from 'src/parameter/entities/parameter.entity';
import { Product } from '../entities/product.entity';
import { Category } from 'src/category/entities/category.entity';
import { ProductPromotion } from 'src/product-promotion/entities/product-promotion.entity';
import { Brand } from 'src/brand/entities/brand.entity';
import { Measurement } from 'src/measurement/entities/measurement.entity';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProductCreateDto {
  @ApiPropertyOptional({ example: '123' })
  @IsString()
  @IsOptional()
  custom_id: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  is_top_product: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  is_hidden: boolean;

  @ApiProperty({ example: null })
  @IsInt()
  @IsPositive()
  @Validate(IsExist, ['product', 'id'])
  @IsOptional()
  parent_id: Product;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Validate(IsExist, ['category', 'id'])
  category_id: Category;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Validate(IsExist, ['brand', 'id'])
  brand_id: Brand;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Validate(IsExist, ['measurement', 'id'])
  measurement_id: Measurement;

  @ApiProperty({ example: null })
  @IsInt()
  @IsOptional()
  @Validate(IsExist, ['product_promotion', 'id'])
  promotion_id: ProductPromotion;

  @ApiProperty({ example: false })
  @IsBoolean()
  is_parent: boolean;

  @ApiProperty({ example: '123' })
  @IsString()
  article: string;

  @ApiProperty({ example: 'Яблуко Fuji' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'сео-заголовок' })
  @IsString()
  seo_title: string;

  @ApiProperty({ example: 'сео-текст' })
  @IsString()
  seo_description: string;

  @ApiProperty({ example: 'yablyko-fuji' })
  @IsString()
  url: string;

  @ApiProperty({ example: '0.00' })
  @IsString()
  price: string;

  @ApiProperty({ example: '0.00' })
  @IsString()
  price_retail: string;

  @ApiProperty({ example: 'Опис продукту' })
  @IsString()
  description_1: string;

  @ApiProperty({ example: 'Склад продукту' })
  @IsString()
  description_2: string;

  @ApiProperty({ example: 'Загальна інформація (JSON рядок)' })
  @IsString()
  description_3: string;

  @ApiProperty({ example: 'Харчова цінність (JSON рядок)' })
  @IsString()
  description_4: string;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  order_in_list: number;

  @IsInt({ each: true })
  @IsOptional()
  parameters: Parameter[];
}
