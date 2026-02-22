import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  ParseIntPipe,
  Delete,
  Put,
  Headers,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CategoryPromotionCreateDto } from './dto/category-promotion-create.dto';
import { CategoryPromotionUpdateDto } from './dto/category-promotion-update.dto';
import { TakeAndSkipDto } from 'src/common/dto/TakeAndSkipDto.dto';
import { CategoryPromotionService } from './category-promotion.service';
import { CategoryPromotiontCreateTranslateDto } from './dto/category-promotion-create-translate.dto';
import { CategoryPromotionUpdateTranslateDto } from './dto/category-promotion-update-translate.dto';
import { Request } from 'express';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthAdminGuard } from 'src/auth/auth-admin.guard';

@ApiTags('Акції категорій')
@Controller('category-promotion')
export class CategoryPromotionController {
  constructor(private categoryPromotionService: CategoryPromotionService) {}

  @Get('all')
  @UseGuards(AuthAdminGuard)
  @ApiResponse({
    status: 200,
    description: 'SUCCESS - Успішно отримано всі сутності',
  })
  @ApiOperation({ summary: 'Отримати всі акції категорій' })
  findAllList(@Req() req: Request) {
    return this.categoryPromotionService.findAllList(req.lang);
  }

  @Get()
  @UseGuards(AuthAdminGuard)
  @ApiResponse({
    status: 200,
    description: 'SUCCESS - Успішно отримано частину сутностей',
  })
  @ApiOperation({ summary: 'Отримати частину акцій категорій' })
  find(@Query() { take, skip }: TakeAndSkipDto, @Req() req: Request) {
    return this.categoryPromotionService.findAll(take, skip, req.lang);
  }

  @Get(':id')
  @UseGuards(AuthAdminGuard)
  @ApiResponse({
    status: 200,
    description: 'SUCCESS - Сутність успішно отримано',
  })
  @ApiResponse({
    status: 404,
    description: 'NOT_FOUND - Сутність не знайдено',
  })
  @ApiOperation({ summary: 'Отримати акцію категорій' })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.categoryPromotionService.findOne(id, req.lang);
  }

  @Post()
  @UseGuards(AuthAdminGuard)
  @ApiResponse({
    status: 201,
    description: 'SUCCESS - Сутність успішно створено',
  })
  @ApiResponse({
    status: 404,
    description: 'NOT_CREATED - Cутність не створено',
  })
  @ApiOperation({ summary: 'Створити акцію' })
  create(@Body() dto: CategoryPromotionCreateDto) {
    return this.categoryPromotionService.create(dto);
  }

  @Put(':id')
  @UseGuards(AuthAdminGuard)
  @ApiResponse({
    status: 200,
    description: 'SUCCESS - Сутність успішно оновлено',
  })
  @ApiResponse({
    status: 404,
    description: 'NOT_FOUND - Сутність не знайдено',
  })
  @ApiOperation({ summary: 'Оновити акцію' })
  update(@Body() dto: CategoryPromotionUpdateDto, @Param('id', ParseIntPipe) id: number) {
    return this.categoryPromotionService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthAdminGuard)
  @ApiResponse({
    status: 200,
    description: 'SUCCESS - Сутність успішно видалено',
  })
  @ApiResponse({
    status: 404,
    description: 'NOT_FOUND - Сутність не знайдено',
  })
  @ApiOperation({ summary: 'Видалити акцію' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.categoryPromotionService.delete(id);
  }

  @Post('/translates')
  @UseGuards(AuthAdminGuard)
  @ApiResponse({
    status: 200,
    description: 'SUCCESS - Сутності успішно створено',
  })
  @ApiBody({
    description: 'Cписок перекладів',
    type: CategoryPromotiontCreateTranslateDto,
    isArray: true,
    required: true,
  })
  @ApiOperation({ summary: 'Cтворити переклади для акції' })
  createTranslates(@Body() dto: CategoryPromotiontCreateTranslateDto[]) {
    return this.categoryPromotionService.createTranslates(dto);
  }

  @Put(':id/translates')
  @UseGuards(AuthAdminGuard)
  @ApiBody({
    description: 'Cписок перекладів',
    type: CategoryPromotionUpdateTranslateDto,
    isArray: true,
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'SUCCESS - Сутності успішно оновлено',
  })
  @ApiResponse({
    status: 404,
    description: 'NOT_FOUND - Сутність не знайдено',
  })
  @ApiOperation({ summary: 'Оновити переклади для акції' })
  updateTranslates(@Body() dto: CategoryPromotionUpdateTranslateDto[]) {
    return this.categoryPromotionService.updateTranslates(dto);
  }

  @Delete(':id/translate')
  @UseGuards(AuthAdminGuard)
  @ApiResponse({
    status: 200,
    description: 'SUCCESS - Сутність успішно видалено',
  })
  @ApiResponse({
    status: 404,
    description: 'NOT_FOUND - Сутність не знайдено',
  })
  @ApiOperation({ summary: 'Видалити переклад для акції' })
  deleteTranslate(@Param('id', ParseIntPipe) id: number) {
    return this.categoryPromotionService.deleteTranslate(id);
  }
}
