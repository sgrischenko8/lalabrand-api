import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/create-user-address.dto';
import { UpdatePostDto } from './dto/update-user-address.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { UserAddress } from './entities/user-address.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserAddressService {
  constructor(
    @InjectRepository(UserAddress)
    private userAddressRepo: Repository<UserAddress>,
    private jwtService: JwtService,
  ) {}

  async findAll(take: number, skip: number) {
    const entities = await this.userAddressRepo.find({
      take,
      skip,
      order: { created_at: 'DESC' },
    });
    const count = await this.userAddressRepo.count();

    return { entities, count };
  }

  async findOne(id: number) {
    const result = await this.userAddressRepo.findOne({ where: { id } });
    if (!result) throw new NotFoundException('Entity not found');
    return result;
  }

  async findByToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      const userId = payload.id;
      return await this.userAddressRepo.find({
        where: { user: { id: userId } },
      });
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async create(dto: CreatePostDto) {
    try {
      const newEntity = this.userAddressRepo.create(dto);
      return await this.userAddressRepo.save(newEntity);
    } catch (err) {
      console.error('Error creating user address:', err);
      throw new BadRequestException('NOT_CREATED');
    }
  }

  async update(id: number, dto: UpdatePostDto) {
    await this.userAddressRepo.update({ id }, dto);

    const entity = await this.userAddressRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('Entity not found');

    return entity;
  }

  async delete(id: number): Promise<{ message: string }> {
    const result = await this.userAddressRepo.delete({ id });

    if (result.affected === 0) throw new NotFoundException('Entity not found');

    return { message: 'SUCCESS' };
  }
}
