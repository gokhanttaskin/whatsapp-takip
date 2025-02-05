// numara-log.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Numara } from '../numaralar/numara.entity';

@Entity()
export class NumaraLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'timestamp' })
  cevrimIciBaslangic: Date;

  @Column({ type: 'timestamp', nullable: true })
  cevrimIciBitis: Date;

  @ManyToOne(() => Numara, numara => numara.loglar)
  @JoinColumn({ name: 'numaraId' })
  numara: Numara;

  @Column()
  numaraId: number;
}