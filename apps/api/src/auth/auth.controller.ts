import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Headers,
  UseGuards,
  Ip,
  Param,
  Req,
  UsePipes,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { ApiTokenService } from './api-token.service';
import { CreateApiTokenDto } from './dtos/create-api-token.dto';
import { getHaUser } from '../ingress-security.middleware';
import { CreateProfileDto } from './dtos/create-profile.dto';
import { LoginDto } from './dtos/login.dto';
import { ChangePinDto } from './dtos/change-pin.dto';
import { SessionAuthGuard } from './guards/session-auth.guard';
import { Public } from './decorators/public.decorator';
import { CurrentProfile } from './decorators/current-profile.decorator';
import { Profile } from '../generated/client';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private apiTokenService: ApiTokenService,
  ) {}

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
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
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

  // ---- Home Assistant user (Ingress) ----

  /**
   * Who opened the app through Home Assistant Ingress, and which profile is
   * mapped to them. Public so the login page can pre-select the profile; the
   * PIN is still required to sign in.
   */
  @Get('ha-user')
  @Public()
  async getHaUser(
    @Req() req: Request,
    @Headers('x-session-token') sessionToken?: string,
  ) {
    const user = getHaUser(req);
    if (!user) {
      return {
        user: null,
        mappedProfileName: null,
        linkedToCurrentProfile: false,
      };
    }
    const mapping = await this.authService.getHaUserMapping(user.id);
    let linkedToCurrentProfile = false;
    if (sessionToken && mapping) {
      const current = await this.authService.validateSession(sessionToken);
      linkedToCurrentProfile = current?.id === mapping.profileId;
    }
    return {
      user,
      mappedProfileName: mapping?.profileName ?? null,
      linkedToCurrentProfile,
    };
  }

  /** Pre-select the current profile whenever this HA user opens PriPerFin. */
  @Post('ha-user/link')
  @UseGuards(SessionAuthGuard)
  async linkHaUser(@Req() req: Request, @CurrentProfile() profile: Profile) {
    const user = getHaUser(req);
    if (!user) {
      throw new BadRequestException(
        'This request did not come through Home Assistant Ingress.',
      );
    }
    await this.authService.linkHaUser(user.id, profile.id);
    return { message: 'Linked', user, profileName: profile.name };
  }

  @Delete('ha-user/link')
  @UseGuards(SessionAuthGuard)
  async unlinkHaUser(@Req() req: Request) {
    const user = getHaUser(req);
    if (!user) {
      throw new BadRequestException(
        'This request did not come through Home Assistant Ingress.',
      );
    }
    await this.authService.unlinkHaUser(user.id);
    return { message: 'Unlinked' };
  }

  // ---- API tokens (long-lived, read-only: see @AllowApiToken) ----

  @Post('api-tokens')
  @UseGuards(SessionAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @Throttle({ default: { limit: 5, ttl: 3600000 } })
  async createApiToken(
    @CurrentProfile() profile: Profile,
    @Body() dto: CreateApiTokenDto,
  ) {
    return this.apiTokenService.create(profile.id, dto.name);
  }

  @Get('api-tokens')
  @UseGuards(SessionAuthGuard)
  async listApiTokens(@CurrentProfile() profile: Profile) {
    return this.apiTokenService.list(profile.id);
  }

  @Delete('api-tokens/:id')
  @UseGuards(SessionAuthGuard)
  async revokeApiToken(
    @CurrentProfile() profile: Profile,
    @Param('id') id: string,
  ) {
    await this.apiTokenService.revoke(profile.id, id);
    return { message: 'Token revoked' };
  }
}
