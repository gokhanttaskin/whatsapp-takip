// const { Client, LocalAuth } = require('whatsapp-web.js');
// const qrcode = require('qrcode-terminal');
// const { createClient } = require('redis');
// const fetch = require('node-fetch');
// const express = require('express');
// const app = express();
// const bodyParser = require('body-parser');

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// const client = new Client({
//    authStrategy: new LocalAuth({ clientId: "client-one" }),
//    puppeteer: {
//        headless: true,
//        args: [
//            '--no-sandbox',
//            '--disable-setuid-sandbox',
//            '--disable-dev-shm-usage',
//            '--disable-accelerated-2d-canvas',
//            '--no-first-run',
//            '--no-zygote',
//            '--disable-gpu'
//        ]
//    }
// });

// async function setupRedis() {
//    const redisClient = createClient({ url: 'redis://localhost:6379' });
//    redisClient.on('error', err => console.log('Redis Client Error', err));
//    await redisClient.connect();
//    return redisClient;
// }

// client.on('auth_failure', msg => {
//    console.error('WhatsApp kimlik doğrulama hatası:', msg);
// });

// client.on('disconnected', (reason) => {
//    console.log('WhatsApp bağlantısı kesildi:', reason);
//    client.initialize();
// });

// client.on('qr', qr => {
//    console.log('QR Kod alındı, tarayınız:');
//    qrcode.generate(qr, { small: true });
// });

// client.on('ready', () => console.log('✅ WhatsApp Bot Aktif!'));

// async function setupPresenceTracking(redisClient) {
//     // Presence değişikliklerini dinle
//     client.on('presence.update', async presence => {
//         try {
//             const phone = presence.id.split('@')[0];
//             const now = new Date();
//             const isOnline = presence.lastKnownPresence === 'available';
            
//             console.log(`Presence değişikliği algılandı: ${phone} - ${isOnline ? 'çevrimiçi' : 'çevrimdışı'} - ${now.toISOString()}`);

//             const userKeys = await redisClient.keys('user:*:numbers');
            
//             for (const userKey of userKeys) {
//                 const userId = userKey.split(':')[1];
//                 const numbers = await redisClient.sMembers(userKey);
                
//                 if (numbers.includes(phone)) {
//                     if (isOnline) {
//                         await redisClient.set(`online:${userId}:${phone}`, now.toISOString());
//                         console.log(`📱 ${phone} çevrimiçi oldu (Kullanıcı ID: ${userId}, Zaman: ${now.toISOString()})`);
//                     } else {
//                         const startTime = await redisClient.get(`online:${userId}:${phone}`);
//                         if (startTime) {
//                             try {
//                                 const response = await fetch('http://localhost:3000/api/numara-log', {
//                                     method: 'POST',
//                                     headers: { 'Content-Type': 'application/json' },
//                                     body: JSON.stringify({
//                                         numaraId: Number(userId),
//                                         cevrimIciBaslangic: startTime,
//                                         cevrimIciBitis: now.toISOString()
//                                     })
//                                 });

//                                 console.log('Log gönderildi:', await response.json());
//                                 await redisClient.del(`online:${userId}:${phone}`);
//                             } catch (error) {
//                                 console.error('Log gönderilirken hata:', error);
//                             }
//                         }
//                     }
//                 }
//             }
//         } catch (error) {
//             console.error('Presence takibinde hata:', error);
//         }
//     });
// }

// async function handlePresenceUpdate(phone, isOnline, now, userKeys, redisClient) {
//    for (const userKey of userKeys) {
//        const userId = userKey.split(':')[1];
//        const numbers = await redisClient.sMembers(userKey);

//        if (numbers.includes(phone)) {
//            if (isOnline) {
//                await redisClient.set(`online:${userId}:${phone}`, now.toISOString());
//                console.log(`📱 ${phone} çevrimiçi oldu (Kullanıcı ID: ${userId})`);
//            } else {
//                const startTime = await redisClient.get(`online:${userId}:${phone}`);
//                if (startTime) {
//                    try {
//                        await sendLogToApi(userId, phone, startTime, now);
//                        await redisClient.del(`online:${userId}:${phone}`);
//                        console.log(`📴 ${phone} çevrimdışı oldu`);
//                    } catch (error) {
//                        console.error('Log kaydedilirken hata:', error);
//                    }
//                }
//            }
//        }
//    }
// }

