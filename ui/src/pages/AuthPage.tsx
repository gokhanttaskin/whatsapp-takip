import React from 'react';
import { Tabs, Card } from 'antd';
import LoginForm from '../components/Auth/LoginForm.tsx';
import RegisterForm from '../components/Auth/RegisterForm.tsx';

const AuthPage = () => {
  return (
    <div style={{ maxWidth: 400, margin: '50px auto' }}>
      <Card title="WhatsApp Takip Sistemi">
        <Tabs defaultActiveKey="1">
          <Tabs.TabPane tab="Giriş Yap" key="1">
            <LoginForm />
          </Tabs.TabPane>
          <Tabs.TabPane tab="Kayıt Ol" key="2">
            <RegisterForm />
          </Tabs.TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default AuthPage;