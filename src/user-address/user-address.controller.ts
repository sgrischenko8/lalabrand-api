import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  Put,
  UseGuards,
  UnauthorizedException,
  Req,
} from '@nestjs/common';
import { UserAddressService } from './user-address.service';
import { CreatePostDto } from './dto/create-user-address.dto';
import { UpdatePostDto } from './dto/update-user-address.dto';
import { TakeAndSkipDto } from 'src/common/dto/TakeAndSkipDto.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { Request } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthAdminGuard } from 'src/auth/auth-admin.guard';

@ApiTags('Адреси користувачів')
@Controller('user-address')
export class UserAddressController {
  constructor(private readonly userAddressSerivce: UserAddressService) {}

  @Get()
  @UseGuards(AuthAdminGuard)
  @ApiResponse({
    status: 200,
    description: 'SUCCESS - Успішно отримано всі сутності',
  })
  @ApiOperation({ summary: 'Отримати всі адреси' })
  findAll(@Query() { take, skip }: TakeAndSkipDto) {
    return this.userAddressSerivce.findAll(take, skip);
  }

  @Get('list')
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'SUCCESS - Успішно отримано всі сутності',
  })
  @ApiOperation({ summary: 'Знайти адреси юзера за токеном авторизації' })
  findByToken(@Req() req: Request) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header not found');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    return this.userAddressSerivce.findByToken(token);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'SUCCESS - Успішно отримано cутність',
  })
  @ApiResponse({
    status: 404,
    description: 'NOT_FOUND - Сутність не знайдено',
  })
  @ApiOperation({ summary: 'Знайти адресу' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.userAddressSerivce.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Створити адресу для юзера' })
  @ApiResponse({
    status: 201,
    description: 'SUCCESS - Сутність успішно створено',
  })
  @ApiResponse({
    status: 400,
    description: 'NOT_CREATED - Cутність не cтворено',
  })
  create(@Body() dto: CreatePostDto) {
    console.log('fire1');
    return this.userAddressSerivce.create(dto);
  }

  @Put(':id')
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'SUCCESS - Сутність успішно оновлено',
  })
  @ApiResponse({
    status: 404,
    description: 'NOT_FOUND - Сутність не знайдено',
  })
  @ApiOperation({ summary: 'Оновити адресу юзера' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePostDto) {
    return this.userAddressSerivce.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @ApiResponse({
    status: 200,
    description: 'SUCCESS - Сутність успішно видалено',
  })
  @ApiResponse({
    status: 404,
    description: 'NOT_FOUND - Сутність не знайдено',
  })
  @ApiOperation({ summary: 'Видалити адресу юзера' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.userAddressSerivce.delete(id);
  }
}
