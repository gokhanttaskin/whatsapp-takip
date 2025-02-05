import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';
import { createClient } from 'redis';
import fetch from 'node-fetch';

// Redis bağlantısı
const redisClient = createClient({ url: 'redis://localhost:6379' });
redisClient.on('error', err => console.log('Redis Client Error', err));
await redisClient.connect();

// WhatsApp Client
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: { headless: true }
});

// QR Kodu Göster
client.on('qr', qr => qrcode.generate(qr, { small: true }));

// Bot Hazır
client.on('ready', () => console.log('✅ WhatsApp Bot Aktif!'));

// Kullanıcı Aktivite Takibi
client.on('user_activity', async (user) => {
  const phone = user.id.split('@')[0]; // Örn: 905551234567
  const now = new Date();

  // Hangi kullanıcılar bu numarayı eklemiş?
  const userKeys = await redisClient.keys('user:*:numbers');
  
  for (const userKey of userKeys) {
    const userId = userKey.split(':')[1];
    const numbers = await redisClient.sMembers(userKey);

    if (numbers.includes(phone)) {
      if (user.isOnline) {
        await redisClient.set(`online:${userId}:${phone}`, now.toISOString());
        console.log(`📱 ${phone} çevrimiçi oldu (Kullanıcı ID: ${userId})`);
      } else {
        const start = await redisClient.get(`online:${userId}:${phone}`);
        if (start) {
          const duration = now.getTime() - new Date(start).getTime();
          
          // Log'u API'ye kaydet
          await fetch('http://localhost:3000/api/log', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              phone,
              start,
              end: now.toISOString(),
              duration
            })
          });

          await redisClient.del(`online:${userId}:${phone}`);
          console.log(`📴 ${phone} çevrimdışı oldu (Süre: ${duration}ms)`);
        }
      }
    }
  }
});

// Bot'u Başlat
client.initialize();