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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './create-transaction.dto';
import { UpdateTransactionDto } from './update-transaction.dto';
import { GetTransactionsDto } from './get-transactions.dto';
import { CreateSplitsDto } from './create-split.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createTransactionDto: CreateTransactionDto) {
    return this.transactionsService.create(createTransactionDto);
  }

  @Post('import')
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
  ) {
    return this.transactionsService.import(file.buffer);
  }

  @Post('bulk')
  async createBulk(
    @Body()
    body: {
      transactions: CreateTransactionDto[];
      force?: boolean;
      mergeInstructions?: any[];
    },
  ) {
    console.log('[TransactionsController] createBulk called');
    const result = await this.transactionsService.createMany(
      body.transactions,
      body.force || false,
      body.mergeInstructions || [],
    );
    console.log('[TransactionsController] createBulk result:', result);
    return result;
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(
    @Param('id') id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(id, updateTransactionDto);
  }

  @Get('balance')
  getBalance(@Query('accountId') accountId?: string) {
    if (accountId) {
      return this.transactionsService.getAccountBalance(accountId);
    }
    return this.transactionsService.getBalance();
  }

  @Get('suggest')
  suggestCategory(@Query('description') description: string) {
    return this.transactionsService.suggestCategory(description);
  }

  @Post('propagate')
  propagate(@Body() body: { description: string; categoryId: string }) {
    return this.transactionsService.propagateCategory(
      body.description,
      body.categoryId,
    );
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  findAll(@Query() query: GetTransactionsDto) {
    return this.transactionsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }

  @Post(':id/splits')
  @UsePipes(new ValidationPipe({ transform: true }))
  createSplits(@Param('id') id: string, @Body() dto: CreateSplitsDto) {
    return this.transactionsService.createSplits(id, dto);
  }

  @Put(':id/splits')
  @UsePipes(new ValidationPipe({ transform: true }))
  updateSplits(@Param('id') id: string, @Body() dto: CreateSplitsDto) {
    return this.transactionsService.updateSplits(id, dto);
  }

  @Delete(':id/splits')
  deleteSplits(@Param('id') id: string) {
    return this.transactionsService.deleteSplits(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transactionsService.remove(id);
  }
}
