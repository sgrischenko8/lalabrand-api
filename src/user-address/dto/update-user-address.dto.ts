import { PartialType } from '@nestjs/swagger';
import { CreatePostDto } from './create-user-address.dto';

export class UpdatePostDto extends PartialType(CreatePostDto) {}
