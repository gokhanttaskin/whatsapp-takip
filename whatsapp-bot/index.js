// const { Client, LocalAuth } = require('whatsapp-web.js');
// const qrcode = require('qrcode-terminal');
// const redis = require('redis');

// const client = new Client({
//   authStrategy: new LocalAuth(),
//   puppeteer: { headless: true }
// });

// const redisClient = redis.createClient();

// client.on('qr', qr => qrcode.generate(qr, { small: true }));
// client.on('ready', () => console.log('WhatsApp Bot Aktif!'));

// client.on('user_activity', async (user) => {
//   const now = new Date();
//   if(user.isOnline) {
//     // Çevrimiçi başlangıcı Redis'e kaydet
//     await redisClient.set(`online:${user.id}`, now.toISOString());
//   } else {
//     // Çevrimiçi süreyi hesapla ve API'ye gönder
//     const start = await redisClient.get(`online:${user.id}`);
//     const duration = now - new Date(start);
//     await fetch('http://localhost:3000/api/log', {
//       method: 'POST',
//       body: JSON.stringify({
//         numaraId: user.id,
//         baslangic: start,
//         bitis: now.toISOString(),
//         sure: duration
//       })
//     });
//   }
// });

// client.initialize();


const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { createClient } = require('redis');
const fetch = require('node-fetch');

// Redis bağlantısı
async function setupRedis() {
    const redisClient = createClient({ url: 'redis://localhost:6379' });
    redisClient.on('error', err => console.log('Redis Client Error', err));
    await redisClient.connect();
    return redisClient;
}

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
async function setupUserActivityTracking(redisClient) {
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
}

// Başlatma Fonksiyonu
async function start() {
    const redisClient = await setupRedis();
    await setupUserActivityTracking(redisClient);
    client.initialize();
}

start().catch(console.error);