// // sendLogToApi fonksiyonunu güncelleyelim
// async function sendLogToApi(userId, phone, startTime, endTime) {
//     const response = await fetch('http://localhost:3000/api/numara-log', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//             numaraId: Number(userId),  // id yerine numaraId kullan
//             cevrimIciBaslangic: startTime,
//             cevrimIciBitis: endTime.toISOString()
//         })
//     });

//     if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     return await response.json();
// }

// async function addNewContact(phone) {
//    try {
//        const formattedNumber = phone.startsWith('+') ? phone.slice(1) : phone;
//        const contactId = `${formattedNumber}@c.us`;

//        try {
//            const chat = await client.getChatById(contactId);
//            await chat.sendMessage('Merhaba! Bu bir sistem mesajıdır, silinecektir.');
           
//            const messages = await chat.fetchMessages({ limit: 1 });
//            if (messages && messages.length > 0) {
//                await messages[0].delete(true);
//            }

//            // Presence takibini aktifleştir
//            await client.subscribePresence(contactId);
           
//            console.log(`✅ Numara başarıyla rehbere eklendi: ${phone}`);
//            return true;
//        } catch (error) {
//            console.error(`❌ Chat oluşturulurken hata: ${phone}`, error);
//            return false;
//        }
//    } catch (error) {
//        console.error(`❌ Beklenmeyen hata: ${phone}`, error);
//        return false;
//    }
// }

// app.post('/api/whatsapp/add-contact', async (req, res) => {
//    const { phone } = req.body;
//    try {
//        const result = await addNewContact(phone);
//        res.json({ success: result });
//    } catch (error) {
//        res.status(500).json({
//            success: false,
//            error: error.message
//        });
//    }
// });

// function checkConnection() {
//    if (!client.pupPage) {
//        console.log('Bağlantı koptu, yeniden başlatılıyor...');
//        client.initialize();
//    }
// }

// setInterval(checkConnection, 1000 * 60);

// const PORT = 3002;
// app.listen(PORT, () => {
//    console.log(`WhatsApp bot server ${PORT} portunda çalışıyor`);
// });

// async function start() {
//     try {
//         console.log('WhatsApp bot başlatılıyor...');
//         const redisClient = await setupRedis();
//         console.log('Redis bağlantısı kuruldu');
        
//         await client.initialize();
//         console.log('WhatsApp client başlatıldı');
        
//         await setupPresenceTracking(redisClient);
//         console.log('Presence takibi başlatıldı');
//     } catch (error) {
//         console.error('Başlatma sırasında hata:', error);
//         process.exit(1);
//     }
// }

// start().catch(console.error);

// process.on('SIGINT', async () => {
//    try {
//        console.log('Uygulama kapatılıyor...');
//        await client.destroy();
//        process.exit(0);
//    } catch (error) {
//        console.error('Kapatma sırasında hata:', error);
//        process.exit(1);
//    }
// });
const WhatsAppMonitor = require('./WhatsAppMonitor');
const express = require('express');
const { createClient } = require('redis');
const app = express();

app.use(express.json());

const PORT = 3002;
app.listen(PORT, () => {
    console.log(`WhatsApp bot server ${PORT} portunda çalışıyor`);
});

async function setupRedis() {
    const redisClient = createClient({ url: 'redis://localhost:6379' });
    redisClient.on('error', err => console.log('Redis Client Error', err));
    await redisClient.connect();
    return redisClient;
}

let monitor = null;

async function start() {
    try {
        console.log('WhatsApp bot başlatılıyor...');
        const redisClient = await setupRedis();
        console.log('Redis bağlantısı kuruldu');

        monitor = new WhatsAppMonitor(redisClient);
        await monitor.initialize();
        
        process.on('SIGINT', async () => {
            if (monitor) {
                await monitor.close();
            }
            process.exit(0);
        });
    } catch (error) {
        console.error('Başlatma sırasında hata:', error);
        process.exit(1);
    }
}

start().catch(console.error);