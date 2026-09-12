import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { WebsiteContentProvider } from './contexts/WebsiteContentContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WebsiteContentProvider>
      <App />
    </WebsiteContentProvider>
  </StrictMode>,
);
