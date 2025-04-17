export interface ShopeeIds {
  shopId: string;
  itemId: string;
}

export interface ShopeeProduct {
  itemId: number;
  commissionRate: string;
  sellerCommissionRate: string;
  shopeeCommissionRate: string;
  commission: string;
  priceMax: string;
  priceMin: string;
  productCatIds: number[];
  ratingStar: string;
  priceDiscountRate: number;
  imageUrl: string;
  productName: string;
  shopId: number;
  shopName: string;
  shopType: number[];
  productLink: string;
  offerLink: string;
  periodStartTime: number;
  periodEndTime: number;
  sales: number;
}
