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


// import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BeforeInsert, BeforeUpdate } from 'typeorm';
// import { Numara } from '../numaralar/numara.entity';
// import * as bcrypt from 'bcrypt';

// @Entity()
// export class User {
//  @PrimaryGeneratedColumn()
//  id: number;

//  @Column({ unique: true })
//  username: string;

//  @Column()
//  password: string;

//  @Column({ unique: true })
//  email: string;

//  @Column({ type: 'timestamp', nullable: true })
//  lisansBitisTarihi: Date;

//  @OneToMany(() => Numara, (numara) => numara.kullanici, {
//    cascade: true,
//    onDelete: 'CASCADE'
//  })
//  numaralar: Numara[];

//  @BeforeInsert()
//  @BeforeUpdate()
//  async hashPassword() {
//    if (this.password) {
//      const salt = await bcrypt.genSalt();
//      this.password = await bcrypt.hash(this.password, salt);
//    }
//  }

//  async validatePassword(password: string): Promise<boolean> {
//    return bcrypt.compare(password, this.password);
//  }

//  async checkLicenseValidity(): Promise<boolean> {
//    if (!this.lisansBitisTarihi) return false;
//    return new Date() < this.lisansBitisTarihi;
//  }

//  toJSON() {
//    const { password, ...userWithoutPassword } = this;
//    return userWithoutPassword;
//  }

//  static async createUser(userData: Partial<User>): Promise<User> {
//    const user = new User();
//    Object.assign(user, userData);
//    await user.hashPassword();
//    return user;
//  }
// }


import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NumaraLog } from './numara-log.entity';
import { CreateLogDto } from './dto/create-log.dto';

@Injectable()
export class NumaraLogService {
 private readonly logger = new Logger(NumaraLogService.name);

 constructor(
   @InjectRepository(NumaraLog)
   private logRepository: Repository<NumaraLog>
 ) {}

 async logEkle(createLogDto: CreateLogDto): Promise<NumaraLog> {
   try {
     const log = this.logRepository.create({
       cevrimIciBaslangic: new Date(createLogDto.cevrimIciBaslangic),
       cevrimIciBitis: new Date(createLogDto.cevrimIciBitis),
       numara: { id: createLogDto.id }
     });

     const savedLog = await this.logRepository.save(log);
     this.logger.log(`Log kaydedildi: ${JSON.stringify(savedLog)}`);
     return savedLog;
   } catch (error) {
     this.logger.error(`Log eklenirken hata: ${error.message}`);
     throw error;
   }
 }

 async loglariGetir(numaraId: number): Promise<NumaraLog[]> {
   try {
     const logs = await this.logRepository.find({
       where: { numara: { id: numaraId } },
       relations: ['numara'],
       order: { cevrimIciBaslangic: 'DESC' }
     });
     this.logger.log(`${numaraId} numarası için ${logs.length} log bulundu`);
     return logs;
   } catch (error) {
     this.logger.error(`Loglar getirilirken hata: ${error.message}`);
     throw error;
   }
 }

 async gunlukOzet(numaraId: number): Promise<any> {
   try {
     const logs = await this.loglariGetir(numaraId);
     const bugun = new Date();
     const sonYirmiDortSaat = logs.filter(log => {
       const logTarihi = new Date(log.cevrimIciBaslangic);
       return bugun.getTime() - logTarihi.getTime() <= 24 * 60 * 60 * 1000;
     });

     const toplamSure = sonYirmiDortSaat.reduce((acc, log) => {
       const baslangic = new Date(log.cevrimIciBaslangic);
       const bitis = new Date(log.cevrimIciBitis);
       return acc + (bitis.getTime() - baslangic.getTime());
     }, 0);

     const ozet = {
       toplamLog: logs.length,
       sonYirmiDortSaat: {
         logSayisi: sonYirmiDortSaat.length,
         toplamDakika: Math.round(toplamSure / (1000 * 60))
       },
       ortalamaCevrimiciSure: sonYirmiDortSaat.length > 0 
         ? Math.round(toplamSure / (sonYirmiDortSaat.length * 1000 * 60))
         : 0
     };

     this.logger.log(`${numaraId} numarası için özet oluşturuldu: ${JSON.stringify(ozet)}`);
     return ozet;
   } catch (error) {
     this.logger.error(`Özet oluşturulurken hata: ${error.message}`);
     throw error;
   }
 }

 async haftalikOzet(numaraId: number): Promise<any> {
   try {
     const logs = await this.loglariGetir(numaraId);
     const bugun = new Date();
     const sonBirHafta = logs.filter(log => {
       const logTarihi = new Date(log.cevrimIciBaslangic);
       return bugun.getTime() - logTarihi.getTime() <= 7 * 24 * 60 * 60 * 1000;
     });

     const gunlukVeriler = sonBirHafta.reduce((acc, log) => {
       const tarih = new Date(log.cevrimIciBaslangic).toISOString().split('T')[0];
       if (!acc[tarih]) {
         acc[tarih] = { logSayisi: 0, toplamSure: 0 };
       }
       const sure = new Date(log.cevrimIciBitis).getTime() - new Date(log.cevrimIciBaslangic).getTime();
       acc[tarih].logSayisi++;
       acc[tarih].toplamSure += sure;
       return acc;
     }, {});

     const ozet = {
       haftalikToplam: sonBirHafta.length,
       gunlukDetay: Object.entries(gunlukVeriler).map(([tarih, data]: [string, any]) => ({
         tarih,
         logSayisi: data.logSayisi,
         toplamDakika: Math.round(data.toplamSure / (1000 * 60))
       }))
     };

     this.logger.log(`${numaraId} numarası için haftalık özet oluşturuldu`);
     return ozet;
   } catch (error) {
     this.logger.error(`Haftalık özet oluşturulurken hata: ${error.message}`);
     throw error;
   }
 }
}