import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RulesService } from './rules.service';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';
import { TestRuleDto } from './dto/test-rule.dto';
import { SuggestionStatus } from '../generated/client';

@Controller('rules')
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Post()
  create(@Body() createRuleDto: CreateRuleDto) {
    return this.rulesService.create(createRuleDto);
  }

  @Get()
  findAll(@Query('enabled') enabled?: string) {
    const isEnabled = enabled === 'true' ? true : enabled === 'false' ? false : undefined;
    return this.rulesService.findAll(isEnabled);
  }

  @Get('suggestions')
  getSuggestions(@Query('status') status?: SuggestionStatus) {
    return this.rulesService.getSuggestions(status);
  }

  @Get('suggestions/detect')
  detectPatterns() {
    return this.rulesService.detectAndStoreSuggestions();
  }

  @Get('suggestions/for-transaction/:transactionId')
  suggestRuleForTransaction(@Param('transactionId') transactionId: string) {
    return this.rulesService.suggestRuleForTransaction(transactionId);
  }

  @Post('suggestions/:id/accept')
  acceptSuggestion(@Param('id') id: string) {
    return this.rulesService.acceptSuggestion(id);
  }

  @Post('suggestions/:id/reject')
  rejectSuggestion(@Param('id') id: string) {
    return this.rulesService.rejectSuggestion(id);
  }

  @Post('test')
  testRule(@Body() testRuleDto: TestRuleDto) {
    return this.rulesService.testRule(testRuleDto.conditionsJson, testRuleDto.limit);
  }

  @Post('reorder')
  reorderPriorities(@Body() body: { ruleIds: string[] }) {
    return this.rulesService.reorder(body.ruleIds);
  }

  @Post(':id/apply')
  applyToExisting(@Param('id') id: string) {
    return this.rulesService.applyToExisting(id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rulesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRuleDto: UpdateRuleDto) {
    return this.rulesService.update(id, updateRuleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rulesService.remove(id);
  }
}
