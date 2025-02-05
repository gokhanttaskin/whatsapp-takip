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

// import { 
//   Controller, 
//   Post, 
//   Body, 
//   Get, 
//   Param, 
//   UseGuards, 
//   HttpException, 
//   HttpStatus 
// } from '@nestjs/common';
// import { NumaraLogService } from './numara-log.service';
// import { AuthGuard } from '@nestjs/passport';
// import { CreateLogDto } from './dto/create-log.dto'; // DTO ekleyin

// @Controller('numara-log')
// @UseGuards(AuthGuard('jwt'))
// export class NumaraLogController {
//   constructor(private readonly logService: NumaraLogService) {}

//   // Yeni POST endpoint'i
//   @Post()
//   async logEkle(@Body() createLogDto: CreateLogDto) {
//     try {
//       return await this.logService.logEkle(createLogDto);
//     } catch (error) {
//       throw new HttpException(
//         'Log kaydedilemedi: ' + error.message,
//         HttpStatus.INTERNAL_SERVER_ERROR
//       );
//     }
//   }

//   // Mevcut GET endpoint'i
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
  HttpStatus,
  Logger 
 } from '@nestjs/common';
 import { NumaraLogService } from './numara-log.service';
 import { AuthGuard } from '@nestjs/passport';
 import { CreateLogDto } from './dto/create-log.dto';
 
 @Controller('numara-log')
 @UseGuards(AuthGuard('jwt'))
 export class NumaraLogController {
  private readonly logger = new Logger(NumaraLogController.name);
 
  constructor(private readonly logService: NumaraLogService) {}
 
  @Post()
  async logEkle(@Body() createLogDto: CreateLogDto) {
    try {
      this.logger.log(`Yeni log kaydı alındı: ${JSON.stringify(createLogDto)}`);
      
      // Online süresini hesapla
      const baslangic = new Date(createLogDto.cevrimIciBaslangic);
      const bitis = new Date(createLogDto.cevrimIciBitis);
      const sureDakika = (bitis.getTime() - baslangic.getTime()) / (1000 * 60);
 
      this.logger.log(`Çevrimiçi kalma süresi: ${sureDakika.toFixed(2)} dakika`);
 
      const result = await this.logService.logEkle(createLogDto);
      
      this.logger.log(`Log başarıyla kaydedildi, ID: ${result.id}`);
      return result;
 
    } catch (error) {
      this.logger.error(`Log kaydedilirken hata oluştu: ${error.message}`);
      throw new HttpException(
        'Log kaydedilemedi: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
 
  @Get(':numaraId')
  async loglariGetir(@Param('numaraId') numaraId: number) {
    try {
      this.logger.log(`${numaraId} ID'li numara için loglar istendi`);
      
      const loglar = await this.logService.loglariGetir(numaraId);
      
      // Logları tarih sırasına göre sırala (en yeniden en eskiye)
      const siraliLoglar = loglar.sort((a, b) => 
        new Date(b.cevrimIciBaslangic).getTime() - new Date(a.cevrimIciBaslangic).getTime()
      );
 
      this.logger.log(`${siraliLoglar.length} adet log bulundu`);
      return siraliLoglar;
 
    } catch (error) {
      this.logger.error(`Loglar getirilirken hata oluştu: ${error.message}`);
      throw new HttpException(
        'Loglar getirilemedi: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
 
  @Get('ozet/:numaraId')
  async logOzetiGetir(@Param('numaraId') numaraId: number) {
    try {
      this.logger.log(`${numaraId} ID'li numara için log özeti istendi`);
      
      const loglar = await this.logService.loglariGetir(numaraId);
      
      // Son 24 saatteki toplam çevrimiçi süreyi hesapla
      const simdi = new Date();
      const yirmiDortSaatOnce = new Date(simdi.getTime() - (24 * 60 * 60 * 1000));
      
      const sonLoglar = loglar.filter(log => 
        new Date(log.cevrimIciBaslangic) > yirmiDortSaatOnce
      );
 
      const toplamSure = sonLoglar.reduce((toplam, log) => {
        const baslangic = new Date(log.cevrimIciBaslangic);
        const bitis = new Date(log.cevrimIciBitis);
        return toplam + (bitis.getTime() - baslangic.getTime());
      }, 0);
 
      const ozet = {
        sonYirmiDortSaat: {
          logSayisi: sonLoglar.length,
          toplamSureDakika: (toplamSure / (1000 * 60)).toFixed(2),
        },
        toplamLogSayisi: loglar.length,
      };
 
      this.logger.log(`Log özeti hazırlandı: ${JSON.stringify(ozet)}`);
      return ozet;
 
    } catch (error) {
      this.logger.error(`Log özeti hazırlanırken hata oluştu: ${error.message}`);
      throw new HttpException(
        'Log özeti hazırlanamadı: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
 }