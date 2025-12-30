import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCostObjectDto } from './create-cost-object.dto';

@Injectable()
export class CostObjectsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCostObjectDto) {
    return this.prisma.costObject.create({
      data: dto,
    });
  }

  async findAll() {
    return this.prisma.costObject.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async update(id: string, dto: any) {
    return this.prisma.costObject.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    return this.prisma.costObject.delete({
      where: { id },
    });
  }
}
