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

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Numara } from './numara.entity';
import { User } from '../users/user.entity';

@Injectable()
export class NumaralarService {
  constructor(
    @InjectRepository(Numara)
    private numaralarRepository: Repository<Numara>,
  ) {}

  async ekle(numaraData: { telefonNumarasi: string }, user: User): Promise<Numara> { // ✅ Parametreler düzeltildi
    const yeniNumara = this.numaralarRepository.create({
      telefonNumarasi: numaraData.telefonNumarasi,
      kullanici: user,
    });
    return this.numaralarRepository.save(yeniNumara);
  }

  async kullaniciNumaralari(userId: number): Promise<Numara[]> {
    return this.numaralarRepository.find({
      where: { kullanici: { id: userId } },
      relations: ['loglar'],
    });
  }
}