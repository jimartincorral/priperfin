import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Headers,
  UseGuards,
  Ip,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { CreateProfileDto } from './dtos/create-profile.dto';
import { LoginDto } from './dtos/login.dto';
import { ChangePinDto } from './dtos/change-pin.dto';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentProfile } from './decorators/current-profile.decorator';
import { Profile } from '../generated/client';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('status')
  @Public()
  async getStatus() {
    const hasProfiles = await this.authService.hasProfiles();
    return { setupComplete: hasProfiles };
  }

  @Get('profiles')
  @Public()
  async getProfiles() {
    return this.authService.getAllProfiles();
  }

  @Post('setup')
  @Public()
  @Throttle({ default: { limit: 3, ttl: 3600000 } })
  async setup(@Body() dto: CreateProfileDto) {
    const hasProfiles = await this.authService.hasProfiles();
    if (hasProfiles) {
      return {
        statusCode: 400,
        message: 'Setup already completed',
      };
    }

    const profile = await this.authService.createProfile(dto);
    return {
      message: 'Profile created successfully',
      profile,
    };
  }

  @Post('login')
  @Public()
  @Throttle({ login: { limit: 5, ttl: 60000 } })
  async login(
    @Body() dto: LoginDto,
    @Ip() ipAddress: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.login(dto, ipAddress, userAgent);
  }

  @Post('logout')
  @UseGuards(SessionAuthGuard)
  async logout(@Headers('x-session-token') token: string) {
    await this.authService.logout(token);
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(SessionAuthGuard)
  async getCurrentProfile(@CurrentProfile() profile: Profile) {
    return {
      profile: {
        id: profile.id,
        name: profile.name,
      },
    };
  }

  @Post('profile')
  @UseGuards(SessionAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 3600000 } })
  async createAdditionalProfile(@Body() dto: CreateProfileDto) {
    const profile = await this.authService.createProfile(dto);
    return {
      message: 'Profile created successfully',
      profile,
    };
  }

  @Post('change-pin')
  @UseGuards(SessionAuthGuard)
  @Throttle({ default: { limit: 3, ttl: 3600000 } })
  async changePin(
    @CurrentProfile() profile: Profile,
    @Body() dto: ChangePinDto,
  ) {
    await this.authService.changePin(profile.id, dto);
    return {
      message: 'PIN changed successfully. Please log in again.',
    };
  }

  @Delete('profile')
  @UseGuards(SessionAuthGuard)
  @Throttle({ default: { limit: 3, ttl: 3600000 } })
  async deleteProfile(
    @CurrentProfile() profile: Profile,
    @Body() dto: { pin: string },
  ) {
    await this.authService.deleteProfile(profile.id, dto);
    return {
      message: 'Profile deleted successfully.',
    };
  }
}
