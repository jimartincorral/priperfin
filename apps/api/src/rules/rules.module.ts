import { Module } from '@nestjs/common';
import { RulesService } from './rules.service';
import { RulesController } from './rules.controller';
import { PrismaService } from '../prisma/prisma.service';
import { RuleEvaluatorService } from './rule-evaluator.service';
import { PatternDetectionService } from './pattern-detection.service';

@Module({
  controllers: [RulesController],
  providers: [RulesService, PrismaService, RuleEvaluatorService, PatternDetectionService],
  exports: [RulesService],
})
export class RulesModule {}
