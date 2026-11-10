import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MonthlyBalancesService } from './monthly-balances.service';
import { BalancesService } from './balances.service';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { CurrentProfile } from '../auth/decorators/current-profile.decorator';
import { Profile } from '../generated/client';

@Controller('monthly-balances')
@UseGuards(SessionAuthGuard)
export class MonthlyBalancesController {
  constructor(
    private readonly service: MonthlyBalancesService,
    private readonly balances: BalancesService,
  ) {}

  /**
   * The balance at the start of `date` (YYYY-MM-DD): of one account with
   * `?accountId=` (a credit card's as the amount owed), of all of them in
   * money otherwise. What the Expenses screen opens a period with.
   */
  @Get('opening/:date')
  async opening(
    @Param('date') date: string,
    @Query('accountId') accountId: string | undefined,
    @CurrentProfile() profile: Profile,
  ) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
    const at = match
      ? new Date(Date.UTC(+match[1], +match[2] - 1, +match[3]))
      : null;
    if (!at || at.toISOString().slice(0, 10) !== date) {
      throw new BadRequestException('date must be YYYY-MM-DD');
    }
    return {
      date,
      balance: await this.balances.openingBalance(
        profile.id,
        at,
        accountId || undefined,
      ),
    };
  }

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
