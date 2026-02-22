import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { Category } from 'src/category/entities/category.entity';

export class CategoryPromotionCreateDto {
  @ApiPropertyOptional({ example: '123' })
  @IsString()
  @IsOptional()
  custom_id: string;

  @ApiProperty({ example: 'Акція для категорії "Фрукти"' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Опис акції' })
  @IsString()
  description: string;

  @ApiProperty({ example: '10.000' })
  @IsString()
  from_amount: string;

  @ApiProperty({ example: 15 })
  @IsInt()
  discount: number;

  @ApiProperty({ example: 0 })
  @IsInt()
  priority: number;

  @ApiProperty({ example: [1] })
  @IsInt({ each: true })
  @IsPositive({ each: true })
  categories: Category[];
}
