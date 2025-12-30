import { Module } from '@nestjs/common';
import { CostObjectsService } from './cost-objects.service';
import { CostObjectsController } from './cost-objects.controller';

@Module({
  providers: [CostObjectsService],
  controllers: [CostObjectsController],
})
export class CostObjectsModule {}
