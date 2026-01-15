import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';

@Controller('settings')
@UseGuards(SessionAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  @Get(':key')
  findOne(@Param('key') key: string) {
    return this.settingsService.findOne(key);
  }

  @Post(':key') // Using POST/PATCH for update
  update(@Param('key') key: string, @Body() body: { value: string }) {
    return this.settingsService.update(key, body.value);
  }
}
