import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/globals.css';
import './styles/custom.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import injectNotificationDataToServiceWorker from './utils/firebase-config-injector';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// Inject dữ liệu thông báo vào Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    injectNotificationDataToServiceWorker();
  });
}

// Chỉ báo cáo web vitals trong môi trường production
if (process.env.NODE_ENV === 'production') {
  reportWebVitals();
}