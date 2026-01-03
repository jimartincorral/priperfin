import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './create-category.dto';
import { UpdateCategoryDto } from './update-category.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryType } from '@generated/client';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    console.log('Creating category:', createCategoryDto);
    try {
      const result = await this.prisma.category.create({
        data: createCategoryDto as any,
      });
      console.log('Category created:', result);
      return result;
    } catch (e) {
      console.error('Error creating category:', e);
      throw e;
    }
  }

  async findAll(type?: CategoryType) {
    return this.prisma.category.findMany({
      where: type ? { type } : undefined,
      orderBy: [{ type: 'asc' }, { parentId: 'asc' }, { name: 'asc' }],
    });
  }

  async update(id: string, dto: any) {
    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    console.log(`[CategoriesService] Removing category ${id}...`);
    try {
      const result = await this.prisma.category.delete({
        where: { id },
      });
      console.log(`[CategoriesService] Removed category ${id}`);
      return result;
    } catch (e) {
      console.error(`[CategoriesService] Failed to remove category ${id}`, e);
      throw e;
    }
  }
}
