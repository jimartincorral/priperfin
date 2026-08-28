import {
  Injectable,
  Logger,
  BadRequestException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { CreateProfileDto } from './dtos/create-profile.dto';
import { LoginDto } from './dtos/login.dto';
import { ChangePinDto } from './dtos/change-pin.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly SESSION_DURATION_DAYS = 7;
  private readonly BCRYPT_ROUNDS = 12;

  constructor(private prisma: PrismaService) {}

  private getPinLengthSettingKey(profileId: string) {
    return `pin_length_profile_${profileId}`;
  }

  async createProfile(dto: CreateProfileDto) {
    this.logger.log(`Creating profile: ${dto.name}`);

    // Validate PIN
    this.validatePin(dto.pin);

    // Check if profile name already exists
    const existing = await this.prisma.profile.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException('Profile with this name already exists');
    }

    // Hash PIN
    const pinHash = await bcrypt.hash(dto.pin, this.BCRYPT_ROUNDS);

    // Create profile
    const profile = await this.prisma.profile.create({
      data: {
        name: dto.name,
        pinHash,
      },
    });

    await this.prisma.setting.upsert({
      where: { key: this.getPinLengthSettingKey(profile.id) },
      update: { value: dto.pin.length.toString() },
      create: {
        key: this.getPinLengthSettingKey(profile.id),
        value: dto.pin.length.toString(),
      },
    });

    this.logger.log(`Profile created: ${profile.id}`);

    return {
      id: profile.id,
      name: profile.name,
      createdAt: profile.createdAt,
    };
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    this.logger.log(`Login attempt for profile: ${dto.name}`);

    // Find profile
    const profile = await this.prisma.profile.findUnique({
      where: { name: dto.name },
    });

    if (!profile) {
      this.logger.warn(`Login failed: Profile not found - ${dto.name}`);
      throw new UnauthorizedException('Invalid profile name or PIN');
    }

    // Verify PIN
    const isPinValid = await bcrypt.compare(dto.pin, profile.pinHash);

    if (!isPinValid) {
      this.logger.warn(`Login failed: Invalid PIN for profile ${dto.name}`);
      throw new UnauthorizedException('Invalid profile name or PIN');
    }

    await this.prisma.setting.upsert({
      where: { key: this.getPinLengthSettingKey(profile.id) },
      update: { value: dto.pin.length.toString() },
      create: {
        key: this.getPinLengthSettingKey(profile.id),
        value: dto.pin.length.toString(),
      },
    });

    // Generate session token
    const token = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.SESSION_DURATION_DAYS);

    // Create session
    const session = await this.prisma.session.create({
      data: {
        profileId: profile.id,
        token,
        expiresAt,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    });

    this.logger.log(
      `Login successful for profile ${dto.name}, session expires: ${expiresAt.toISOString()}`,
    );

    return {
      token: session.token,
      expiresAt: session.expiresAt.toISOString(),
      profile: {
        id: profile.id,
        name: profile.name,
      },
    };
  }

  async validateSession(token: string) {
    const session = await this.prisma.session.findUnique({
      where: { token },
      include: { profile: true },
    });

    if (!session) {
      return null;
    }

    // Check if expired
    if (session.expiresAt < new Date()) {
      this.logger.log(`Session expired: ${session.id}`);
      // Clean up expired session
      await this.prisma.session.delete({ where: { id: session.id } });
      return null;
    }

    // Update lastUsedAt
    await this.prisma.session.update({
      where: { id: session.id },
      data: { lastUsedAt: new Date() },
    });

    return session.profile;
  }

  async logout(token: string) {
    this.logger.log(`Logging out session: ${token.substring(0, 8)}...`);

    await this.prisma.session.delete({
      where: { token },
    });

    this.logger.log('Logout successful');
  }

  async changePin(profileId: string, dto: ChangePinDto) {
    this.logger.log(`Change PIN request for profile: ${profileId}`);

    // Get profile
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      throw new BadRequestException('Profile not found');
    }

    // Verify old PIN
    const isOldPinValid = await bcrypt.compare(dto.oldPin, profile.pinHash);

    if (!isOldPinValid) {
      this.logger.warn(`Change PIN failed: Invalid old PIN for ${profileId}`);
      throw new UnauthorizedException('Current PIN is incorrect');
    }

    // Validate new PIN
    this.validatePin(dto.newPin);

    // Hash new PIN
    const newPinHash = await bcrypt.hash(dto.newPin, this.BCRYPT_ROUNDS);

    // Update profile
    await this.prisma.profile.update({
      where: { id: profileId },
      data: { pinHash: newPinHash },
    });

    await this.prisma.setting.upsert({
      where: { key: this.getPinLengthSettingKey(profileId) },
      update: { value: dto.newPin.length.toString() },
      create: {
        key: this.getPinLengthSettingKey(profileId),
        value: dto.newPin.length.toString(),
      },
    });

    // Invalidate all sessions for this profile (force re-login)
    const deletedSessions = await this.prisma.session.deleteMany({
      where: { profileId },
    });

    this.logger.log(
      `PIN changed successfully for ${profileId}, invalidated ${deletedSessions.count} sessions`,
    );
  }

  async hasProfiles(): Promise<boolean> {
    const count = await this.prisma.profile.count();
    return count > 0;
  }

  async getAllProfiles() {
    const profiles = await this.prisma.profile.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    const settings = await this.prisma.setting.findMany({
      where: {
        key: {
          startsWith: 'pin_length_profile_',
        },
      },
    });

    const pinLengthByProfileId = new Map<string, number>();
    settings.forEach((setting) => {
      const profileId = setting.key.replace('pin_length_profile_', '');
      const parsedLength = parseInt(setting.value, 10);
      if (
        !Number.isNaN(parsedLength) &&
        parsedLength >= 4 &&
        parsedLength <= 6
      ) {
        pinLengthByProfileId.set(profileId, parsedLength);
      }
    });

    return profiles.map((profile) => ({
      ...profile,
      pinLength: pinLengthByProfileId.get(profile.id) ?? 6,
    }));
  }

  async deleteProfile(profileId: string, dto: { pin: string }) {
    this.logger.log(`Delete profile request for: ${profileId}`);

    // Get profile
    const profile = await this.prisma.profile.findUnique({
      where: { id: profileId },
    });

    if (!profile) {
      throw new BadRequestException('Profile not found');
    }

    // Verify PIN for safety
    const isPinValid = await bcrypt.compare(dto.pin, profile.pinHash);

    if (!isPinValid) {
      this.logger.warn(`Delete profile failed: Invalid PIN for ${profileId}`);
      throw new UnauthorizedException('PIN is incorrect');
    }

    // Check if this is the last profile
    const profileCount = await this.prisma.profile.count();
    if (profileCount <= 1) {
      throw new BadRequestException(
        'Cannot delete the last profile. Use "Delete All Data" instead.',
      );
    }

    // Delete profile (Prisma CASCADE will delete all related data)
    await this.prisma.profile.delete({
      where: { id: profileId },
    });

    await this.prisma.setting
      .delete({ where: { key: this.getPinLengthSettingKey(profileId) } })
      .catch(() => null);

    this.logger.log(`Profile deleted successfully: ${profileId}`);
  }

  private validatePin(pin: string) {
    // Length check
    if (pin.length < 4 || pin.length > 6) {
      throw new BadRequestException('PIN must be 4-6 digits');
    }

    // Numeric only
    if (!/^\d+$/.test(pin)) {
      throw new BadRequestException('PIN must contain only digits');
    }

    // No repeating digits (1111, 2222, etc.)
    if (/^(\d)\1+$/.test(pin)) {
      throw new BadRequestException('PIN cannot be all the same digit');
    }

    // No sequential patterns (1234, 4321, etc.)
    const sequential = [
      '0123',
      '1234',
      '2345',
      '3456',
      '4567',
      '5678',
      '6789',
      '9876',
      '8765',
      '7654',
      '6543',
      '5432',
      '4321',
      '3210',
    ];
    if (sequential.some((seq) => pin.includes(seq))) {
      throw new BadRequestException('PIN cannot contain sequential digits');
    }

    // No common PINs
    const commonPins = [
      '0000',
      '1111',
      '2222',
      '3333',
      '4444',
      '5555',
      '6666',
      '7777',
      '8888',
      '9999',
      '1234',
      '4321',
    ];
    if (commonPins.includes(pin)) {
      throw new BadRequestException(
        'PIN is too common, please choose a different one',
      );
    }
  }
}
