import './index.css';

import ReactDOM from 'react-dom/client';

import App from './App.tsx';
import { GlobalProvider } from './shared/hooks/useGlobalContext.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <GlobalProvider>
    <App />
  </GlobalProvider>,
);
