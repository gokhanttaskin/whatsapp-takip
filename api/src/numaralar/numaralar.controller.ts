// // api/src/numaralar/numaralar.controller.ts
// import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
// import { NumaralarService } from './numaralar.service';
// import { AuthGuard } from '@nestjs/passport';
// import { User } from '../users/user.entity';
// import { GetUser } from '../decorators/get-user.decorator';

// @Controller('numaralar')
// @UseGuards(AuthGuard('jwt'))
// export class NumaralarController {
//   constructor(private readonly numaraService: NumaralarService) {}

//   @Post()
//   async ekle(@Body() numaraData: { telefonNumarasi: string }, @GetUser() user: User) {
//     return this.numaraService.ekle(numaraData, user);
//   }

//   @Get()
//   async listele(@GetUser() user: User) {
//     return this.numaraService.kullaniciNumaralari(user.id);
//   }
// }

import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { NumaralarService } from './numaralar.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../users/user.entity';
import { GetUser } from '../decorators/get-user.decorator';

@Controller('numaralar')
@UseGuards(AuthGuard('jwt'))
export class NumaralarController {
  constructor(private readonly numaraService: NumaralarService) {}

  @Post()
  async ekle(
    @Body() numaraData: { telefonNumarasi: string }, // ✅ Body import edildi
    @GetUser() user: User
  ) {
    return this.numaraService.ekle(numaraData, user); // ✅ 2 parametre gönderildi
  }

  @Get()
  async listele(@GetUser() user: User) {
    return this.numaraService.kullaniciNumaralari(user.id);
  }
}