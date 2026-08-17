import { Test, TestingModule } from '@nestjs/testing';
import { SavingsGoalsController } from './savings-goals.controller';
import { SavingsGoalsService } from './savings-goals.service';
import { AuthService } from '../auth/auth.service';
import { Profile } from '../generated/client';

describe('SavingsGoalsController', () => {
  let controller: SavingsGoalsController;
  const mockSavingsGoalsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
  const mockAuthService = {
    validateSession: jest.fn(),
  };
  const mockProfile = { id: 'profile-1' } as Profile;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SavingsGoalsController],
      providers: [
        { provide: SavingsGoalsService, useValue: mockSavingsGoalsService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<SavingsGoalsController>(SavingsGoalsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should pass profile id to service on create', () => {
    const dto = { name: 'Goal', targetAmount: 100 } as any;
    controller.create(dto, mockProfile);
    expect(mockSavingsGoalsService.create).toHaveBeenCalledWith(
      dto,
      'profile-1',
    );
  });

  it('should pass profile id to service on findAll', () => {
    controller.findAll(mockProfile);
    expect(mockSavingsGoalsService.findAll).toHaveBeenCalledWith('profile-1');
  });

  it('should pass profile id to service on update', () => {
    const dto = { savedAmount: 50 } as any;
    controller.update('goal-1', dto, mockProfile);
    expect(mockSavingsGoalsService.update).toHaveBeenCalledWith(
      'goal-1',
      'profile-1',
      dto,
    );
  });

  it('should pass profile id to service on remove', () => {
    controller.remove('goal-1', mockProfile);
    expect(mockSavingsGoalsService.remove).toHaveBeenCalledWith(
      'goal-1',
      'profile-1',
    );
  });
});
