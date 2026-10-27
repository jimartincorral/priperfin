import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

/**
 * The kinds of change, grouped by how they hit the monthly figures:
 * - recurring: a new payment every month with no end (mortgage, new rent);
 *   `category` names an existing expense category it replaces, if any.
 * - temporary: a payment every month for `months` months (a loan).
 * - oneoff: a single amount in `startMonth`, `direction` in or out.
 * - income: a change to monthly income (+ or −), no end.
 * - category: spend `amount` percent more (+) or less (−) on `category`.
 */
export const CHANGE_KINDS = [
  'recurring',
  'temporary',
  'oneoff',
  'income',
  'category',
] as const;

export class ScenarioChangeDto {
  @IsString()
  @Length(1, 64)
  id: string;

  @IsIn(CHANGE_KINDS)
  kind: (typeof CHANGE_KINDS)[number];

  @IsString()
  @MaxLength(100)
  name: string;

  @IsBoolean()
  enabled: boolean;

  @IsNumber()
  @Min(-1e9)
  @Max(1e9)
  amount: number;

  @Matches(MONTH)
  startMonth: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(600)
  months?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @IsOptional()
  @IsIn(['in', 'out'])
  direction?: 'in' | 'out';
}

/** Which past months the averages use, and how far ahead to project. */
export class ScenarioBasisDto {
  @IsIn([3, 6, 12])
  period: number;

  @IsArray()
  @ArrayMaxSize(24)
  @Matches(MONTH, { each: true })
  excluded: string[];

  @IsIn([12, 24, 36])
  horizon: number;

  /** Accounts the starting point uses; empty or absent means all of them. */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(100)
  @IsString({ each: true })
  @MaxLength(64, { each: true })
  accounts?: string[];
}

export class SaveScenarioDto {
  @IsString()
  @Length(1, 100)
  name: string;

  @IsArray()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => ScenarioChangeDto)
  changes: ScenarioChangeDto[];

  @ValidateNested()
  @Type(() => ScenarioBasisDto)
  basis: ScenarioBasisDto;
}
