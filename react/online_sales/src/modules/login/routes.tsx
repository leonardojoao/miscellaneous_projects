import { Route, Routes } from 'react-router';

import LoginScreen from './index';

export const LoginRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
    </Routes>
  );
};

export default LoginRoutes;
