import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { GetTransactionsDto } from '../../transactions/get-transactions.dto';

export class GetReportsDto extends GetTransactionsDto {
  // When true, amounts are divided by the number of months in the selected
  // period so a full year can be read at a monthly level.
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  @IsBoolean()
  averageMonthly?: boolean;
}
