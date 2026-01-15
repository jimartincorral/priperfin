import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAccountDto } from './create-account.dto';
import { UpdateAccountDto } from './update-account.dto';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  async create(createAccountDto: CreateAccountDto, profileId: string) {
    return this.prisma.account.create({
      data: {
        ...createAccountDto,
        profileId,
      } as any,
    });
  }

  async findAll(profileId: string) {
    return this.prisma.account.findMany({
      where: { profileId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, profileId: string) {
    const account = await this.prisma.account.findFirst({
      where: { id, profileId },
    });
    
    if (!account) {
      throw new NotFoundException('Account not found or access denied');
    }
    
    return account;
  }

  async update(id: string, profileId: string, updateAccountDto: UpdateAccountDto) {
    const account = await this.prisma.account.findFirst({
      where: { id, profileId },
    });
    
    if (!account) {
      throw new NotFoundException('Account not found or access denied');
    }

    return this.prisma.account.update({
      where: { id },
      data: updateAccountDto as any,
    });
  }

  async remove(id: string, profileId: string) {
    const result = await this.prisma.account.deleteMany({
      where: { id, profileId },
    });
    
    if (result.count === 0) {
      throw new NotFoundException('Account not found or access denied');
    }
    
    return { success: true };
  }
}
