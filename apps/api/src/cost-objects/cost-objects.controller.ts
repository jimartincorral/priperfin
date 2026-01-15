import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { CostObjectsService } from './cost-objects.service';
import { CreateCostObjectDto } from './create-cost-object.dto';
import { UpdateCostObjectDto } from './update-cost-object.dto';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { CurrentProfile } from '../auth/decorators/current-profile.decorator';
import { Profile } from '../generated/client';

@Controller('cost-objects')
@UseGuards(SessionAuthGuard)
export class CostObjectsController {
  constructor(private readonly costObjectsService: CostObjectsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() dto: CreateCostObjectDto, @CurrentProfile() profile: Profile) {
    return this.costObjectsService.create(dto, profile.id);
  }

  @Get()
  findAll(@CurrentProfile() profile: Profile) {
    return this.costObjectsService.findAll(profile.id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCostObjectDto,
    @CurrentProfile() profile: Profile,
  ) {
    return this.costObjectsService.update(id, profile.id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentProfile() profile: Profile) {
    return this.costObjectsService.remove(id, profile.id);
  }
}
