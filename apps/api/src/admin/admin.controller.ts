import { Controller, Delete } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @Delete('reset')
  async resetData() {
    console.log('Resetting data...');
    // Delete in order to respect foreign keys
    await this.prisma.transaction.deleteMany();
    await this.prisma.savingsGoal.deleteMany();
    await this.prisma.monthlyBalance.deleteMany();
    // We keep categories as per requirements
    return { message: 'Data reset successful' };
  }
}
