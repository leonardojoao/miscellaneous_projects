import { RouteObject } from 'react-router-dom';

import LoginScreen from './index';

export const loginRoutes: RouteObject[] = [
  {
    path: '/login',
    element: <LoginScreen />,
  },
];
