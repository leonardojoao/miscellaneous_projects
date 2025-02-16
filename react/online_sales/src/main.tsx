import './index.css';

import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';

import LoginRoutes from './modules/login/routes.tsx';
import { GlobalContextProvider } from './shared/hooks/useGlobalContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <GlobalContextProvider>
    <BrowserRouter>
      <LoginRoutes />
    </BrowserRouter>
  </GlobalContextProvider>,
);
