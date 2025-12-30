import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { GetTransactionsDto } from '../transactions/get-transactions.dto';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('category-breakdown')
  @UsePipes(new ValidationPipe({ transform: true }))
  getCategoryBreakdown(@Query() query: GetTransactionsDto) {
    return this.reportsService.getCategoryBreakdown(query);
  }

  @Get('sankey')
  @UsePipes(new ValidationPipe({ transform: true }))
  getSankeyData(@Query() query: GetTransactionsDto) {
    return this.reportsService.getSankeyData(query);
  }

  @Get('cost-object-breakdown')
  @UsePipes(new ValidationPipe({ transform: true }))
  getCostObjectBreakdown(@Query() query: GetTransactionsDto) {
    return this.reportsService.getCostObjectBreakdown(query);
  }
}
