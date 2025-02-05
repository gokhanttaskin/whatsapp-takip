import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NumaraLogController } from './numara-log.controller';
import { NumaraLogService } from './numara-log.service';
import { NumaraLog } from './numara-log.entity'; // <-- NumaraLog entity'sini içe aktar

@Module({
  imports: [TypeOrmModule.forFeature([NumaraLog])], // <-- TypeOrm modülü eklendi
  controllers: [NumaraLogController],
  providers: [NumaraLogService],
  exports: [NumaraLogService], // <-- Eğer başka modüller de kullanacaksa export et
})
export class NumaraLogModule {}
