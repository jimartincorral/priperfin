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
import { SavingsGoalsService } from './savings-goals.service';
import { CreateSavingsGoalDto } from './create-savings-goal.dto';
import { UpdateSavingsGoalDto } from './update-savings-goal.dto';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { CurrentProfile } from '../auth/decorators/current-profile.decorator';
import { Profile } from '../generated/client';

@Controller('savings-goals')
@UseGuards(SessionAuthGuard)
export class SavingsGoalsController {
  constructor(private readonly savingsGoalsService: SavingsGoalsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(
    @Body() createSavingsGoalDto: CreateSavingsGoalDto,
    @CurrentProfile() profile: Profile,
  ) {
    return this.savingsGoalsService.create(createSavingsGoalDto, profile.id);
  }

  @Get()
  findAll(@CurrentProfile() profile: Profile) {
    return this.savingsGoalsService.findAll(profile.id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(
    @Param('id') id: string,
    @Body() updateSavingsGoalDto: UpdateSavingsGoalDto,
    @CurrentProfile() profile: Profile,
  ) {
    return this.savingsGoalsService.update(
      id,
      profile.id,
      updateSavingsGoalDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentProfile() profile: Profile) {
    return this.savingsGoalsService.remove(id, profile.id);
  }
}
