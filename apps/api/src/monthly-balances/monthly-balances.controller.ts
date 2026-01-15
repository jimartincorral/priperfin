import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { MonthlyBalancesService } from './monthly-balances.service';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';

@Controller('monthly-balances')
@UseGuards(SessionAuthGuard)
export class MonthlyBalancesController {
  constructor(private readonly service: MonthlyBalancesService) {}

  @Get(':month')
  findOne(@Param('month') month: string) {
    return this.service.findOne(month);
  }

  @Post()
  upsert(@Body() body: { month: string; balance: number }) {
    return this.service.upsert(body.month, body.balance);
  }
}
