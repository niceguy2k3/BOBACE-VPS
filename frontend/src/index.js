import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/globals.css';
import './styles/custom.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

// Chỉ báo cáo web vitals trong môi trường production
if (process.env.NODE_ENV === 'production') {
  reportWebVitals();
}