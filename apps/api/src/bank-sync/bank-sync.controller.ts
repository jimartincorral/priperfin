import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { Request } from 'express';
import { BankSyncService } from './bank-sync.service';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { CurrentProfile } from '../auth/decorators/current-profile.decorator';
import { Profile } from '../generated/client';
import {
  BankSyncSettingsDto,
  PsuContext,
} from './interfaces/enable-banking.interface';

/**
 * The person behind a request, for the bank's `Psu-*` headers. Behind Home
 * Assistant Ingress or a reverse proxy the browser's address is the first
 * X-Forwarded-For entry; otherwise it is the socket's peer.
 */
export function psuFromRequest(req: Request): PsuContext {
  const forwarded = req.headers['x-forwarded-for'];
  const first = (Array.isArray(forwarded) ? forwarded[0] : forwarded)
    ?.split(',')[0]
    ?.trim();
  return {
    ipAddress: first || req.socket?.remoteAddress || undefined,
    userAgent: req.headers['user-agent'] || undefined,
  };
}

@Controller('bank-sync')
@UseGuards(SessionAuthGuard)
export class BankSyncController {
  constructor(private readonly bankSyncService: BankSyncService) {}

  @Get('settings')
  getSettings() {
    return this.bankSyncService.getSettings();
  }

  @Post('settings')
  @UsePipes(new ValidationPipe({ transform: true }))
  saveSettings(@Body() dto: BankSyncSettingsDto) {
    return this.bankSyncService.saveSettings(dto);
  }

  @Get('banks')
  getBanks(@Query('country') country: string = 'ES') {
    return this.bankSyncService.getAvailableBanks(country);
  }

  @Post('auth')
  startAuth(
    @Body() body: { aspspName: string; country?: string; redirectUrl?: string },
  ) {
    return this.bankSyncService.startAuth(
      body.aspspName,
      body.country,
      body.redirectUrl,
    );
  }

  @Post('callback')
  handleCallback(
    @Body() body: { code: string },
    @CurrentProfile() profile: Profile,
    @Req() req: Request,
  ) {
    return this.bankSyncService.handleCallback(
      body.code,
      profile.id,
      psuFromRequest(req),
    );
  }

  @Get('connections')
  getConnections(@CurrentProfile() profile: Profile) {
    return this.bankSyncService.getConnections(profile.id);
  }

  @Delete('connections/:id')
  deleteConnection(
    @Param('id') id: string,
    @CurrentProfile() profile: Profile,
  ) {
    return this.bankSyncService.deleteConnection(id, profile.id);
  }

  @Post('link-account')
  linkAccount(
    @Body()
    body: {
      accountId: string;
      bankAccountUid: string;
      connectionId: string;
    },
    @CurrentProfile() profile: Profile,
  ) {
    return this.bankSyncService.linkAccount(
      body.accountId,
      body.bankAccountUid,
      body.connectionId,
      profile.id,
    );
  }

  @Post('unlink-account')
  unlinkAccount(
    @Body() body: { accountId: string },
    @CurrentProfile() profile: Profile,
  ) {
    return this.bankSyncService.unlinkAccount(body.accountId, profile.id);
  }

  @Post('sync')
  syncTransactions(
    @Body() body: { accountId?: string },
    @CurrentProfile() profile: Profile,
    @Req() req: Request,
  ) {
    return this.bankSyncService.syncTransactions(
      body?.accountId,
      profile.id,
      psuFromRequest(req),
    );
  }
}
