import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UsePipes,
  ValidationPipe,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './create-transaction.dto';
import { UpdateTransactionDto } from './update-transaction.dto';
import { GetTransactionsDto } from './get-transactions.dto';
import { CreateSplitsDto } from './create-split.dto';
import { SessionAuthGuard } from '../auth/guards/session-auth.guard';
import { CurrentProfile } from '../auth/decorators/current-profile.decorator';
import { Profile } from '../generated/client';

@Controller('transactions')
@UseGuards(SessionAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(
    @Body() createTransactionDto: CreateTransactionDto,
    @CurrentProfile() profile: Profile,
  ) {
    return this.transactionsService.create(createTransactionDto, profile.id);
  }

  @Post('import')
  @Throttle({ import: { limit: 20, ttl: 3600000 } })
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }), // 5MB
        ],
      }),
    )
    file: Express.Multer.File,
    @CurrentProfile() profile: Profile,
  ) {
    return this.transactionsService.import(file.buffer, profile.id);
  }

  @Post('bulk')
  @Throttle({ import: { limit: 20, ttl: 3600000 } })
  async createBulk(
    @Body()
    body: {
      transactions: CreateTransactionDto[];
      force?: boolean;
      mergeInstructions?: any[];
    },
    @CurrentProfile() profile: Profile,
  ) {
    console.log('[TransactionsController] createBulk called');
    const result = await this.transactionsService.createMany(
      body.transactions,
      body.force || false,
      body.mergeInstructions || [],
      profile.id,
    );
    console.log('[TransactionsController] createBulk result:', result);
    return result;
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
    @CurrentProfile() profile: Profile,
  ) {
    return this.transactionsService.update(
      id,
      profile.id,
      updateTransactionDto,
    );
  }

  @Get('balance')
  getBalance(
    @CurrentProfile() profile: Profile,
    @Query('accountId') accountId?: string,
  ) {
    if (accountId) {
      return this.transactionsService.getAccountBalance(accountId, profile.id);
    }
    return this.transactionsService.getBalance(profile.id);
  }

  @Get('suggest')
  suggestCategory(
    @Query('description') description: string,
    @CurrentProfile() profile: Profile,
  ) {
    return this.transactionsService.suggestCategory(description, profile.id);
  }

  @Post('propagate')
  propagate(
    @Body() body: { description: string; categoryId: string },
    @CurrentProfile() profile: Profile,
  ) {
    return this.transactionsService.propagateCategory(
      body.description,
      body.categoryId,
      profile.id,
    );
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  findAll(
    @Query() query: GetTransactionsDto,
    @CurrentProfile() profile: Profile,
  ) {
    return this.transactionsService.findAll(query, profile.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentProfile() profile: Profile) {
    return this.transactionsService.findOne(id, profile.id);
  }

  @Post(':id/splits')
  @UsePipes(new ValidationPipe({ transform: true }))
  createSplits(
    @Param('id') id: string,
    @Body() dto: CreateSplitsDto,
    @CurrentProfile() profile: Profile,
  ) {
    return this.transactionsService.createSplits(id, dto, profile.id);
  }

  @Put(':id/splits')
  @UsePipes(new ValidationPipe({ transform: true }))
  updateSplits(
    @Param('id') id: string,
    @Body() dto: CreateSplitsDto,
    @CurrentProfile() profile: Profile,
  ) {
    return this.transactionsService.updateSplits(id, dto, profile.id);
  }

  @Delete(':id/splits')
  deleteSplits(@Param('id') id: string, @CurrentProfile() profile: Profile) {
    return this.transactionsService.deleteSplits(id, profile.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentProfile() profile: Profile) {
    return this.transactionsService.remove(id, profile.id);
  }
}
