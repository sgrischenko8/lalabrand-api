import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator';
import { Brand } from '../entities/brand.entity';

export class BrandCreateImageDto {
  @IsString()
  @IsOptional()
  custom_id: string;

  @IsString()
  name: string;

  @IsString()
  path: string;

  @IsInt()
  @IsPositive()
  entity_id: Brand | number;
}
