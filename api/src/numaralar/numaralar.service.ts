// // api/src/numaralar/numaralar.service.ts
// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Numara } from './numara.entity';
// import { User } from '../users/user.entity';

// @Injectable()
// export class NumaralarService {
//   constructor(
//     @InjectRepository(Numara)
//     private numaraRepository: Repository<Numara>,
//   ) {}

//   async ekle(numaraData: Partial<Numara>, user: User): Promise<Numara> {
//     const yeniNumara = this.numaraRepository.create({
//       ...numaraData,
//       kullanici: user,
//     });
//     return this.numaraRepository.save(yeniNumara);
//   }

//   async kullaniciNumaralari(userId: number): Promise<Numara[]> {
//     return this.numaraRepository.find({
//       where: { kullanici: { id: userId } },
//     });
//   }
// }

// import { Injectable } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Numara } from './numara.entity';
// import { User } from '../users/user.entity';

// @Injectable()
// export class NumaralarService {
//   constructor(
//     @InjectRepository(Numara)
//     private numaralarRepository: Repository<Numara>,
//   ) {}

//   async ekle(numaraData: { telefonNumarasi: string }, user: User): Promise<Numara> { // ✅ Parametreler düzeltildi
//     const yeniNumara = this.numaralarRepository.create({
//       telefonNumarasi: numaraData.telefonNumarasi,
//       kullanici: user,
//     });
//     return this.numaralarRepository.save(yeniNumara);
//   }

//   async kullaniciNumaralari(userId: number): Promise<Numara[]> {
//     return this.numaralarRepository.find({
//       where: { kullanici: { id: userId } },
//       relations: ['loglar'],
//     });
//   }
// }



// import { Injectable, ConflictException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Numara } from './numara.entity';
// import { User } from '../users/user.entity';
// import { Inject } from '@nestjs/common';
// import { createClient } from 'redis';

// @Injectable()
// export class NumaralarService {
//   constructor(
//     @InjectRepository(Numara)
//     private numaralarRepository: Repository<Numara>,
//     @Inject('REDIS_CLIENT')
//     private readonly redisClient: ReturnType<typeof createClient>
//   ) {}

//   async ekle(numaraData: { telefonNumarasi: string }, user: User): Promise<Numara> {
//     try {
//       // Veritabanında bu numara var mı kontrol et
//       const existingNumara = await this.numaralarRepository.findOne({
//         where: { telefonNumarasi: numaraData.telefonNumarasi },
//         relations: ['kullanici']
//       });

//       if (existingNumara) {
//         // Bu numara bu kullanıcıya ait mi kontrol et
//         if (existingNumara.kullanici.id === user.id) {
//           throw new ConflictException('Bu numara zaten sizin tarafınızdan eklenmiş');
//         }

//         // Farklı bir kullanıcıya aitse, Redis'e yeni kullanıcı için ekle
//         await this.redisClient.sAdd(`user:${user.id}:numbers`, numaraData.telefonNumarasi);
//         return existingNumara;
//       }

//       // Yeni numara oluştur
//       const yeniNumara = this.numaralarRepository.create({
//         telefonNumarasi: numaraData.telefonNumarasi,
//         kullanici: user,
//       });

//       // Veritabanına kaydet
//       const kaydedilenNumara = await this.numaralarRepository.save(yeniNumara);

//       // Redis'e ekle
//       await this.redisClient.sAdd(`user:${user.id}:numbers`, numaraData.telefonNumarasi);

//       return kaydedilenNumara;
//     } catch (error) {
//       if (error instanceof ConflictException) {
//         throw error;
//       }
//       throw new Error(`Numara eklenirken bir hata oluştu: ${error.message}`);
//     }
//   }

//   async kullaniciNumaralari(userId: number): Promise<Numara[]> {
//     return this.numaralarRepository.find({
//       where: { kullanici: { id: userId } },
//       relations: ['loglar'],
//       order: {
//         id: 'DESC' // En son eklenen numaralar üstte gösterilsin
//       }
//     });
//   }

//   async numarayiSil(numaraId: number, userId: number): Promise<void> {
//     const numara = await this.numaralarRepository.findOne({
//       where: { id: numaraId, kullanici: { id: userId } }
//     });

