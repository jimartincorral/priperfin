import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SavingsGoalsService } from './savings-goals.service';
import { CreateSavingsGoalDto } from './create-savings-goal.dto';
import { UpdateSavingsGoalDto } from './update-savings-goal.dto';

@Controller('savings-goals')
export class SavingsGoalsController {
  constructor(private readonly savingsGoalsService: SavingsGoalsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createSavingsGoalDto: CreateSavingsGoalDto) {
    return this.savingsGoalsService.create(createSavingsGoalDto);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(
    @Param('id') id: string,
    @Body() updateSavingsGoalDto: UpdateSavingsGoalDto,
  ) {
    return this.savingsGoalsService.update(id, updateSavingsGoalDto);
  }

  @Get()
  findAll() {
    return this.savingsGoalsService.findAll();
  }
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.savingsGoalsService.remove(id);
  }
}
