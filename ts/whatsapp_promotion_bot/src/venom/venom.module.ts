import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { VenomService } from './venom.service';

@Module({
  imports: [ConfigModule],
  providers: [VenomService],
})
export class VenomModule {}
