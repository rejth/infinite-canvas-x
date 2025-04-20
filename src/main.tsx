import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';

import App from '@/app/App';

import './styles.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

if (!root) {
  throw new Error(
    'Root container was not found. Failed to mount the app. Please make sure the container exists and is in the DOM.',
  );
}

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
