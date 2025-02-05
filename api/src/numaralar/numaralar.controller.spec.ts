import { Test, TestingModule } from '@nestjs/testing';
import { NumaralarController } from './numaralar.controller';

describe('NumaralarController', () => {
  let controller: NumaralarController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NumaralarController],
    }).compile();

    controller = module.get<NumaralarController>(NumaralarController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
