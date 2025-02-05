// api/src/numara-log/numara-log.service.ts


// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { NumaraLog } from './numara-log.entity';
// import { Numara } from '../numaralar/numara.entity';

// @Injectable()
// export class NumaraLogService {
//   constructor(
//     @InjectRepository(NumaraLog)
//     private logRepository: Repository<NumaraLog>,
//   ) {}

//   async logEkle(logData: Partial<NumaraLog>, numara: Numara): Promise<NumaraLog> {
//     const yeniLog = this.logRepository.create({
//       ...logData,
//       numara,
//     });
//     return this.logRepository.save(yeniLog);
//   }

//   async loglariGetir(numaraId: number): Promise<NumaraLog[]> {
//     return this.logRepository.find({
//       where: { numara: { id: numaraId } },
//     });
//   }
// }


import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NumaraLog } from './numara-log.entity';
import { CreateLogDto } from './dto/create-log.dto';

@Injectable()
export class NumaraLogService {
  constructor(
    @InjectRepository(NumaraLog)
    private logRepository: Repository<NumaraLog>,
  ) {}

  async logEkle(createLogDto: CreateLogDto): Promise<NumaraLog> {
    const log = this.logRepository.create(createLogDto);
    return this.logRepository.save(log);
  }

  async loglariGetir(id: number): Promise<NumaraLog[]> {
    return this.logRepository.find({ 
      where: { id },
      order: { cevrimIciBaslangic: 'DESC' }
    });
  }
}