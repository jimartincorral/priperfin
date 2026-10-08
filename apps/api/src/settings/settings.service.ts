import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const settings = await this.prisma.setting.findMany();
    return settings.filter((setting) => !isSecretSettingKey(setting.key));
  }

  async findOne(key: string) {
    if (isSecretSettingKey(key)) return null;
    const setting = await this.prisma.setting.findUnique({ where: { key } });
    return setting?.value || null;
  }

  async update(key: string, value: string) {
    return this.prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
}

/**
 * Settings that hold credentials (the Enable Banking application id and
 * private key) are managed through the bank-sync endpoints, which only ever
 * report whether they are set. They must never be returned verbatim here.
 */
export function isSecretSettingKey(key: string): boolean {
  return key.startsWith('enable_banking_');
}
