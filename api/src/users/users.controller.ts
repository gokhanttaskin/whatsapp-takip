import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';

@Controller('users') // 👈 Prefix ekleyin (/users)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register') // 👈 Full path: /users/register
  async register(@Body() userData: User) {
    return this.usersService.register(userData);
  }
}