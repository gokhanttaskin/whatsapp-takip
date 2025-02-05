import { IsNumber, IsISO8601 } from 'class-validator';

export class CreateLogDto {
  @IsNumber()
  id: number;

  @IsISO8601()
  cevrimIciBaslangic: Date;

  @IsISO8601()
  cevrimIciBitis: Date;

  @IsNumber()
  userId: number;
}