import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { register } from '../../services/authService.ts';

const RegisterForm = () => {
  const onFinish = async (values: any) => {
    try {
      await register(values);
      message.success('Kayıt başarılı! Giriş yapabilirsiniz.');
    } catch (error) {
      message.error('Kayıt başarısız!');
    }
  };

  return (
    <Form onFinish={onFinish} layout="vertical">
      <Form.Item
        label="Kullanıcı Adı"
        name="username"
        rules={[{ required: true, message: 'Lütfen kullanıcı adı girin!' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Email"
        name="email"
        rules={[
          { 
            type: 'email', 
            message: 'Geçersiz email formatı!' 
          },
          { 
            required: true, 
            message: 'Lütfen email adresinizi girin!' 
          }
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Şifre"
        name="password"
        rules={[{ required: true, message: 'Lütfen şifre girin!' }]}
      >
        <Input.Password />
      </Form.Item>

      <Button type="primary" htmlType="submit" block>
        Kayıt Ol
      </Button>
    </Form>
  );
};

export default RegisterForm;