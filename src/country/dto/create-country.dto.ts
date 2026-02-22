import { Optional } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCountryDto {
  @ApiPropertyOptional({ example: '123' })
  @IsString()
  @Optional()
  custom_id: string;

  @ApiProperty({ example: 'Україна' })
  @IsString()
  title: string;
}
