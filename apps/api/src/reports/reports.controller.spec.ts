import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { AuthService } from '../auth/auth.service';
import { Profile } from '../generated/client';

describe('ReportsController', () => {
  let controller: ReportsController;
  const mockReportsService = {
    getCategoryBreakdown: jest.fn(),
    getSankeyData: jest.fn(),
    getCostObjectBreakdown: jest.fn(),
    getPeriodMonths: jest.fn(),
  };
  const mockAuthService = {
    validateSession: jest.fn(),
  };
  const mockProfile = { id: 'profile-1' } as Profile;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        { provide: ReportsService, useValue: mockReportsService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<ReportsController>(ReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate getCategoryBreakdown to the service with the profile id', () => {
    const query = { month: 1, year: 2025 };
    controller.getCategoryBreakdown(query, mockProfile);

    expect(mockReportsService.getCategoryBreakdown).toHaveBeenCalledWith(
      query,
      'profile-1',
    );
  });

  it('should delegate getSankeyData to the service with the profile id', () => {
    const query = { month: 1, year: 2025 };
    controller.getSankeyData(query, mockProfile);

    expect(mockReportsService.getSankeyData).toHaveBeenCalledWith(
      query,
      'profile-1',
    );
  });

  it('should delegate getCostObjectBreakdown to the service with the profile id', () => {
    const query = { month: 1, year: 2025, accountId: 'acc-1' };
    controller.getCostObjectBreakdown(query, mockProfile);

    expect(mockReportsService.getCostObjectBreakdown).toHaveBeenCalledWith(
      query,
      'profile-1',
    );
  });

  it('should wrap the period month count in an object', async () => {
    const query = { filterMode: 'year' as any, year: 2024 };
    mockReportsService.getPeriodMonths.mockResolvedValue(12);

    await expect(
      controller.getPeriodMonths(query, mockProfile),
    ).resolves.toEqual({ months: 12 });
    expect(mockReportsService.getPeriodMonths).toHaveBeenCalledWith(
      query,
      'profile-1',
    );
  });
});
