import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UsePipes,
  ValidationPipe,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './create-category.dto';
import { UpdateCategoryDto } from './update-category.dto';
import { CategoryType, Profile } from '../generated/client';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { CurrentProfile } from '../auth/decorators/current-profile.decorator';

@Controller('categories')
@UseGuards(SessionAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentProfile() profile: Profile,
  ) {
    return this.categoriesService.create(createCategoryDto, profile.id);
  }

  @Get()
  findAll(
    @CurrentProfile() profile: Profile,
    @Query('type') type?: CategoryType,
  ) {
    return this.categoriesService.findAll(profile.id, type);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @CurrentProfile() profile: Profile,
  ) {
    return this.categoriesService.update(id, profile.id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentProfile() profile: Profile) {
    return this.categoriesService.remove(id, profile.id);
  }
}
