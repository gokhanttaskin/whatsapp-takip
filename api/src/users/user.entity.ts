// api/src/users/user.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Numara } from '../numaralar/numara.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ unique: true })
  username: string;
  @Column()
  password: string; // BCrypt ile hash'lenecek
  @Column({ unique: true })
  email: string;
  @Column({ type: 'timestamp', nullable: true })
  lisansBitisTarihi: Date;

  // Kullanıcıya ait tüm numaralar
  @OneToMany(() => Numara, (numara) => numara.kullanici)
  numaralar: Numara[];}