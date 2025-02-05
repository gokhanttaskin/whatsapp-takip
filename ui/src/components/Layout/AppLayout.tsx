import React from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';

const { Content } = Layout;

const AppLayout = ({ children }: any) => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content style={{ padding: '24px 50px', marginTop: 64 }}>
        <div style={{ background: '#fff', padding: 24, minHeight: 380 }}>
          {children || <Outlet />}
        </div>
      </Content>
    </Layout>
  );
};

export default AppLayout;