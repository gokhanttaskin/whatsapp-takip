// api/src/numaralar/numara.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { User } from '../users/user.entity';
import { NumaraLog } from '../numara-log/numara-log.entity';

@Entity()
export class Numara {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  telefonNumarasi: string;

  // Numarayı ekleyen kullanıcı
  @ManyToOne(() => User, (user) => user.numaralar)
  kullanici: User;

  // Bu numaraya ait tüm loglar
  @OneToMany(() => NumaraLog, (log) => log.numara)
  loglar: NumaraLog[];
}