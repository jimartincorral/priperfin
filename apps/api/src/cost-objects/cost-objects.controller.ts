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
} from '@nestjs/common';
import { CostObjectsService } from './cost-objects.service';
import { CreateCostObjectDto } from './create-cost-object.dto';
import { UpdateCostObjectDto } from './update-cost-object.dto';

@Controller('cost-objects')
export class CostObjectsController {
  constructor(private readonly costObjectsService: CostObjectsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() dto: CreateCostObjectDto) {
    return this.costObjectsService.create(dto);
  }

  @Get()
  findAll() {
    return this.costObjectsService.findAll();
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id') id: string, @Body() dto: UpdateCostObjectDto) {
    return this.costObjectsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.costObjectsService.remove(id);
  }
}
