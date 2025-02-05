import App from './App.tsx';  
import reportWebVitals from './reportWebVitals.ts';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';



const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();