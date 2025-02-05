// // api/src/users/user.entity.ts
// import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
// import { Numara } from '../numaralar/numara.entity';

// @Entity()
// export class User {
//   @PrimaryGeneratedColumn()
//   id: number;
//   @Column({ unique: true })
//   username: string;
//   @Column()
//   password: string; // BCrypt ile hash'lenecek
//   @Column({ unique: true })
//   email: string;
//   @Column({ type: 'timestamp', nullable: true })
//   lisansBitisTarihi: Date;

//   // Kullanıcıya ait tüm numaralar
//   @OneToMany(() => Numara, (numara) => numara.kullanici)
//   numaralar: Numara[];}
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, BeforeInsert, BeforeUpdate } from 'typeorm';
import { Numara } from '../numaralar/numara.entity';
import * as bcrypt from 'bcrypt';

@Entity()
export class User {
 @PrimaryGeneratedColumn()
 id: number;

 @Column({ unique: true })
 username: string;

 @Column()
 password: string;

 @Column({ unique: true })
 email: string;

 @Column({ type: 'timestamp', nullable: true })
 lisansBitisTarihi: Date;

 @OneToMany(() => Numara, (numara) => numara.kullanici, {
   cascade: true,
   onDelete: 'CASCADE'
 })
 numaralar: Numara[];

 @BeforeInsert()
 @BeforeUpdate()
 async hashPassword() {
   if (this.password) {
     const salt = await bcrypt.genSalt();
     this.password = await bcrypt.hash(this.password, salt);
   }
 }

 async validatePassword(password: string): Promise<boolean> {
   return bcrypt.compare(password, this.password);
 }
}