//     if (!numara) {
//       throw new Error('Numara bulunamadı veya bu numaraya erişim yetkiniz yok');
//     }

//     // Redis'ten sil
//     await this.redisClient.sRem(`user:${userId}:numbers`, numara.telefonNumarasi);

//     // Veritabanından sil
//     await this.numaralarRepository.remove(numara);
//   }

//   async numaraDetay(numaraId: number, userId: number): Promise<Numara> {
//     const numara = await this.numaralarRepository.findOne({
//       where: { id: numaraId, kullanici: { id: userId } },
//       relations: ['loglar']
//     });

//     if (!numara) {
//       throw new Error('Numara bulunamadı veya bu numaraya erişim yetkiniz yok');
//     }

//     return numara;
//   }
// }




// import { Injectable, ConflictException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { Numara } from './numara.entity';
// import { User } from '../users/user.entity';
// import { Inject } from '@nestjs/common';
// import { createClient } from 'redis';
// import fetch from 'node-fetch';

// @Injectable()
// export class NumaralarService {
//  constructor(
//    @InjectRepository(Numara)
//    private numaralarRepository: Repository<Numara>,
//    @Inject('REDIS_CLIENT')
//    private readonly redisClient: ReturnType<typeof createClient>
//  ) {}

//  async ekle(numaraData: { telefonNumarasi: string }, user: User): Promise<Numara> {
//    try {
//      // Veritabanında bu numara var mı kontrol et
//      const existingNumara = await this.numaralarRepository.findOne({
//        where: { telefonNumarasi: numaraData.telefonNumarasi },
//        relations: ['kullanici']
//      });

//      if (existingNumara) {
//        // Bu numara bu kullanıcıya ait mi kontrol et
//        if (existingNumara.kullanici.id === user.id) {
//          throw new ConflictException('Bu numara zaten sizin tarafınızdan eklenmiş');
//        }

//        // Farklı bir kullanıcıya aitse, Redis'e yeni kullanıcı için ekle
//        await this.redisClient.sAdd(`user:${user.id}:numbers`, numaraData.telefonNumarasi);
//        return existingNumara;
//      }

//      // WhatsApp bot'una numarayı ekle
//      try {
//        const response = await fetch('http://localhost:3002/api/whatsapp/add-contact', {
//          method: 'POST',
//          headers: { 'Content-Type': 'application/json' },
//          body: JSON.stringify({ phone: numaraData.telefonNumarasi })
//        });

//        if (!response.ok) {
//          throw new Error('WhatsApp\'a numara eklenemedi');
//        }
//      } catch (error) {
//        throw new Error(`WhatsApp hatası: ${error.message}`);
//      }

//      // Yeni numara oluştur
//      const yeniNumara = this.numaralarRepository.create({
//        telefonNumarasi: numaraData.telefonNumarasi,
//        kullanici: user,
//      });

//      // Veritabanına kaydet
//      const kaydedilenNumara = await this.numaralarRepository.save(yeniNumara);

//      // Redis'e ekle
//      await this.redisClient.sAdd(`user:${user.id}:numbers`, numaraData.telefonNumarasi);

//      return kaydedilenNumara;
//    } catch (error) {
//      if (error instanceof ConflictException) {
//        throw error;
//      }
//      throw new Error(`Numara eklenirken bir hata oluştu: ${error.message}`);
//    }
//  }

//  async kullaniciNumaralari(userId: number): Promise<Numara[]> {
//    return this.numaralarRepository.find({
//      where: { kullanici: { id: userId } },
//      relations: ['loglar'],
//      order: {
//        id: 'DESC' // En son eklenen numaralar üstte gösterilsin
//      }
//    });
//  }

//  async numarayiSil(numaraId: number, userId: number): Promise<void> {
//    const numara = await this.numaralarRepository.findOne({
//      where: { id: numaraId, kullanici: { id: userId } }
//    });

//    if (!numara) {
//      throw new Error('Numara bulunamadı veya bu numaraya erişim yetkiniz yok');
//    }

//    try {
//      // WhatsApp bot'undan numarayı sil
//      const response = await fetch('http://localhost:3002/api/whatsapp/remove-contact', {
//        method: 'POST',
//        headers: { 'Content-Type': 'application/json' },
//        body: JSON.stringify({ phone: numara.telefonNumarasi })
//      });

