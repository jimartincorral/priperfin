import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AccountBalancesService } from './account-balances.service';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { CurrentProfile } from '../auth/decorators/current-profile.decorator';
import { Profile } from '../generated/client';

@Controller('account-balances')
@UseGuards(SessionAuthGuard)
export class AccountBalancesController {
  constructor(private readonly service: AccountBalancesService) {}

  @Get()
  findAll(
    @CurrentProfile() profile: Profile,
    @Query('accountId') accountId?: string,
  ) {
    return this.service.findAll(profile.id, accountId || null);
  }

  @Get('latest')
  async findLatest(
    @CurrentProfile() profile: Profile,
    @Query('beforeDate') beforeDate: string,
    @Query('accountId') accountId?: string,
  ) {
    const date = beforeDate ? new Date(beforeDate) : new Date();
    return this.service.findLatestBeforeOrOn(
      date,
      profile.id,
      accountId || null,
    );
  }

  @Get('calculate')
  async calculateAtDate(
    @CurrentProfile() profile: Profile,
    @Query('date') date: string,
    @Query('accountId') accountId?: string,
  ) {
    const targetDate = date ? new Date(date) : new Date();
    return this.service.calculateBalanceAtDate(
      targetDate,
      profile.id,
      accountId || null,
    );
  }

  @Post()
  async upsert(
    @CurrentProfile() profile: Profile,
    @Body()
    body: {
      asOfDate: string;
      balance: number;
      accountId?: string;
      notes?: string;
    },
  ) {
    const date = new Date(body.asOfDate);
    return this.service.upsert(
      date,
      body.balance,
      profile.id,
      body.accountId || null,
      body.notes,
    );
  }

  @Delete(':id')
  delete(@Param('id') id: string, @CurrentProfile() profile: Profile) {
    return this.service.delete(id, profile.id);
  }
}
