import { PartialType } from '@nestjs/swagger';
import { BrandCreateDto } from './brand-create.dto';

export class BrandUpdateDto extends PartialType(BrandCreateDto) {}
