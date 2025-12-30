import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { MonthlyBalancesService } from './monthly-balances.service';

@Controller('monthly-balances')
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
