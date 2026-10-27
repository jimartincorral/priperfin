import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { CurrentProfile } from '../auth/decorators/current-profile.decorator';
import { Profile } from '../generated/client';
import { SimulatorService } from './simulator.service';
import { SaveScenarioDto } from './scenario.dto';

const validate = new ValidationPipe({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
});

/**
 * The what-if Simulator. Projections are computed in the browser from the
 * baseline; the API only supplies that baseline and stores saved scenarios.
 */
@Controller('simulator')
@UseGuards(SessionAuthGuard)
export class SimulatorController {
  constructor(private readonly simulator: SimulatorService) {}

  @Get('baseline')
  getBaseline(@CurrentProfile() profile: Profile) {
    return this.simulator.getBaseline(profile.id);
  }

  @Get('scenarios')
  findAll(@CurrentProfile() profile: Profile) {
    return this.simulator.findAll(profile.id);
  }

  @Post('scenarios')
  @UsePipes(validate)
  create(@Body() dto: SaveScenarioDto, @CurrentProfile() profile: Profile) {
    return this.simulator.create(profile.id, dto);
  }

  @Put('scenarios/:id')
  @UsePipes(validate)
  update(
    @Param('id') id: string,
    @Body() dto: SaveScenarioDto,
    @CurrentProfile() profile: Profile,
  ) {
    return this.simulator.update(id, profile.id, dto);
  }

  @Delete('scenarios/:id')
  remove(@Param('id') id: string, @CurrentProfile() profile: Profile) {
    return this.simulator.remove(id, profile.id);
  }
}
