class DeviceAnalytics {
    constructor() {
        this.sheetUrl = 'https://script.google.com/macros/s/AKfycbzysQwOk3crLVPTQa8pdxyDjAmI4DibHVt83oG8P_j2mPWu4GNp6FJqOQeYYm9eR0ar/exec'; // Reemplazar con tu Google Apps Script
        this.storageKey = 'lastAnalyticsSend';
        this.init();
    }

    init() {
        // Verificar si ya se enviaron analytics hoy
        if (!this.shouldSendAnalytics()) {
            console.log('Analytics ya enviados hoy');
            return;
        }

        // Recolectar y enviar datos
        this.collectAndSend();
    }

    shouldSendAnalytics() {
        const lastSend = localStorage.getItem(this.storageKey);
        if (!lastSend) return true;

        const lastSendDate = new Date(lastSend);
        const today = new Date();
        
        // Comparar si es el mismo día
        return lastSendDate.toDateString() !== today.toDateString();
    }

    collectDeviceData() {
        const navigator = window.navigator;
        const screen = window.screen;
        const windowInfo = window;
        const connection = navigator.connection || {};
        const memory = navigator.deviceMemory || 'Desconocido';

        return {
            // Información del navegador
            userAgent: navigator.userAgent,
            browser: this.getBrowserInfo(),
            browserVersion: this.getBrowserVersion(),
            language: navigator.language,
            languages: navigator.languages ? navigator.languages.join(', ') : navigator.language,
            cookiesEnabled: navigator.cookieEnabled,

            // Información de pantalla
            screenWidth: screen.width,
            screenHeight: screen.height,
            colorDepth: screen.colorDepth + ' bits',
            pixelDepth: screen.pixelDepth + ' bits',
            orientation: screen.orientation ? screen.orientation.type : 'Desconocido',
            availableWidth: screen.availWidth,
            availableHeight: screen.availHeight,

            // Información del viewport
            viewportWidth: windowInfo.innerWidth,
            viewportHeight: windowInfo.innerHeight,

            // Información del sistema operativo
            platform: navigator.platform,
            os: this.getOSInfo(),

            // Información de hardware
            deviceMemory: memory + ' GB',
            hardwareConcurrency: navigator.hardwareConcurrency || 'Desconocido',
            maxTouchPoints: navigator.maxTouchPoints || 0,

            // Información de conexión
            connectionType: connection.effectiveType || 'Desconocido',
            downlink: connection.downlink || 'Desconocido',
            rtt: connection.rtt || 'Desconocido',

            // Información de zona horaria
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timezoneOffset: new Date().getTimezoneOffset(),

            // Información de la visita
            url: window.location.href,
            referrer: document.referrer || 'Directo',
            timestamp: new Date().toISOString(),
            sessionId: this.generateSessionId(),

            // Información adicional
            javaEnabled: navigator.javaEnabled ? navigator.javaEnabled() : false,
            pdfEnabled: navigator.pdfViewerEnabled || false,
            doNotTrack: navigator.doNotTrack || 'No especificado'
        };
    }

    getBrowserInfo() {
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
        if (userAgent.includes('Edg')) return 'Edge';
        if (userAgent.includes('Opera') || userAgent.includes('OPR/')) return 'Opera';
        return 'Desconocido';
    }

    getBrowserVersion() {
        const userAgent = navigator.userAgent;
        const browser = this.getBrowserInfo();
        
        switch (browser) {
            case 'Chrome':
                return userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || 'Desconocido';
            case 'Firefox':
                return userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || 'Desconocido';
            case 'Safari':
                return userAgent.match(/Version\/([0-9.]+)/)?.[1] || 'Desconocido';
            case 'Edge':
                return userAgent.match(/Edg\/([0-9.]+)/)?.[1] || 'Desconocido';
            default:
                return 'Desconocido';
        }
    }

    getOSInfo() {
        const userAgent = navigator.userAgent;
        
        if (userAgent.includes('Windows')) {
            if (userAgent.includes('Windows NT 10.0')) return 'Windows 10/11';
            if (userAgent.includes('Windows NT 6.3')) return 'Windows 8.1';
            if (userAgent.includes('Windows NT 6.2')) return 'Windows 8';
            if (userAgent.includes('Windows NT 6.1')) return 'Windows 7';
            return 'Windows';
        }
        if (userAgent.includes('Mac')) return 'macOS';
        if (userAgent.includes('Linux')) return 'Linux';
        if (userAgent.includes('Android')) return 'Android';
        if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
        
        return 'Desconocido';
    }

    generateSessionId() {
        let sessionId = localStorage.getItem('analyticsSessionId');
        if (!sessionId) {
            sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
            localStorage.setItem('analyticsSessionId', sessionId);
        }
        return sessionId;
    }

    async collectAndSend() {
        try {
            const deviceData = this.collectDeviceData();
            console.log('Datos del dispositivo:', deviceData);
            
            // Enviar a Google Sheets
           /* const success = await this.sendToSheet(deviceData);
            
            if (success) {
                // Marcar como enviado hoy
                localStorage.setItem(this.storageKey, new Date().toISOString());
                console.log('Analytics enviados exitosamente');
            }
        } catch (error) {
            console.error('Error en analytics:', error);
        }
    }

    async sendToSheet(data) {
        try {
            const response = await fetch(this.sheetUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'device_analytics',
                    data: data
                })
            });

            return response.ok;
        } catch (error) {
            console.error('Error enviando a sheet:', error);
            
            // Guardar localmente para reintentar después
            this.saveForRetry(data);
            return false;
        }
    }

    saveForRetry(data) {
        const pendingAnalytics = JSON.parse(localStorage.getItem('pendingAnalytics') || '[]');
        pendingAnalytics.push({
            timestamp: new Date().toISOString(),
            data: data
        });
        localStorage.setItem('pendingAnalytics', JSON.stringify(pendingAnalytics));
    }

    // Método para reintentar envíos pendientes
    async retryPending() {
        if (!this.shouldSendAnalytics()) return;

        const pendingAnalytics = JSON.parse(localStorage.getItem('pendingAnalytics') || '[]');
        if (pendingAnalytics.length === 0) return;

        for (const item of pendingAnalytics) {
            const success = await this.sendToSheet(item.data);
            if (success) {
                // Remover del almacenamiento local
                const updated = pendingAnalytics.filter(p => p.timestamp !== item.timestamp);
                localStorage.setItem('pendingAnalytics', JSON.stringify(updated));
            }
        }
    }
}

// Inicializar analytics cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    const analytics = new DeviceAnalytics();
    
    // También reintentar envíos pendientes
    analytics.retryPending();
});

// Opcional: Enviar analytics cuando la página se cierra o recarga
window.addEventListener('beforeunload', function() {
    // Podrías enviar datos de tiempo en la página aquí
});*/
