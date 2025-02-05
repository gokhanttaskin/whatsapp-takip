// // api/src/numara-log/numara-log.controller.ts
// import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
// import { NumaraLogService } from './numara-log.service';
// import { AuthGuard } from '@nestjs/passport';
// import { Numara } from '../numaralar/numara.entity';
// import { GetNumara } from '../decorators/get-numara.decorator';

// @Controller('numara-log')
// @UseGuards(AuthGuard('jwt'))
// export class NumaraLogController {
//   constructor(private readonly logService: NumaraLogService) {}

//   @Post()
//   async ekle(
//     @Body() logData: { cevrimIciBaslangic: Date; cevrimIciBitis: Date },
//     @GetNumara() numara: Numara,
//   ) {
//     return this.logService.logEkle(logData, numara);
//   }

//   @Get(':numaraId')
//   async listele(@Param('numaraId') numaraId: number) {
//     return this.logService.loglariGetir(numaraId);
//   }
// }

// import { Controller, Get, Param, UseGuards } from '@nestjs/common';
// import { NumaraLogService } from './numara-log.service';
// import { AuthGuard } from '@nestjs/passport';

// @Controller('numara-log')
// @UseGuards(AuthGuard('jwt'))
// export class NumaraLogController {
//   constructor(private readonly logService: NumaraLogService) {}

//   @Get(':numaraId')
//   async loglariGetir(@Param('numaraId') numaraId: number) {
//     return this.logService.loglariGetir(numaraId);
//   }
// }

import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  Param, 
  UseGuards, 
  HttpException, 
  HttpStatus 
} from '@nestjs/common';
import { NumaraLogService } from './numara-log.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateLogDto } from './dto/create-log.dto'; // DTO ekleyin

@Controller('numara-log')
@UseGuards(AuthGuard('jwt'))
export class NumaraLogController {
  constructor(private readonly logService: NumaraLogService) {}

  // Yeni POST endpoint'i
  @Post()
  async logEkle(@Body() createLogDto: CreateLogDto) {
    try {
      return await this.logService.logEkle(createLogDto);
    } catch (error) {
      throw new HttpException(
        'Log kaydedilemedi: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Mevcut GET endpoint'i
  @Get(':numaraId')
  async loglariGetir(@Param('numaraId') numaraId: number) {
    return this.logService.loglariGetir(numaraId);
  }
}