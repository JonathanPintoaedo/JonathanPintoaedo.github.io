class DeviceAnalytics {
    constructor() {
        // REEMPLAZA con tu SCRIPT_ID real
        this.scriptUrl = 'https://script.google.com/macros/s/AKfycbzysQwOk3crLVPTQa8pdxyDjAmI4DibHVt83oG8P_j2mPWu4GNp6FJqOQeYYm9eR0ar/exec';
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
            this.sendAnalytics();
        }, 1500);
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
            browser: this.getBrowserInfo(),
            os: this.getOSInfo(),
            screenWidth: screen.width,
            screenHeight: screen.height,
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            sessionId: this.generateSessionId(),
            userAgent: navigator.userAgent.substring(0, 100) // Limitar tamaño
        };
    }

    getBrowserInfo() {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
        if (ua.includes('Edg')) return 'Edge';
        return 'Otro';
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

    sendAnalytics() {
        const deviceData = this.collectDeviceData();
        console.log('📊 Enviando analytics:', deviceData);
        
        // Usar Image object para evitar CORS - técnica de pixel tracking
        this.sendViaImagePixel(deviceData);
    }

    sendViaImagePixel(data) {
        try {
            // Codificar datos en URL
            const encodedData = encodeURIComponent(JSON.stringify(data));
            const trackingUrl = `${this.scriptUrl}?analytics=true&data=${encodedData}&r=${Math.random()}`;
            
            console.log('🖼️ Enviando via pixel:', trackingUrl);
            
            // Crear imagen invisible
            const img = new Image();
            img.src = trackingUrl;
            img.style.display = 'none';
            img.width = 1;
            img.height = 1;
            
            img.onload = () => {
                console.log('✅ Analytics enviados exitosamente via pixel');
                localStorage.setItem(this.storageKey, new Date().toISOString());
                document.body.removeChild(img);
            };
            
            img.onerror = () => {
                console.log('⚠️ Error en pixel, guardando localmente');
                this.saveForRetry(data);
                document.body.removeChild(img);
            };
            
            // Agregar al DOM temporalmente
            document.body.appendChild(img);
            
            // Timeout por seguridad
            setTimeout(() => {
                if (img.parentNode) {
                    document.body.removeChild(img);
                }
            }, 5000);
            
        } catch (error) {
            console.error('❌ Error en pixel tracking:', error);
            this.saveForRetry(data);
        }
    }

    sendViaScriptTag(data) {
        // Método alternativo usando script tag
        return new Promise((resolve) => {
            try {
                const encodedData = encodeURIComponent(JSON.stringify(data));
                const scriptUrl = `${this.scriptUrl}?analytics=true&data=${encodedData}&callback=analyticsCallback&r=${Math.random()}`;
                
                const script = document.createElement('script');
                script.src = scriptUrl;
                
                // Callback global temporal
                window.analyticsCallback = (response) => {
                    console.log('✅ Analytics via script:', response);
                    localStorage.setItem(this.storageKey, new Date().toISOString());
                    delete window.analyticsCallback;
                    if (script.parentNode) {
                        document.head.removeChild(script);
                    }
                    resolve(true);
                };
                
                // Timeout
                setTimeout(() => {
                    if (window.analyticsCallback) {
                        console.log('⚠️ Timeout script, guardando localmente');
                        this.saveForRetry(data);
                        delete window.analyticsCallback;
                        if (script.parentNode) {
                            document.head.removeChild(script);
                        }
                        resolve(false);
                    }
                }, 3000);
                
                document.head.appendChild(script);
                
            } catch (error) {
                console.error('❌ Error en script tag:', error);
                this.saveForRetry(data);
                resolve(false);
            }
        });
    }

    saveForRetry(data) {
        try {
            const pending = JSON.parse(localStorage.getItem('pendingAnalytics') || '[]');
            pending.push({
                timestamp: new Date().toISOString(),
                data: data
            });
            localStorage.setItem('pendingAnalytics', JSON.stringify(pending));
            console.log('💾 Datos guardados localmente para reintentar');
        } catch (error) {
            console.error('Error guardando localmente:', error);
        }
    }

    // Reintentar envíos pendientes
    retryPending() {
        if (!this.shouldSendAnalytics()) return;
        
        const pending = JSON.parse(localStorage.getItem('pendingAnalytics') || '[]');
        if (pending.length === 0) return;
        
        console.log(`🔄 Reintentando ${pending.length} analytics pendientes`);
        
        pending.forEach(item => {
            setTimeout(() => {
                this.sendViaImagePixel(item.data);
            }, 1000);
        });
        
        // Limpiar pendientes después de intentar
        localStorage.removeItem('pendingAnalytics');
    }
}

// Inicializar analytics
document.addEventListener('DOMContentLoaded', function() {
    const analytics = new DeviceAnalytics();
    
    // Reintentar pendientes después de 5 segundos
    setTimeout(() => {
        analytics.retryPending();
    }, 5000);
});

// También intentar enviar cuando la página se cierra
window.addEventListener('beforeunload', function() {
    // Opcional: intentar enviar analytics de salida
});
