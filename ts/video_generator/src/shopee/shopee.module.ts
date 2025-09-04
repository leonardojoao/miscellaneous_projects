// src/shopee/shopee.module.ts
import { Module } from '@nestjs/common';
import { ShopeeAffiliateService } from './shopee.service';

@Module({
  providers: [ShopeeAffiliateService],
  exports: [ShopeeAffiliateService],
})
export class ShopeeModule {}
