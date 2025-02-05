import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { NumaralarModule } from './numaralar/numaralar.module';
import { NumaraLogModule } from './numara-log/numara-log.module';
import { User } from './users/user.entity';
import { Numara } from './numaralar/numara.entity';
import { NumaraLog } from './numara-log/numara-log.entity';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    // ConfigModule: .env dosyasını yükler
    ConfigModule.forRoot({
      isGlobal: true, // Tüm modüllerde kullanılabilir
    }),

    // TypeORM Konfigürasyonu
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'), // Varsayılan değer: localhost
        port: config.get<number>('DB_PORT', 5432), // Varsayılan değer: 5432
        username: config.get('DB_USERNAME', 'postgres'), // Varsayılan değer: postgres
        password: config.get('DB_PASSWORD', 'postgres'), // Varsayılan değer: postgres
        database: config.get('DB_NAME', 'wpTakip'), // Varsayılan değer: wpTakip
        entities: [User, Numara, NumaraLog], // Entity'ler
        synchronize: config.get('NODE_ENV') === 'development', // Geliştirme ortamında açık
        logging: config.get('NODE_ENV') === 'development', // Geliştirme ortamında SQL logları
      }),
    }),

    // Uygulama Modülleri
    UsersModule,
    AuthModule,
    NumaralarModule,
    NumaraLogModule,
    RedisModule,
  ],
})
export class AppModule {}