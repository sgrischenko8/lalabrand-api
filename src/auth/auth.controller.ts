import { Body, Controller, Post } from '@nestjs/common';
import { AuthSevice } from './auth.service';
import { UserCreateDto } from 'src/user/dto/user-create.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignInDto } from './dto/sign-in.dto';

@ApiTags('Авторизація')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthSevice) {}

  @Post('sign-in')
  @ApiResponse({
    status: 201,
    description: 'SUCCESS - користувач успішно авторизований',
  })
  @ApiResponse({
    status: 400,
    description: 'WRONG_CREDENTIALS - передані дані невірні',
  })
  @ApiResponse({
    status: 404,
    description: 'NOT_FOUND - користувача не знайдено',
  })
  @ApiOperation({ summary: 'Вхід' })
  signIn(@Body() dto: SignInDto) {
    const { email, password } = dto;
    return this.authService.signIn(email, password);
  }

  @Post('sign-up')
  @ApiOperation({ summary: 'Реєстрація' })
  signUp(@Body() dto: UserCreateDto) {
    return this.authService.signUp(dto);
  }
}
