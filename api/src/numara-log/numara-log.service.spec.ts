import { Test, TestingModule } from '@nestjs/testing';
import { NumaraLogService } from './numara-log.service';

describe('NumaraLogService', () => {
  let service: NumaraLogService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NumaraLogService],
    }).compile();

    service = module.get<NumaraLogService>(NumaraLogService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