//      if (!response.ok) {
//        throw new Error('WhatsApp\'tan numara silinemedi');
//      }
//    } catch (error) {
//      console.error('WhatsApp\'tan numara silinirken hata:', error);
//      // WhatsApp hatası olsa bile işleme devam et
//    }

//    // Redis'ten sil
//    await this.redisClient.sRem(`user:${userId}:numbers`, numara.telefonNumarasi);

//    // Veritabanından sil
//    await this.numaralarRepository.remove(numara);
//  }

//  async numaraDetay(numaraId: number, userId: number): Promise<Numara> {
//    const numara = await this.numaralarRepository.findOne({
//      where: { id: numaraId, kullanici: { id: userId } },
//      relations: ['loglar']
//    });

//    if (!numara) {
//      throw new Error('Numara bulunamadı veya bu numaraya erişim yetkiniz yok');
//    }

//    return numara;
//  }

//  // Numarayı hem veritabanında hem WhatsApp'ta kontrol et
//  async numaraKontrol(telefonNumarasi: string): Promise<boolean> {
//   try {
//       const response = await fetch('http://localhost:3002/api/whatsapp/check-contact', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ phone: telefonNumarasi })
//       });

//       if (!response.ok) {
//           return false;
//       }

//       const data = await response.json() as { exists: boolean };
//       return data.exists;
//   } catch (error) {
//       console.error('WhatsApp numara kontrolünde hata:', error);
//       return false;
//   }
// }
// }

import { Injectable, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Numara } from './numara.entity';
import { User } from '../users/user.entity';
import { Inject } from '@nestjs/common';
import { createClient } from 'redis';
import fetch from 'node-fetch';

@Injectable()
export class NumaralarService {
 private readonly logger = new Logger(NumaralarService.name);

 constructor(
   @InjectRepository(Numara)
   private numaralarRepository: Repository<Numara>,
   @Inject('REDIS_CLIENT')
   private readonly redisClient: ReturnType<typeof createClient>
 ) {
   this.syncNumbersWithRedis().catch(err => 
     this.logger.error('Redis senkronizasyon hatası:', err)
   );
 }

 async ekle(numaraData: { telefonNumarasi: string }, user: User): Promise<Numara> {
   try {
     // Veritabanında bu numara var mı kontrol et
     const existingNumara = await this.numaralarRepository.findOne({
       where: { telefonNumarasi: numaraData.telefonNumarasi },
       relations: ['kullanici']
     });

     if (existingNumara) {
       // Bu numara bu kullanıcıya ait mi kontrol et
       if (existingNumara.kullanici.id === user.id) {
         throw new ConflictException('Bu numara zaten sizin tarafınızdan eklenmiş');
       }

       // Farklı bir kullanıcıya aitse, Redis'e yeni kullanıcı için ekle
       await this.redisClient.sAdd(`user:${user.id}:numbers`, numaraData.telefonNumarasi);
       this.logger.log(`Numara Redis'e eklendi: ${numaraData.telefonNumarasi} (Kullanıcı: ${user.id})`);
       return existingNumara;
     }

     // WhatsApp bot'una numarayı ekle
     try {
       const response = await fetch('http://localhost:3002/api/whatsapp/add-contact', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ phone: numaraData.telefonNumarasi })
       });

