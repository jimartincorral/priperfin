import { Controller, Get, UseGuards } from '@nestjs/common';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { AllowApiToken } from '../auth/decorators/allow-api-token.decorator';
import { CurrentProfile } from '../auth/decorators/current-profile.decorator';
import { Profile } from '../generated/client';
import { HaSummaryService } from './ha-summary.service';

/**
 * Endpoints for the Home Assistant integration. /summary is the only route
 * in the API that accepts a long-lived API token; everything else needs a
 * PIN session.
 */
@Controller('ha')
@UseGuards(SessionAuthGuard)
export class HaController {
  constructor(private readonly summary: HaSummaryService) {}

  @Get('summary')
  @AllowApiToken()
  getSummary(@CurrentProfile() profile: Profile) {
    return this.summary.getSummary(profile);
  }

  /** What the Settings page shows to help set the integration up. */
  @Get('info')
  getInfo() {
    const hostname = process.env.PRIPERFIN_ADDON_HOSTNAME || null;
    const port = process.env.PORT || '3000';
    return {
      addonHostname: hostname,
      integrationUrl: hostname ? `http://${hostname}:${port}` : null,
      appVersion: process.env.PRIPERFIN_VERSION || null,
      allowDirectAccess: process.env.PRIPERFIN_ALLOW_DIRECT_ACCESS === 'true',
    };
  }
}
