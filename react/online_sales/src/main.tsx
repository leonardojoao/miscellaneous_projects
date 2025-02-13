import './index.css';

import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import LoginRoutes from './modules/login/routes.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <LoginRoutes />
  </BrowserRouter>,
);
