import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCostObjectDto } from './create-cost-object.dto';

@Injectable()
export class CostObjectsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCostObjectDto, profileId: string) {
    return this.prisma.costObject.create({
      data: { ...dto, profileId },
    });
  }

  async findAll(profileId: string) {
    return this.prisma.costObject.findMany({
      where: { profileId },
      orderBy: { name: 'asc' },
    });
  }

  async update(id: string, profileId: string, dto: any) {
    const costObject = await this.prisma.costObject.findFirst({
      where: { id, profileId },
    });
    
    if (!costObject) {
      throw new NotFoundException('Cost object not found or access denied');
    }

    return this.prisma.costObject.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, profileId: string) {
    const result = await this.prisma.costObject.deleteMany({
      where: { id, profileId },
    });
    
    if (result.count === 0) {
      throw new NotFoundException('Cost object not found or access denied');
    }
    
    return { success: true };
  }
}
