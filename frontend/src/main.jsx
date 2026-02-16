import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#8B7355',
            borderRadius: 10,
            colorBgLayout: '#FAF8F5',
            colorBgContainer: '#FFFFFF',
            colorBorder: '#E8E0D8',
            colorBorderSecondary: '#E8E0D8',
            colorSplit: '#E8E0D8',
          },
        }}
      >
        <AuthProvider>
          <App />
        </AuthProvider>
      </ConfigProvider>
    </BrowserRouter>
  </React.StrictMode>
);
