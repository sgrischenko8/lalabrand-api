import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { CategoryPromotion } from 'src/category-promotion/entities/category-promotion.entity';
import { ProductCreateDto } from 'src/product/dto/product-create.dto';

export class CategoryCreateDto {
  @ApiProperty({ example: false })
  @IsBoolean()
  show_on_main_page: boolean;

  @ApiProperty({ example: 'Яблука' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'yabluka' })
  @IsString()
  url: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  is_packages: boolean;

  @ApiPropertyOptional({ nullable: true, example: null })
  @IsInt()
  @IsOptional()
  promotion_id: CategoryPromotion;

  @ApiProperty({ example: 0, nullable: false })
  @IsInt()
  order_in_list: number;
}

export class CategoryCreateResponseDto {
  @ApiProperty({ example: 1 })
  @IsString()
  id: number;

  @ApiProperty({ example: 'Яблука' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'yabluka' })
  @IsString()
  url: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  is_packages: boolean;

  @ApiPropertyOptional({ nullable: true, example: null })
  @IsInt()
  @IsOptional()
  promotion_id: CategoryPromotion;

  @ApiProperty({ example: 0 })
  @IsInt()
  order_in_list: number;

  @ApiProperty({
    required: true,
    nullable: false,
    type: () => [ProductCreateDto],
  })
  @IsArray()
  products: ProductCreateDto[];
}
