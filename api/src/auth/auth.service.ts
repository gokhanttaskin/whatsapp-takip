import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    try {
      const user = await this.usersService.findByUsername(username);
      
      // Null kontrolü ekleyin
      if (!user) {
        this.logger.warn(`Kullanıcı bulunamadı: ${username}`);
        throw new UnauthorizedException('Kullanıcı bulunamadı');
      }
  
      // Parola karşılaştırma
      const isPasswordValid = await bcrypt.compare(pass, user.password);
      if (!isPasswordValid) {
        this.logger.warn(`Geçersiz şifre: ${username}`);
        throw new UnauthorizedException('Geçersiz şifre');
      }
  
      return user;
    } catch (error) {
      this.logger.error(`Doğrulama hatası: ${error.message}`);
      throw error;
    }
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}