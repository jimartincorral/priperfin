import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { CategorizationService } from './categorization.service';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  const mockTransactionsService = {
    create: jest.fn(),
    createMany: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    import: jest.fn(),
    suggestCategory: jest.fn(),
    getAccountBalance: jest.fn(),
    createSplits: jest.fn(),
    updateSplits: jest.fn(),
    removeSplits: jest.fn(),
  };
  const mockCategorizationService = {
    predict: jest.fn(),
    trainModel: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        { provide: TransactionsService, useValue: mockTransactionsService },
        { provide: CategorizationService, useValue: mockCategorizationService },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
