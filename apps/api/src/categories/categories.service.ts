import { Injectable, Logger } from '@nestjs/common';
import { CreateCategoryDto } from './create-category.dto';
import { UpdateCategoryDto } from './update-category.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CategoryType } from '../generated/client';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto, profileId: string) {
    this.logger.log(`Creating category: ${JSON.stringify(createCategoryDto)}`);
    try {
      const result = await this.prisma.category.create({
        data: {
          ...createCategoryDto,
          profileId,
        },
      });
      this.logger.log(`Category created: ${result.id}`);
      return result;
    } catch (e) {
      this.logger.error('Error creating category:', e);
      throw e;
    }
  }

  async findAll(profileId: string, type?: CategoryType) {
    return this.prisma.category.findMany({
      where: {
        profileId,
        ...(type ? { type } : {}),
      },
      orderBy: [{ type: 'asc' }, { parentId: 'asc' }, { name: 'asc' }],
    });
  }

  async update(id: string, profileId: string, dto: UpdateCategoryDto) {
    // Verify ownership before updating
    const category = await this.prisma.category.findFirst({
      where: { id, profileId },
    });

    if (!category) {
      throw new Error('Category not found or access denied');
    }

    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, profileId: string) {
    this.logger.log(`Removing category ${id}...`);
    try {
      // Verify ownership before deleting
      const result = await this.prisma.category.deleteMany({
        where: { id, profileId },
      });

      if (result.count === 0) {
        throw new Error('Category not found or access denied');
      }

      this.logger.log(`Removed category ${id}`);
      return { success: true };
    } catch (e) {
      this.logger.error(`Failed to remove category ${id}`, e);
      throw e;
    }
  }
}
