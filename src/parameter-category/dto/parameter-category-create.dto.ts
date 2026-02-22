import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class ParameterCategoryCreateDto {
  @ApiPropertyOptional({ example: '123' })
  @IsString()
  custom_id: string;

  @ApiProperty({ example: 'Сорт' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'сео-заголовок' })
  @IsString()
  seo_title: string;

  @ApiProperty({ example: 'сео-опис' })
  @IsString()
  seo_description: string;

  @ApiProperty({ example: 0 })
  @IsInt()
  order_in_list: number;
}
