import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { SORT_BY } from 'src/common/enums/products.enum';

export class ProductFilterDto {
  @ApiProperty({ example: '1,2' })
  @IsString()
  @IsOptional()
  categories: string;

  @ApiProperty({ example: '1,2' })
  @IsString()
  @IsOptional()
  parameters: string;

  @ApiProperty({ example: 15 })
  @IsInt()
  @Min(0)
  @IsOptional()
  take: number;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  skip: number;

  @ApiProperty({
    example: SORT_BY.PRICE_ASC,
    enum: SORT_BY,
    description: 'Sort by options',
  })
  @IsEnum(SORT_BY)
  @IsOptional()
  sort_by: SORT_BY;
}
