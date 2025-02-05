const puppeteer = require('puppeteer');
const fetch = require('node-fetch');

class WhatsAppMonitor {
    constructor(redisClient) {
        this.redisClient = redisClient;
        this.browser = null;
        this.page = null;
        this.isInitialized = false;
        this.retryCount = 0;
    }

    async initialize() {
        try {
            if (this.browser) {
                await this.browser.close();
            }

            console.log('Browser başlatılıyor...');
            this.browser = await puppeteer.launch({
                headless: false,
                executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                userDataDir: './whatsapp-session',
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--disable-gpu',
                    '--start-maximized',
                    '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                ],
                ignoreDefaultArgs: ['--enable-automation'],
                defaultViewport: null
            });
            console.log('Browser başlatıldı');

            this.page = await this.browser.newPage();
            console.log('Yeni sayfa açıldı');
            
            await this.page.setDefaultNavigationTimeout(60000);
            await this.page.setDefaultTimeout(60000);

            // Debug logları için
            this.page.on('console', msg => console.log('Browser Console:', msg.text()));
            this.page.on('pageerror', error => console.log('Browser Error:', error.message));

            // Hata dinleyicileri
            this.page.on('error', err => {
                console.error('Sayfa hatası:', err);
                this.reconnect();
            });

            this.browser.on('disconnected', () => {
                console.log('Browser bağlantısı koptu, yeniden bağlanılıyor...');
                this.reconnect();
            });

            console.log('WhatsApp Web sayfasına gidiliyor...');
            await this.page.goto('https://web.whatsapp.com', {
                waitUntil: 'networkidle0',
                timeout: 60000
            });
            console.log('WhatsApp Web sayfası yüklendi');

            console.log('QR kodu tarayın...');
            await this.waitForLogin();
            console.log('Giriş işlemi tamamlandı');

            await this.setupPresenceMonitoring();
            console.log('Presence takibi başlatıldı');
            
            this.isInitialized = true;

        } catch (error) {
            console.error('Initialize sırasında detaylı hata:', error);
            await this.handleError(error);
        }
    }

    async waitForLogin() {
        try {
            await this.page.waitForFunction(
                () => {
                    const selectors = [
                        'div[data-testid="chat-list"]',
                        'div[data-testid="default-main"]',
                        '#side',
                        '#pane-side',
                        '[data-testid="conversation-panel-wrapper"]'
                    ];
                    return selectors.some(selector => document.querySelector(selector));
                },
                { timeout: 0 }
            );
            console.log('WhatsApp Web arayüzü yüklendi');

            const isLoggedIn = await this.page.evaluate(() => {
                return !document.querySelector('[data-testid="qrcode"]');
            });

            if (isLoggedIn) {
                console.log('WhatsApp Web\'e başarıyla giriş yapıldı');
                return true;
            } else {
                throw new Error('Giriş başarısız');
            }
        } catch (error) {
            console.error('Giriş beklenirken hata:', error);
            throw error;
        }
    }

    async setupPresenceMonitoring() {
        await this.page.evaluate(() => {
            window.statusMap = new Map();

            async function checkOnlineStatus() {
                try {
                    // Tüm sohbetleri kontrol et
                    const chats = document.querySelectorAll('[data-testid="cell-frame-container"]');
                    
                    for (const chat of chats) {
                        // Sohbete tıkla
                        chat.click();
                        
                        // Kısa bekle
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        
                        // Numara veya isim bilgisini al
                        const titleElement = chat.querySelector('[data-testid="cell-frame-title"]');
                        const onlineStatus = document.querySelector('span.ggj6brxn') || 
                                          document.querySelector('span[title="çevrimiçi"]') || 
                                          document.querySelector('span.l7jjieqr') || 
                                          document.querySelector('span[title="online"]');
                        
                        const text = titleElement ? titleElement.textContent : '';
                        const phone = text.replace(/\D/g, '');
                        
                        if (phone) {
                            const isOnline = !!onlineStatus;
                            console.log(`Kontrol ediliyor: ${phone} - Çevrimiçi: ${isOnline}`);

                            if (window.statusMap.get(phone) !== isOnline) {
                                window.statusMap.set(phone, isOnline);
                                window.handlePresenceChange({
                                    phone: phone.startsWith('+') ? phone : `+${phone}`,
                                    isOnline,
                                    name: text
                                });
                            }
                        }
                    }
                } catch (error) {
                    console.error('Status kontrolünde hata:', error);
                }
            }

            // Her 5 saniyede bir kontrol et
            setInterval(checkOnlineStatus, 5000);
            
            // İlk kontrolü hemen yap
            checkOnlineStatus();
        });

        await this.page.exposeFunction('handlePresenceChange', async ({ phone, isOnline, name }) => {
            const now = new Date();
            console.log(`Durum Değişikliği Algılandı:`, {
                phone,
                name,
                status: isOnline ? 'çevrimiçi' : 'çevrimdışı',
                time: now.toISOString()
            });

            console.log('Redis kontrol başlıyor...');
            try {
                const userKeys = await this.redisClient.keys('user:*:numbers');
                console.log('Bulunan user keys:', userKeys);

                for (const userKey of userKeys) {
                    const userId = userKey.split(':')[1];
                    const numbers = await this.redisClient.sMembers(userKey);
                    console.log(`User ${userId} numaraları:`, numbers);

                    if (numbers.includes(phone)) {
                        if (isOnline) {
                            await this.redisClient.set(`online:${userId}:${phone}`, now.toISOString());
                            console.log(`📱 ${name} (${phone}) çevrimiçi oldu - Kullanıcı: ${userId}`);
                        } else {
                            const startTime = await this.redisClient.get(`online:${userId}:${phone}`);
                            if (startTime) {
                                await this.logPresence(userId, phone, startTime, now, name);
                                await this.redisClient.del(`online:${userId}:${phone}`);
                                console.log(`📴 ${name} (${phone}) çevrimdışı oldu - Kullanıcı: ${userId}`);
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Presence işlenirken hata:', error);
            }
        });
    }

    async logPresence(userId, phone, startTime, endTime, name) {
        try {
            const response = await fetch('http://localhost:3000/api/numara-log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    numaraId: Number(userId),
                    cevrimIciBaslangic: startTime,
                    cevrimIciBitis: endTime.toISOString(),
                    contactName: name
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            console.log(`📝 Log kaydedildi - ${name} (${phone}) - Süre: ${
                Math.round((new Date(endTime) - new Date(startTime)) / 1000 / 60)
            } dakika`);

        } catch (error) {
            console.error('Log kaydedilirken hata:', error);
        }
    }

    async reconnect() {
        this.retryCount++;
        if (this.retryCount < 3) {
            console.log(`Yeniden bağlanma denemesi ${this.retryCount}/3...`);
            try {
                await this.initialize();
            } catch (error) {
                console.error('Yeniden bağlanma hatası:', error);
            }
        } else {
            console.error('Maksimum yeniden bağlanma denemesi aşıldı.');
            process.exit(1);
        }
    }

    async handleError(error) {
        if (this.browser) {
            try {
                await this.browser.close();
            } catch (closeError) {
                console.error('Browser kapatılırken hata:', closeError);
            }
        }
        
        this.browser = null;
        this.page = null;
        this.isInitialized = false;

        if (error.message.includes('Target closed')) {
            await this.reconnect();
        } else {
            throw error;
        }
    }

    async close() {
        if (this.browser) {
            await this.browser.close();
        }
        this.isInitialized = false;
    }
}

module.exports = WhatsAppMonitor;