import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { CreateAccountDto } from './create-account.dto';
import { UpdateAccountDto } from './update-account.dto';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { CurrentProfile } from '../auth/decorators/current-profile.decorator';
import { Profile } from '../generated/client';

@Controller('accounts')
@UseGuards(SessionAuthGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(
    @Body() createAccountDto: CreateAccountDto,
    @CurrentProfile() profile: Profile,
  ) {
    return this.accountsService.create(createAccountDto, profile.id);
  }

  @Get()
  findAll(@CurrentProfile() profile: Profile) {
    return this.accountsService.findAll(profile.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentProfile() profile: Profile) {
    return this.accountsService.findOne(id, profile.id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(
    @Param('id') id: string,
    @Body() updateAccountDto: UpdateAccountDto,
    @CurrentProfile() profile: Profile,
  ) {
    return this.accountsService.update(id, profile.id, updateAccountDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentProfile() profile: Profile) {
    return this.accountsService.remove(id, profile.id);
  }
}
