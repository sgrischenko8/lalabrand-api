import { ApiProperty, PartialType } from '@nestjs/swagger';
import { BrandCreateTranslateDto } from './brand-create-translate.dto';
import { IsInt } from 'class-validator';

export class BrandUpdateTranslateDto extends PartialType(BrandCreateTranslateDto) {
  @ApiProperty({ example: 1 })
  @IsInt()
  id: number;
}
