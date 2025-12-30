import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './create-account.dto';
import { UpdateAccountDto } from './update-account.dto';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async create(createAccountDto: CreateAccountDto) {
    return this.prisma.account.create({
      data: createAccountDto as any,
    });
  }

  async findAll() {
    return this.prisma.account.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.account.findUnique({
      where: { id },
    });
  }

  async update(id: string, updateAccountDto: UpdateAccountDto) {
    return this.prisma.account.update({
      where: { id },
      data: updateAccountDto as any,
    });
  }

  async remove(id: string) {
    return this.prisma.account.delete({
      where: { id },
    });
  }
}