       if (!response.ok) {
         throw new Error('WhatsApp\'a numara eklenemedi');
       }
     } catch (error) {
       this.logger.error(`WhatsApp hatası: ${error.message}`);
       throw new Error(`WhatsApp hatası: ${error.message}`);
     }

     // Yeni numara oluştur
     const yeniNumara = this.numaralarRepository.create({
       telefonNumarasi: numaraData.telefonNumarasi,
       kullanici: user,
     });

     // Veritabanına kaydet
     const kaydedilenNumara = await this.numaralarRepository.save(yeniNumara);
     this.logger.log(`Yeni numara veritabanına kaydedildi: ${numaraData.telefonNumarasi}`);

     // Redis'e ekle
     await this.redisClient.sAdd(`user:${user.id}:numbers`, numaraData.telefonNumarasi);
     this.logger.log(`Numara Redis'e eklendi: ${numaraData.telefonNumarasi}`);

     return kaydedilenNumara;
   } catch (error) {
     if (error instanceof ConflictException) {
       throw error;
     }
     this.logger.error(`Numara eklenirken hata: ${error.message}`);
     throw new Error(`Numara eklenirken bir hata oluştu: ${error.message}`);
   }
 }

 async kullaniciNumaralari(userId: number): Promise<Numara[]> {
   try {
     const numaralar = await this.numaralarRepository.find({
       where: { kullanici: { id: userId } },
       relations: ['loglar'],
       order: {
         id: 'DESC'
       }
     });

     this.logger.log(`${userId} ID'li kullanıcının ${numaralar.length} numarası bulundu`);
     return numaralar;
   } catch (error) {
     this.logger.error(`Kullanıcı numaraları getirilirken hata: ${error.message}`);
     throw error;
   }
 }

 async numarayiSil(numaraId: number, userId: number): Promise<void> {
   const numara = await this.numaralarRepository.findOne({
     where: { id: numaraId, kullanici: { id: userId } }
   });

   if (!numara) {
     throw new Error('Numara bulunamadı veya bu numaraya erişim yetkiniz yok');
   }

   try {
     // WhatsApp bot'undan numarayı sil
     const response = await fetch('http://localhost:3002/api/whatsapp/remove-contact', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ phone: numara.telefonNumarasi })
     });

     if (!response.ok) {
       this.logger.warn(`WhatsApp'tan numara silinemedi: ${numara.telefonNumarasi}`);
     }
   } catch (error) {
     this.logger.error('WhatsApp\'tan numara silinirken hata:', error);
   }

   // Redis'ten sil
   await this.redisClient.sRem(`user:${userId}:numbers`, numara.telefonNumarasi);
   this.logger.log(`Numara Redis'ten silindi: ${numara.telefonNumarasi}`);

   // Veritabanından sil
   await this.numaralarRepository.remove(numara);
   this.logger.log(`Numara veritabanından silindi: ${numara.telefonNumarasi}`);
 }

 async numaraDetay(numaraId: number, userId: number): Promise<Numara> {
   const numara = await this.numaralarRepository.findOne({
     where: { id: numaraId, kullanici: { id: userId } },
     relations: ['loglar']
   });

   if (!numara) {
     throw new Error('Numara bulunamadı veya bu numaraya erişim yetkiniz yok');
   }

   return numara;
 }

 async syncNumbersWithRedis(): Promise<void> {
  try {
      this.logger.log('Redis senkronizasyonu başlatılıyor...');
      
      // Tüm numaraları veritabanından al
      const allNumbers = await this.numaralarRepository.find({
          relations: ['kullanici']
      });

      // Her kullanıcı için Redis setini temizle ve yeniden oluştur
      const userGroups: { [key: string]: string[] } = {};
      
      // Numaraları kullanıcılara göre grupla
      allNumbers.forEach(numara => {
          const userId = numara.kullanici.id.toString();
          if (!userGroups[userId]) {
              userGroups[userId] = [];
          }
          userGroups[userId].push(numara.telefonNumarasi);
      });

      // Her kullanıcı için Redis'i güncelle
      for (const [userId, phoneNumbers] of Object.entries(userGroups)) {
          const key = `user:${userId}:numbers`;
          // Önce mevcut seti temizle
          await this.redisClient.del(key);
          // Eğer numara varsa yeni set oluştur
          if (phoneNumbers.length > 0) {
              // Her numarayı tek tek ekle
              for (const phoneNumber of phoneNumbers) {
                  await this.redisClient.sAdd(key, phoneNumber);
              }
          }
      }

      this.logger.log('Redis senkronizasyonu tamamlandı');
  } catch (error) {
      this.logger.error('Redis senkronizasyonu sırasında hata:', error);
      throw error;
  }
}

 async numaraKontrol(telefonNumarasi: string): Promise<boolean> {
   try {
     const response = await fetch('http://localhost:3002/api/whatsapp/check-contact', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({ phone: telefonNumarasi })
     });

     if (!response.ok) {
       return false;
     }

     const data = await response.json() as { exists: boolean };
     return data.exists;
   } catch (error) {
     this.logger.error('WhatsApp numara kontrolünde hata:', error);
     return false;
   }
 }
}