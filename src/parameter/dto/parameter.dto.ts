import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, Validate, IsInt, IsOptional, ArrayNotEmpty } from 'class-validator';
import { IsExistIdInArray } from 'src/common/validators/isExistIdInArray.validator';

export class ParameterDto {
  @ApiProperty({ example: 'Fuji' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: '123' })
  @IsString()
  @IsOptional()
  custom_id: string;

  @ApiPropertyOptional({ example: [1, 2] })
  @ArrayNotEmpty()
  @Validate(IsExistIdInArray, ['parameter_category'])
  category_ids: number[];

  @ApiPropertyOptional({ example: '0' })
  @IsInt()
  order_in_list: number;
}
