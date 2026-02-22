import { Module } from '@nestjs/common';
import { UserAddressService } from './user-address.service';
import { UserAddressController } from './user-address.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAddress } from './entities/user-address.entity';
import { IsExist } from 'src/common/validators/isExist.validator';

@Module({
  imports: [TypeOrmModule.forFeature([UserAddress])],
  controllers: [UserAddressController],
  providers: [UserAddressService, IsExist],
})
export class UserAddressModule {}
