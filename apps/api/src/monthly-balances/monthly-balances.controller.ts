import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { MonthlyBalancesService } from './monthly-balances.service';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { CurrentProfile } from '../auth/decorators/current-profile.decorator';
import { Profile } from '../generated/client';

@Controller('monthly-balances')
@UseGuards(SessionAuthGuard)
export class MonthlyBalancesController {
  constructor(private readonly service: MonthlyBalancesService) {}

  @Get(':month')
  findOne(
    @Param('month') month: string,
    @Query('accountId') accountId: string,
    @CurrentProfile() profile: Profile,
  ) {
    return this.service.findOne(month, profile.id, accountId);
  }

  @Post()
  upsert(
    @Body() body: { month: string; balance: number; accountId?: string },
    @CurrentProfile() profile: Profile,
  ) {
    return this.service.upsert(
      body.month,
      body.balance,
      profile.id,
      body.accountId,
    );
  }
}
