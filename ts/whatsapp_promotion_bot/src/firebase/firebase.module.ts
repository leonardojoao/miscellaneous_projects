import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FirebaseService } from './links/links.service';

@Module({
  imports: [ConfigModule],
  providers: [FirebaseService],
})
export class FirebaseModule {}
