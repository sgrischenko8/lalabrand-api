import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Validate } from 'class-validator';
import { IsExist } from 'src/common/validators/isExist.validator';
import { Country } from 'src/country/entities/country.entity';

export class BrandCreateDto {
  @ApiPropertyOptional({ example: '123' })
  @IsString()
  @IsOptional()
  custom_id: string;

  @ApiProperty({ example: 'Укранїнський' })
  @IsString()
  title: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Validate(IsExist, ['country', 'id'])
  country_id: Country;
}
