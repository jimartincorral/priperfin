import { PartialType } from '@nestjs/mapped-types';
import { CreateCostObjectDto } from './create-cost-object.dto';

export class UpdateCostObjectDto extends PartialType(CreateCostObjectDto) {}
