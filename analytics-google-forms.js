 //this.formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdnpv04gREa735vPJ-vxcQgieKUPJBiCIj2H13lsKmXEE3fEg/formResponse';
        class DeviceAnalytics {
    constructor() {
        // URL de tu Google Form - ¡REEMPLAZA CON TU ID REAL!
        this.formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSdnpv04gREa735vPJ-vxcQgieKUPJBiCIj2H13lsKmXEE3fEg/formResponse';
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
            sessionId: this.generateSessionId()
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
            
            // Enviar a Google Form
            const success = await this.sendToGoogleForm(deviceData);
            
            if (success) {
                // Marcar como enviado hoy
                localStorage.setItem(this.storageKey, new Date().toISOString());
                console.log('Analytics enviados a Google Forms');
            }
        } catch (error) {
            console.error('Error en analytics:', error);
        }
    }

    async sendToGoogleForm(data) {
        try {
            // Crear FormData con los campos del form
            const formData = new FormData();
            
            // ¡IMPORTANTE! Reemplaza estos entry.XXX con los IDs reales de tu Google Form
            formData.append('entry.178000833', data.browser);           // Campo 1: Navegador
            formData.append('entry.2008827157', data.browserVersion);    // Campo 2: Versión
            formData.append('entry.1247837572', data.os);               // Campo 3: SO
            formData.append('entry.2111598489', data.platform);         // Campo 4: Plataforma
            formData.append('entry.1037415434', `${data.screenWidth}x${data.screenHeight}`); // Campo 5: Resolución
            formData.append('entry.1594877846', `${data.viewportWidth}x${data.viewportHeight}`); // Campo 6: Viewport
            formData.append('entry.190545701', data.language);         // Campo 7: Idioma
            formData.append('entry.743852367', data.deviceMemory);     // Campo 8: Memoria
            formData.append('entry.802418997', data.hardwareConcurrency); // Campo 9: Núcleos CPU
            formData.append('entry.524976428', data.connectionType);   // Campo 10: Tipo Conexión
            formData.append('entry.1275374479', data.timezone);         // Campo 11: Zona Horaria
            formData.append('entry.2009871543', data.url);              // Campo 12: URL
            formData.append('entry.701918284', data.referrer);         // Campo 13: Referrer
            formData.append('entry.364468330', data.sessionId);        // Campo 14: Session ID
            formData.append('entry.348118107', new Date().toLocaleString('es-CL')); // Campo 15: Fecha/Hora

            // Enviar al form - usa 'no-cors' para evitar problemas CORS
            const response = await fetch(this.formUrl, {
                method: 'POST',
                mode: 'no-cors', // ← ESTO ES CLAVE para evitar CORS
                body: formData
            });

            // Con 'no-cors' no podemos verificar la respuesta, pero asumimos éxito
            console.log('Datos enviados a Google Forms exitosamente');
            return true;
            
        } catch (error) {
            console.error('Error enviando a Google Forms:', error);
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
        console.log('Datos guardados localmente para reintentar después');
    }

    // Método para reintentar envíos pendientes
    async retryPending() {
        if (!this.shouldSendAnalytics()) return;

        const pendingAnalytics = JSON.parse(localStorage.getItem('pendingAnalytics') || '[]');
        if (pendingAnalytics.length === 0) return;

        console.log('Reintentando envíos pendientes:', pendingAnalytics.length);

        for (const item of pendingAnalytics) {
            const success = await this.sendToGoogleForm(item.data);
            if (success) {
                // Remover del almacenamiento local
                const updated = pendingAnalytics.filter(p => p.timestamp !== item.timestamp);
                localStorage.setItem('pendingAnalytics', JSON.stringify(updated));
                console.log('Envío pendiente completado');
            }
        }
    }
}

// Inicializar analytics cuando se carga la página
document.addEventListener('DOMContentLoaded', function() {
    const analytics = new DeviceAnalytics();
    
    // También reintentar envíos pendientes
    setTimeout(() => {
        analytics.retryPending();
    }, 5000); // Reintentar después de 5 segundos
});
