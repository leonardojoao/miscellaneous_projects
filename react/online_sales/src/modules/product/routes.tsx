import { RouteObject } from 'react-router';

import Product from './screens/Product';

export enum ProductRoutesEnum {
  PRODUCT = '/product',
}

export const productRoutes: RouteObject[] = [
  {
    path: ProductRoutesEnum.PRODUCT,
    element: <Product />,
  },
];
