import { Injectable, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async register(userData: Partial<User>): Promise<User> {
    // Eksik alan kontrolü
    if (!userData.username || !userData.email || !userData.password) {
      throw new BadRequestException('Kullanıcı adı, email ve parola zorunludur');
    }

    // Kullanıcı adı ve email kontrolü
    const existingUser = await this.usersRepository.findOne({
      where: [{ username: userData.username }, { email: userData.email }],
    });

    if (existingUser) {
      throw new ConflictException('Kullanıcı adı veya email zaten kullanılıyor');
    }

    // Parolayı hash'le
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = this.usersRepository.create({
      ...userData,
      password: hashedPassword,
    });

    return await this.usersRepository.save(newUser);
  }

  async findByUsername(username: string): Promise<User | null> { //  null olarak değiştir
    return this.usersRepository
      .createQueryBuilder('user')
      .where('user.username = :username', { username })
      .addSelect('user.password') // password alanını ekstra seç
      .getOne();
  }
}
