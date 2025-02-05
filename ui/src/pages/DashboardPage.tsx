// import React from 'react';
// import { Button, Card } from 'antd';
// import { useNavigate } from 'react-router-dom';

// const DashboardPage = () => {
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     navigate('/');
//     window.location.reload();
//   };

//   return (
//     <Card title="Ana Panel" extra={
//       <Button danger onClick={handleLogout}>Çıkış Yap</Button>
//     }>
//       <h2>Hoş Geldiniz!</h2>
//       <p>WhatsApp takip işlemlerinizi buradan yönetebilirsiniz.</p>
//     </Card>
//   );
// };

// export default DashboardPage;

import React, { useState, useEffect } from 'react';
import { Collapse, Button, Card, List, Modal, Form, Input, Spin, message } from 'antd';
import { getNumaralar, getLoglar, numaraEkle } from '../services/authService.ts';
import { useNavigate } from 'react-router-dom';

const { Panel } = Collapse;

const DashboardPage = () => {
  const [numaralar, setNumaralar] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getNumaralar();
      const numaralarWithLogs = await Promise.all(
        data.map(async (numara: any) => ({
          ...numara,
          loglar: await getLoglar(numara.id)
        }))
      );
      setNumaralar(numaralarWithLogs);
    } catch (error) {
      message.error('Veri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: { telefon: string }) => {
    try {
      await numaraEkle(values.telefon);
      message.success('Numara eklendi');
      setIsModalOpen(false);
      form.resetFields();
      await loadData();
    } catch (error) {
      message.error('Ekleme başarısız');
    }
  };

  // const handleLogout = () => {
  //   localStorage.removeItem('token');
  //   navigate('/');
  // };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
    window.location.reload();
  };

  return (
    <Card
      title="WhatsApp Takip Paneli"
      extra={<Button danger onClick={handleLogout}>Çıkış Yap</Button>}
    >
      <Spin spinning={loading}>
        <Button 
          type="primary" 
          onClick={() => setIsModalOpen(true)}
          style={{ marginBottom: 16 }}
        >
          Yeni Numara Ekle
        </Button>

        <Collapse accordion>
          {numaralar.map(numara => (
            <Panel 
              header={numara.telefonNumarasi} 
              key={numara.id}
              extra={`${numara.loglar?.length || 0} kayıt`}
            >
              <List
                dataSource={numara.loglar}
                renderItem={(log: any) => (
                  <List.Item>
                    <List.Item.Meta
                      title={`${new Date(log.cevrimIciBaslangic).toLocaleString()} - ${new Date(log.cevrimIciBitis).toLocaleString()}`}
                      description={`Süre: ${(
                        (new Date(log.cevrimIciBitis).getTime() - 
                        new Date(log.cevrimIciBaslangic).getTime()) / 60000
                      ).toFixed(1)} dakika`}
                    />
                  </List.Item>
                )}
              />
            </Panel>
          ))}
        </Collapse>

        <Modal
          title="Yeni Numara Ekle"
          open={isModalOpen}
          onCancel={() => setIsModalOpen(false)}
          footer={null}
        >
          <Form form={form} onFinish={handleSubmit}>
            <Form.Item
              name="telefon"
              label="Telefon Numarası"
              rules={[
                { required: true, message: 'Bu alan zorunludur' },
                { 
                  pattern: /^\+[1-9]\d{1,14}$/, 
                  message: 'Geçerli bir telefon numarası girin (Örn: +905555555555)' 
                }
              ]}
            >
              <Input placeholder="+90XXXXXXXXXX" />
            </Form.Item>
            <Button type="primary" htmlType="submit">Kaydet</Button>
          </Form>
        </Modal>
      </Spin>
    </Card>
  );
};

export default DashboardPage;