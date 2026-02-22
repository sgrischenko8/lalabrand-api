import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, Validate } from 'class-validator';
import { IsExist } from 'src/common/validators/isExist.validator';
import { User } from 'src/user/entities/user.entity';

export class CreatePostDto {
  @ApiProperty({ example: 'проспект Шевченка, 1, дім 1' })
  @IsString()
  address: string;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Validate(IsExist, ['user', 'id'])
  user: User;
}
