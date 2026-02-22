import { PartialType } from '@nestjs/swagger';
import { BrandCreateImageDto } from './brand-create-image.dto';

export class BrandUpdateImageDto extends PartialType(BrandCreateImageDto) {}
