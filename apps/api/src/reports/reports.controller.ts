import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { GetTransactionsDto } from '../transactions/get-transactions.dto';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { CurrentProfile } from '../auth/decorators/current-profile.decorator';
import { Profile } from '../generated/client';

@Controller('reports')
@UseGuards(SessionAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('category-breakdown')
  @UsePipes(new ValidationPipe({ transform: true }))
  getCategoryBreakdown(
    @Query() query: GetTransactionsDto,
    @CurrentProfile() profile: Profile,
  ) {
    return this.reportsService.getCategoryBreakdown(query, profile.id);
  }

  @Get('sankey')
  @UsePipes(new ValidationPipe({ transform: true }))
  getSankeyData(
    @Query() query: GetTransactionsDto,
    @CurrentProfile() profile: Profile,
  ) {
    return this.reportsService.getSankeyData(query, profile.id);
  }

  @Get('cost-object-breakdown')
  @UsePipes(new ValidationPipe({ transform: true }))
  getCostObjectBreakdown(
    @Query() query: GetTransactionsDto,
    @CurrentProfile() profile: Profile,
  ) {
    return this.reportsService.getCostObjectBreakdown(query, profile.id);
  }
}
