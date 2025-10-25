class DeviceAnalytics {
    constructor() {
        this.sheetUrl = 'https://script.google.com/macros/s/AKfycbzysQwOk3crLVPTQa8pdxyDjAmI4DibHVt83oG8P_j2mPWu4GNp6FJqOQeYYm9eR0ar/exec';
        this.storageKey = 'lastAnalyticsSend';
        this.init();
    }

    init() {
        if (!this.shouldSendAnalytics()) {
            console.log('📊 Analytics ya enviados hoy');
            return;
        }
        
        // Esperar a que la página cargue
        setTimeout(() => {
            this.collectAndSend();
        }, 1000);
    }

    shouldSendAnalytics() {
        const lastSend = localStorage.getItem(this.storageKey);
        if (!lastSend) return true;
        const lastSendDate = new Date(lastSend);
        const today = new Date();
        return lastSendDate.toDateString() !== today.toDateString();
    }

    collectDeviceData() {
        return {
            url: window.location.href,
            referrer: document.referrer || 'Directo',
            timestamp: new Date().toISOString(),
            sessionId: this.generateSessionId(),
            browser: this.getBrowserInfo(),
            browserVersion: this.getBrowserVersion(),
            os: this.getOSInfo(),
            platform: navigator.platform,
            language: navigator.language,
            screenWidth: screen.width,
            screenHeight: screen.height,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            deviceMemory: (navigator.deviceMemory || 'Desconocido') + ' GB',
            hardwareConcurrency: navigator.hardwareConcurrency || 'Desconocido',
            connectionType: (navigator.connection || {}).effectiveType || 'Desconocido',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }

    getBrowserInfo() {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
        return 'Otro';
    }

    getBrowserVersion() {
        const ua = navigator.userAgent;
        const match = ua.match(/(Chrome|Firefox|Safari)\/([0-9.]+)/);
        return match ? match[2] : 'Desconocido';
    }

    getOSInfo() {
        const ua = navigator.userAgent;
        if (ua.includes('Windows')) return 'Windows';
        if (ua.includes('Mac')) return 'macOS';
        if (ua.includes('Linux')) return 'Linux';
        if (ua.includes('Android')) return 'Android';
        if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
        return 'Desconocido';
    }

    generateSessionId() {
        let sessionId = localStorage.getItem('analyticsSessionId');
        if (!sessionId) {
            sessionId = 'sess_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('analyticsSessionId', sessionId);
        }
        return sessionId;
    }

    async collectAndSend() {
        try {
            const deviceData = this.collectDeviceData();
            console.log('📊 Enviando analytics:', deviceData);
            
            const success = await this.sendToSheet(deviceData);
            
            if (success) {
                localStorage.setItem(this.storageKey, new Date().toISOString());
                console.log('✅ Analytics enviados exitosamente');
            }
        } catch (error) {
            console.error('❌ Error en analytics:', error);
        }
    }

    async sendToSheet(data) {
        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            const payload = JSON.stringify({
                type: 'device_analytics',
                data: data
            });

            xhr.open('POST', this.sheetUrl, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        console.log('✅ Datos enviados al servidor');
                        resolve(true);
                    } else {
                        console.log('⚠️ Error HTTP, guardando localmente');
                        this.saveForRetry(data);
                        resolve(false);
                    }
                }
            };
            
            xhr.onerror = () => {
                console.log('🌐 Error de red, guardando localmente');
                this.saveForRetry(data);
                resolve(false);
            };
            
            xhr.send(payload);
        });
    }

    saveForRetry(data) {
        const pending = JSON.parse(localStorage.getItem('pendingAnalytics') || '[]');
        pending.push({
            timestamp: new Date().toISOString(),
            data: data
        });
        localStorage.setItem('pendingAnalytics', JSON.stringify(pending));
    }
}

// Inicializar
new DeviceAnalytics();
