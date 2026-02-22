import { PartialType } from '@nestjs/swagger';
import { CategoryPromotionCreateDto } from './category-promotion-create.dto';

export class CategoryPromotionUpdateDto extends PartialType(CategoryPromotionCreateDto) {}
