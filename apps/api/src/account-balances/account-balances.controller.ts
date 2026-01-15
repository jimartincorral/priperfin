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

@Controller('account-balances')
@UseGuards(SessionAuthGuard)
export class AccountBalancesController {
  constructor(private readonly service: AccountBalancesService) {}

  @Get()
  findAll(@Query('accountId') accountId?: string) {
    return this.service.findAll(accountId || null);
  }

  @Get('latest')
  async findLatest(
    @Query('beforeDate') beforeDate: string,
    @Query('accountId') accountId?: string,
  ) {
    const date = beforeDate ? new Date(beforeDate) : new Date();
    return this.service.findLatestBeforeOrOn(date, accountId || null);
  }

  @Get('calculate')
  async calculateAtDate(
    @Query('date') date: string,
    @Query('accountId') accountId?: string,
  ) {
    const targetDate = date ? new Date(date) : new Date();
    return this.service.calculateBalanceAtDate(targetDate, accountId || null);
  }

  @Post()
  async upsert(
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
      body.accountId || null,
      body.notes,
    );
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
