import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NumaralarController } from './numaralar.controller';
import { NumaralarService } from './numaralar.service';
import { Numara } from './numara.entity'; // <-- Numara entity'sini içe aktar

@Module({
  imports: [TypeOrmModule.forFeature([Numara])], // <-- TypeORM modülü ekle
  controllers: [NumaralarController],
  providers: [NumaralarService],
  exports: [NumaralarService], // <-- Eğer başka modüller kullanacaksa export et
})
export class NumaralarModule {}
