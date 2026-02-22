import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CategoryPromotiontCreateTranslateDto } from './category-promotion-create-translate.dto';
import { IsInt } from 'class-validator';

export class CategoryPromotionUpdateTranslateDto extends PartialType(
  CategoryPromotiontCreateTranslateDto,
) {
  @ApiProperty({ example: 1 })
  @IsInt()
  id: number;
}
