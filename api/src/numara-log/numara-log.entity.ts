// api/src/numara-log/numara-log.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Numara } from '../numaralar/numara.entity';

@Entity()
export class NumaraLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp' })
  cevrimIciBaslangic: Date;

  @Column({ type: 'timestamp', nullable: true })
  cevrimIciBitis: Date;

  // Logun ait olduğu numara
  @ManyToOne(() => Numara, (numara) => numara.loglar)
  numara: Numara;
}