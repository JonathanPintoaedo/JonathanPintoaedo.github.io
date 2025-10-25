       class DeviceAnalytics {
    constructor() {
        this.sheetUrl = 'https://script.google.com/macros/s/AKfycbzysQwOk3crLVPTQa8pdxyDjAmI4DibHVt83oG8P_j2mPWu4GNp6FJqOQeYYm9eR0ar/exec';
        this.storageKey = 'lastAnalyticsSend';
        this.init();
    }

    init() {
        // Esperar a que la página cargue completamente
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.checkAndSend();
            });
        } else {
            this.checkAndSend();
        }
    }

    checkAndSend() {
        if (!this.shouldSendAnalytics()) {
            console.log('Analytics ya enviados hoy');
            return;
        }
        this.collectAndSend();
    }

    shouldSendAnalytics() {
        const lastSend = localStorage.getItem(this.storageKey);
        if (!lastSend) return true;

        const lastSendDate = new Date(lastSend);
        const today = new Date();
        
        return lastSendDate.toDateString() !== today.toDateString();
    }

    collectDeviceData() {
        const navigator = window.navigator;
        const screen = window.screen;
        const windowInfo = window;
        const connection = navigator.connection || {};

        return {
            // Información básica
            url: window.location.href,
            referrer: document.referrer || 'Directo',
            timestamp: new Date().toISOString(),
            sessionId: this.generateSessionId(),

            // Navegador
            browser: this.getBrowserInfo(),
            browserVersion: this.getBrowserVersion(),
            userAgent: navigator.userAgent,

            // Sistema
            os: this.getOSInfo(),
            platform: navigator.platform,
            language: navigator.language,

            // Pantalla
            screenWidth: screen.width,
            screenHeight: screen.height,
            viewportWidth: windowInfo.innerWidth,
            viewportHeight: windowInfo.innerHeight,
            colorDepth: screen.colorDepth + ' bits',

            // Hardware
            deviceMemory: (navigator.deviceMemory || 'Desconocido') + ' GB',
            hardwareConcurrency: navigator.hardwareConcurrency || 'Desconocido',

            // Conexión
            connectionType: connection.effectiveType || 'Desconocido',
            downlink: connection.downlink || 'Desconocido',

            // Tiempo
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };
    }

    getBrowserInfo() {
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
        if (userAgent.includes('Edg')) return 'Edge';
        return 'Otro';
    }

    getBrowserVersion() {
        const userAgent = navigator.userAgent;
        const temp = userAgent.match(/(Chrome|Firefox|Safari|Edg)\/([0-9.]+)/);
        return temp ? temp[2] : 'Desconocido';
    }

    getOSInfo() {
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Windows')) return 'Windows';
        if (userAgent.includes('Mac')) return 'macOS';
        if (userAgent.includes('Linux')) return 'Linux';
        if (userAgent.includes('Android')) return 'Android';
        if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
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
            console.log('Recolectando datos:', deviceData);
            
            const success = await this.sendToSheet(deviceData);
            
            if (success) {
                localStorage.setItem(this.storageKey, new Date().toISOString());
                console.log('✅ Analytics enviados exitosamente');
            } else {
                console.log('⚠️ Analytics guardados localmente para reintentar después');
            }
        } catch (error) {
            console.error('❌ Error en analytics:', error);
        }
    }

    async sendToSheet(data) {
        try {
            const payload = {
                type: 'device_analytics',
                data: data
            };

            console.log('Enviando datos a Sheet...', payload);

            const response = await fetch(this.sheetUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            console.log('Respuesta del servidor:', result);

            return result.success;

        } catch (error) {
            console.error('Error en fetch:', error);
            this.saveForRetry(data);
            return false;
        }
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
