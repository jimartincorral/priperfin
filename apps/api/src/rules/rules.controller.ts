import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RulesService } from './rules.service';
import { CreateRuleDto } from './dto/create-rule.dto';
import { UpdateRuleDto } from './dto/update-rule.dto';
import { TestRuleDto } from './dto/test-rule.dto';
import { SuggestionStatus, Profile } from '../generated/client';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { CurrentProfile } from '../auth/decorators/current-profile.decorator';

@Controller('rules')
@UseGuards(SessionAuthGuard)
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Post()
  create(
    @Body() createRuleDto: CreateRuleDto,
    @CurrentProfile() profile: Profile,
  ) {
    return this.rulesService.create(createRuleDto, profile.id);
  }

  @Get()
  findAll(
    @Query('enabled') enabled: string | undefined,
    @CurrentProfile() profile: Profile,
  ) {
    const isEnabled =
      enabled === 'true' ? true : enabled === 'false' ? false : undefined;
    return this.rulesService.findAll(profile.id, isEnabled);
  }

  @Get('suggestions')
  getSuggestions(
    @CurrentProfile() profile: Profile,
    @Query('status') status?: SuggestionStatus,
  ) {
    return this.rulesService.getSuggestions(profile.id, status);
  }

  @Get('suggestions/detect')
  detectPatterns(@CurrentProfile() profile: Profile) {
    return this.rulesService.detectAndStoreSuggestions(profile.id);
  }

  @Get('suggestions/for-transaction/:transactionId')
  suggestRuleForTransaction(@Param('transactionId') transactionId: string) {
    return this.rulesService.suggestRuleForTransaction(transactionId);
  }

  @Post('suggestions/reject-prompt')
  rejectRulePrompt(
    @Body() body: { conditionsJson: string; categoryId: string },
    @CurrentProfile() profile: Profile,
  ) {
    return this.rulesService.rejectRulePrompt(
      body.conditionsJson,
      body.categoryId,
      profile.id,
    );
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
    return this.rulesService.testRule(
      testRuleDto.conditionsJson,
      testRuleDto.limit,
    );
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
  findOne(@Param('id') id: string, @CurrentProfile() profile: Profile) {
    return this.rulesService.findOne(id, profile.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRuleDto: UpdateRuleDto,
    @CurrentProfile() profile: Profile,
  ) {
    return this.rulesService.update(id, profile.id, updateRuleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentProfile() profile: Profile) {
    return this.rulesService.remove(id, profile.id);
  }
}
