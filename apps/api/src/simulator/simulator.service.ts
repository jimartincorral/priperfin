import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AccountsService } from '../accounts/accounts.service';
import { TransactionsService } from '../transactions/transactions.service';
import { ReportsService } from '../reports/reports.service';
import { SavingsGoalsService } from '../savings-goals/savings-goals.service';
import { SaveScenarioDto } from './scenario.dto';

/** Complete months of history the Simulator can average over. */
export const HISTORY_MONTHS = 12;

const round2 = (n: number) => Math.round(n * 100) / 100;
const monthKey = (d: Date) =>
  `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

@Injectable()
export class SimulatorService {
  constructor(
    private prisma: PrismaService,
    private accounts: AccountsService,
    private transactions: TransactionsService,
    private reports: ReportsService,
    private goals: SavingsGoalsService,
  ) {}

  /**
   * The starting point every scenario is projected from: the last complete
   * months of cash flow, today's balance across all accounts and the savings
   * goals. The current month is left out because it is not over yet.
   */
  async getBaseline(profileId: string, now = new Date()) {
    const from = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - HISTORY_MONTHS, 1),
    );
    const [months, accounts, goals, currencySetting] = await Promise.all([
      this.reports.getMonthlyCashFlow(profileId, from, HISTORY_MONTHS),
      this.accounts.findAll(profileId),
      this.goals.findAll(profileId),
      this.prisma.setting.findUnique({ where: { key: 'currency' } }),
    ]);

    const balances = await Promise.all(
      accounts.map((account) =>
        this.transactions.getAccountBalance(account.id, profileId),
      ),
    );

    return {
      currency: currencySetting?.value || null,
      currentMonth: monthKey(now),
      balance: round2(balances.reduce((sum, b) => sum + b.balance, 0)),
      accountCount: accounts.length,
      months,
      goals: goals.map((g) => ({
        id: g.id,
        name: g.name,
        targetAmount: g.targetAmount.toNumber(),
        savedAmount: g.savedAmount.toNumber(),
        targetDate: g.targetDate ? g.targetDate.toISOString() : null,
        isEvergreen: g.isEvergreen,
      })),
    };
  }

  async findAll(profileId: string) {
    const rows = await this.prisma.scenario.findMany({
      where: { profileId },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((row) => this.toDto(row));
  }

  async create(profileId: string, dto: SaveScenarioDto) {
    const row = await this.prisma.scenario.create({
      data: {
        profileId,
        name: dto.name.trim(),
        changesJson: JSON.stringify(dto.changes),
        basisJson: JSON.stringify(dto.basis),
      },
    });
    return this.toDto(row);
  }

  async update(id: string, profileId: string, dto: SaveScenarioDto) {
    await this.findOwned(id, profileId);
    const row = await this.prisma.scenario.update({
      where: { id },
      data: {
        name: dto.name.trim(),
        changesJson: JSON.stringify(dto.changes),
        basisJson: JSON.stringify(dto.basis),
      },
    });
    return this.toDto(row);
  }

  async remove(id: string, profileId: string) {
    await this.findOwned(id, profileId);
    await this.prisma.scenario.delete({ where: { id } });
    return { id };
  }

  private async findOwned(id: string, profileId: string) {
    const row = await this.prisma.scenario.findFirst({
      where: { id, profileId },
    });
    if (!row) throw new NotFoundException('Scenario not found');
    return row;
  }

  private toDto(row: {
    id: string;
    name: string;
    changesJson: string;
    basisJson: string;
    createdAt: Date;
    updatedAt: Date;
  }) {
    return {
      id: row.id,
      name: row.name,
      changes: parseJson<unknown[]>(row.changesJson, []),
      basis: parseJson<Record<string, unknown>>(row.basisJson, {}),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
