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
  UseInterceptors,
  Req,
  UploadedFiles,
  UseGuards,
} from '@nestjs/common';
import { BrandCreateDto } from './dto/brand-create.dto';
import { BrandUpdateDto } from './dto/brand-update.dto';
import { TakeAndSkipDto } from 'src/common/dto/TakeAndSkipDto.dto';
import { BrandService } from './brand.service';
import { BrandCreateTranslateDto } from './dto/brand-create-translate.dto';
import { BrandUpdateTranslateDto } from './dto/brand-update-translate.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FilesSizeValidationPipe } from 'src/common/pipes/files-upload.pipe';
import { Request } from 'express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthAdminGuard } from 'src/auth/auth-admin.guard';

@ApiTags('Бренд')
@Controller('brand')
export class BrandController {
  constructor(private brandService: BrandService) {}

  @Get('all')
  @ApiOperation({ summary: 'Отримати всі бренди' })
  @ApiResponse({
    status: 200,
    description: 'SUCCESS - Успішно отримано всі сутності',
  })
  findAllList(@Req() req: Request) {
    return this.brandService.findAllList(req.lang);
  }

  @Get()
  @ApiOperation({ summary: 'Отримати частину брендів' })
  @ApiResponse({
    status: 200,
    description: 'SUCCESS - Успішно отримано частину сутностей',
  })
  find(@Query() { take, skip }: TakeAndSkipDto, @Req() req: Request) {
    return this.brandService.findAll(take, skip, req.lang);
  }

  @Get(':id')
  @ApiResponse({
    status: 200,
    description: 'SUCCESS - Успішно отримано сутність',
  })
  @ApiResponse({
    status: 404,
    description: 'NOT_FOUND - Сутність не знайдено',
  })
  @ApiOperation({ summary: 'Отримати бренд' })
  findOne(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.brandService.findOne(id, req.lang);
  }

  @Post('create')
  @UseGuards(AuthAdminGuard)
  @ApiResponse({
    status: 201,
    description: 'CREATED - Сутність успішно створено',
  })
  @ApiResponse({
    status: 400,
    description: 'NOT_CREATED - Cутність не створено',
  })
  @ApiOperation({ summary: 'Cтворити бренд' })
  create(@Body() dto: BrandCreateDto) {
    console.log('fire1');
    return this.brandService.create(dto);
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
  @ApiOperation({ summary: 'Оновити бренд' })
  update(@Body() dto: BrandUpdateDto, @Param('id', ParseIntPipe) id: number) {
    return this.brandService.update(id, dto);
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
  @ApiOperation({ summary: 'Видалити бренд' })
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.brandService.delete(id);
  }

  @Post('translates')
  @UseGuards(AuthAdminGuard)
  @ApiResponse({
    status: 201,
    description: 'SUCCESS - Сутність успішно створено',
  })
  @ApiOperation({ summary: 'Cтворити переклади для бренду' })
  @ApiBody({
    description: 'Масив перекладів',
    type: BrandCreateTranslateDto,
    isArray: true,
    required: true,
  })
  createTranslates(@Body() dto: BrandCreateTranslateDto[]) {
    return this.brandService.createTranslates(dto);
  }

  @Put(':id/translates')
  @UseGuards(AuthAdminGuard)
  @ApiResponse({
    status: 200,
    description: 'SUCCESS - Сутність успішно оновлено',
  })
  @ApiResponse({
    status: 404,
    description: 'NOT_FOUND - Сутність не знайдено',
  })
  @ApiOperation({ summary: 'Оновити переклади для бренду' })
  @ApiBody({
    description: 'Масив перекладів',
    type: BrandUpdateTranslateDto,
    isArray: true,
    required: true,
  })
  updateTranslates(@Body() dto: BrandUpdateTranslateDto[]) {
    return this.brandService.updateTranslates(dto);
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
  @ApiOperation({ summary: 'Видалити переклад для бренду' })
  deleteTranslate(@Param('id', ParseIntPipe) id: number) {
    return this.brandService.deleteTranslate(id);
  }

  @Post('upload/:id')
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ summary: 'Завантажити фото бренду' })
  @ApiResponse({
    status: 201,
    description: "SUCCESS - Сутність успішно завантажено і прикріплено до об'єкту",
  })
  @ApiResponse({
    status: 400,
    description: 'NOT_CREATED - Сутність не створено',
  })
  @ApiResponse({
    status: 400,
    description: 'NOT_UPLOADED - Сутність не завантажено',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Завантаження фото бренду',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiParam({
    name: 'id',
    required: true,
    type: Number,
    description: 'Id бренду',
  })
  uploadFile(
    @UploadedFiles(new FilesSizeValidationPipe()) files: Express.Multer.File[],
    @Param('id', ParseIntPipe) entity_id: number,
  ) {
    return this.brandService.uploadImages(files, entity_id);
  }

  @Delete('/image/:id')
  @ApiResponse({
    status: 200,
    description: 'SUCCESS - Сутність успішно видалено',
  })
  @ApiResponse({
    status: 404,
    description: 'NOT_FOUND - Сутність не знайдено',
  })
  @ApiOperation({ summary: 'Видалити фото бренду' })
  deleteEntityImage(@Param('id', ParseIntPipe) id: number) {
    return this.brandService.deleteImage(id);
  }
}
