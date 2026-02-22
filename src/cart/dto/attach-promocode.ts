import { IsString } from 'class-validator';

export class AttachPromocodeDto {
  @IsString()
  title: string;
}
