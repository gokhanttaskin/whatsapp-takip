// import React from 'react';
// import { Form, Input, Button, message } from 'antd';
// import { login } from '../../services/authService.ts';
// import { useNavigate } from 'react-router-dom';

// const LoginForm = () => {
//   const navigate = useNavigate();

//   const onFinish = async (values: any) => {
//     try {
//       await login(values);
//       message.success('Giriş başarılı!');
//       navigate('/dashboard');
//     } catch (error) {
//       message.error('Giriş başarısız!');
//     }
//   };

//   return (
//     <Form onFinish={onFinish} layout="vertical">
//       <Form.Item
//         label="Kullanıcı Adı"
//         name="username"
//         rules={[{ required: true, message: 'Lütfen kullanıcı adınızı girin!' }]}
//       >
//         <Input />
//       </Form.Item>

//       <Form.Item
//         label="Şifre"
//         name="password"
//         rules={[{ required: true, message: 'Lütfen şifrenizi girin!' }]}
//       >
//         <Input.Password />
//       </Form.Item>

//       <Button type="primary" htmlType="submit" block>
//         Giriş Yap
//       </Button>
//     </Form>
//   );
// };

// export default LoginForm;

import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { login } from '../../services/authService.ts';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const navigate = useNavigate();

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      const response = await login(values);
      if (response) {
        message.success('Giriş başarılı!');
        navigate('/dashboard', { replace: true }); // Yönlendirme iyileştirmesi
        window.location.reload();
      }
    } catch (error) {
      message.error('Geçersiz kullanıcı adı veya şifre!');
    }
  };

  return (
    <Form onFinish={onFinish} layout="vertical">
      <Form.Item
        label="Kullanıcı Adı"
        name="username"
        rules={[{ required: true, message: 'Lütfen kullanıcı adınızı girin!' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Şifre"
        name="password"
        rules={[{ required: true, message: 'Lütfen şifrenizi girin!' }]}
      >
        <Input.Password />
      </Form.Item>

      <Button type="primary" htmlType="submit" block>
        Giriş Yap
      </Button>
    </Form>
  );
};

export default LoginForm;