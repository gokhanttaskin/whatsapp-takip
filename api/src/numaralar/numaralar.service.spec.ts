import { Test, TestingModule } from '@nestjs/testing';
import { NumaralarService } from './numaralar.service';

describe('NumaralarService', () => {
  let service: NumaralarService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NumaralarService],
    }).compile();

    service = module.get<NumaralarService>(NumaralarService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
