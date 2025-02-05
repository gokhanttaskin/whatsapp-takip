import { Test, TestingModule } from '@nestjs/testing';
import { NumaraLogController } from './numara-log.controller';

describe('NumaraLogController', () => {
  let controller: NumaraLogController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NumaraLogController],
    }).compile();

    controller = module.get<NumaraLogController>(NumaraLogController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
