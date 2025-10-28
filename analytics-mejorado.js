class DeviceAnalytics {
    constructor() {
        this.formUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSeF7msBbdMN18btkQZQ5coSa7losNxFl7HC9J4L-t1EcLb-HA/formResponse'
        
        this.storageKey = 'lastAnalyticsSend';
        this.init();
    }
        // ¡Este método debe estar definido!
    init() {
        // Código de inicialización aquí
        console.log('Analytics inicializado');

    
    async collectDeviceData() {
        try {
            const data = {
                // === INFORMACIÓN BÁSICA ===
                timestamp: new Date().toISOString(),
                url: window.location.href,
                referrer: document.referrer || 'Directo',
                sessionId: this.generateSessionId(),
                visitCount: this.getVisitCount(),

                // === INFORMACIÓN DE RED E IP ===
                ...await this.getNetworkInfo(),

                // === INFORMACIÓN DEL NAVEGADOR ===
                ...this.getBrowserInfo(),

                // === INFORMACIÓN DEL SISTEMA OPERATIVO ===
                ...this.getOSInfo(),

                // === INFORMACIÓN DE HARDWARE ===
                ...this.getHardwareInfo(),

                // === INFORMACIÓN DE PANTALLA ===
                ...this.getScreenInfo(),

                // === INFORMACIÓN DE CONEXIÓN ===
                ...this.getConnectionInfo(),

                // === INFORMACIÓN DE UBICACIÓN APROXIMADA ===
                ...this.getLocationInfo(),

                // === INFORMACIÓN DE INTERACCIÓN ===
                ...this.getInteractionInfo(),

                // === INFORMACIÓN DE PERFORMANCE ===
                ...this.getPerformanceInfo(),

                // === INFORMACIÓN ADICIONAL ===
                ...this.getAdditionalInfo()
            };

            return data;

        } catch (error) {
            console.error('Error recolectando datos:', error);
            return this.getBasicData(); // Datos mínimos en caso de error
        }
    }

    // === MÉTODOS PARA RECOLECTAR DIFERENTES TIPOS DE DATOS ===

    async getNetworkInfo() {
        try {
            // Intentar obtener IP pública
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            const ipData = await ipResponse.json();

            return {
                ipPublica: ipData.ip,
                // Información de red local
                networkType: navigator.connection?.effectiveType || 'Desconocido',
                downlink: navigator.connection?.downlink || 'Desconocido',
                rtt: navigator.connection?.rtt || 'Desconocido',
                saveData: navigator.connection?.saveData || false
            };
        } catch (error) {
            return {
                ipPublica: 'No disponible',
                networkType: navigator.connection?.effectiveType || 'Desconocido',
                downlink: navigator.connection?.downlink || 'Desconocido',
                rtt: navigator.connection?.rtt || 'Desconocido',
                saveData: navigator.connection?.saveData || false
            };
        }
    }

    getBrowserInfo() {
        const ua = navigator.userAgent;

        return {
            // Navegador y versión
            userAgent: ua,
            browser: this.getBrowserName(),
            browserVersion: this.getBrowserVersion(),
            engine: this.getBrowserEngine(),

            // Características del navegador
            language: navigator.language,
            languages: navigator.languages ? navigator.languages.join(', ') : navigator.language,
            cookiesEnabled: navigator.cookieEnabled,
            javaEnabled: navigator.javaEnabled ? navigator.javaEnabled() : false,
            pdfEnabled: navigator.pdfViewerEnabled || false,

            // Privacidad y seguridad
            doNotTrack: navigator.doNotTrack || 'No especificado',
            webdriver: navigator.webdriver || false,
            onLine: navigator.onLine,

            // Plugins instalados
            plugins: this.getInstalledPlugins(),
            mimeTypes: navigator.mimeTypes?.length || 0
        };
    }

    getOSInfo() {
        const ua = navigator.userAgent;
        const platform = navigator.platform;

        return {
            platform: platform,
            os: this.getOSName(),
            osVersion: this.getOSVersion(),
            architecture: this.getArchitecture(),
            deviceType: this.getDeviceType(),

            // Información específica por dispositivo
            isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua),
            isTablet: /iPad|Android(?!.+Mobile)/i.test(ua),
            isDesktop: !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
        };
    }

    getHardwareInfo() {
        return {
            // Memoria y CPU
            deviceMemory: navigator.deviceMemory || 'Desconocido',
            hardwareConcurrency: navigator.hardwareConcurrency || 'Desconocido',

            // Gráficos
            gpu: this.getGPUInfo(),
            maxTouchPoints: navigator.maxTouchPoints || 0,

            // Batería (si está disponible)
            battery: this.getBatteryInfo(),

            // Almacenamiento
            storage: this.getStorageInfo()
        };
    }

    getScreenInfo() {
        const screen = window.screen;

        return {
            // Resoluciones
            screenWidth: screen.width,
            screenHeight: screen.height,
            availableWidth: screen.availWidth,
            availableHeight: screen.availHeight,

            // Viewport
            viewportWidth: window.innerWidth,
            viewportHeight: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio || 1,

            // Color y profundidad
            colorDepth: screen.colorDepth,
            pixelDepth: screen.pixelDepth,

            // Orientación
            orientation: screen.orientation ? screen.orientation.type : 'Desconocido',
            orientationAngle: screen.orientation ? screen.orientation.angle : 0,

            // Tamaños específicos
            windowOuterWidth: window.outerWidth,
            windowOuterHeight: window.outerHeight
        };
    }

    getConnectionInfo() {
        const connection = navigator.connection || {};

        return {
            connectionType: connection.effectiveType || 'Desconocido',
            downlink: connection.downlink || 'Desconocido',
            downlinkMax: connection.downlinkMax || 'Desconocido',
            rtt: connection.rtt || 'Desconocido',
            saveData: connection.saveData || false
        };
    }

    getLocationInfo() {
        return {
            // Zona horaria
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            timezoneOffset: new Date().getTimezoneOffset(),

            // Configuración regional
            locale: navigator.language,
            region: this.getRegionFromTimezone(),

            // Moneda e idioma
            currency: this.getCurrency(),
            numberFormat: this.getNumberFormat()
        };
    }

    getInteractionInfo() {
        return {
            // Tiempo en la página
            timeOnPage: this.getTimeOnPage(),

            // Scroll behavior
            scrollDepth: this.getScrollDepth(),

            // Interacciones
            clicks: this.getClickCount(),
            keyPresses: this.getKeyPressCount(),

            // Dispositivo de entrada
            inputDevice: this.getInputDeviceType(),

            // Preferencias de movimiento
            prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        };
    }

    getPerformanceInfo() {
        const perf = window.performance;

        return {
            // Tiempos de carga
            navigationTiming: this.getNavigationTiming(),

            // Memoria (Chrome only)
            memory: this.getMemoryInfo(),

            // Paint timing
            paintTiming: this.getPaintTiming(),

            // Core Web Vitals aproximados
            coreWebVitals: this.getCoreWebVitals()
        };
    }

    getAdditionalInfo() {
        return {
            // Características soportadas
            features: this.getSupportedFeatures(),

            // WebGL info
            webgl: this.getWebGLInfo(),

            // Fuentes instaladas
            fonts: this.getInstalledFonts(),

            // Permisos
            permissions: this.getPermissionStatus(),

            // Notificaciones
            notificationPermission: Notification.permission,

            // Cookie settings
            cookieConsent: this.getCookieConsent()
        };
    }

    // === MÉTODOS AUXILIARES ===

    getBrowserName() {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
        if (ua.includes('Edg')) return 'Edge';
        if (ua.includes('Opera') || ua.includes('OPR/')) return 'Opera';
        if (ua.includes('Samsung')) return 'Samsung Internet';
        return 'Desconocido';
    }

    getBrowserVersion() {
        const ua = navigator.userAgent;
        const browser = this.getBrowserName();

        const patterns = {
            'Chrome': /Chrome\/([0-9.]+)/,
            'Firefox': /Firefox\/([0-9.]+)/,
            'Safari': /Version\/([0-9.]+)/,
            'Edge': /Edg\/([0-9.]+)/,
            'Opera': /(Opera|OPR)\/([0-9.]+)/
        };

        const match = ua.match(patterns[browser]);
        return match ? match[1] : 'Desconocido';
    }

    getOSName() {
        const ua = navigator.userAgent;
        const platform = navigator.platform;

        if (ua.includes('Windows')) {
            if (ua.includes('Windows NT 10.0')) return 'Windows 10/11';
            if (ua.includes('Windows NT 6.3')) return 'Windows 8.1';
            if (ua.includes('Windows NT 6.2')) return 'Windows 8';
            if (ua.includes('Windows NT 6.1')) return 'Windows 7';
            return 'Windows';
        }
        if (ua.includes('Mac')) return 'macOS';
        if (ua.includes('Linux')) return 'Linux';
        if (ua.includes('Android')) return 'Android';
        if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
        if (ua.includes('CrOS')) return 'Chrome OS';

        return 'Desconocido';
    }

    getDeviceType() {
        const ua = navigator.userAgent;
        const width = window.screen.width;

        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
            return width >= 768 ? 'Tablet' : 'Mobile';
        }
        return 'Desktop';
    }

    getInstalledPlugins() {
        const plugins = [];
        for (let i = 0; i < navigator.plugins.length; i++) {
            plugins.push(navigator.plugins[i].name);
        }
        return plugins.join(', ') || 'No plugins detectados';
    }

    getGPUInfo() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                return {
                    vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
                    renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
                };
            }
        }
        return { vendor: 'Desconocido', renderer: 'Desconocido' };
    }

    getTimeOnPage() {
        return Math.round((Date.now() - performance.timing.navigationStart) / 1000);
    }

    getScrollDepth() {
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        return Math.round(scrollPercent);
    }

    getVisitCount() {
        let count = localStorage.getItem('visitCount') || 0;
        count = parseInt(count) + 1;
        localStorage.setItem('visitCount', count);
        return count;
    }

    generateSessionId() {
        let sessionId = localStorage.getItem('analyticsSessionId');
        if (!sessionId) {
            sessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
            localStorage.setItem('analyticsSessionId', sessionId);
        }
        return sessionId;
    }

    // Métodos simplificados para evitar errores
    getBasicData() {
        return {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            browser: this.getBrowserName(),
            os: this.getOSName(),
            screen: `${screen.width}x${screen.height}`,
            language: navigator.language,
            error: 'Datos completos no disponibles'
        };
    }

    // El resto de los métodos (getRegionFromTimezone, getCurrency, etc.)
    // los puedes implementar según necesites

    async collectAndSend() {
        try {
            const deviceData = await this.collectDeviceData();
            console.log('📊 Datos del dispositivo recolectados:', deviceData);

            // Enviar a Google Form
            const success = await this.sendToGoogleForm(deviceData);

            if (success) {
                localStorage.setItem(this.storageKey, new Date().toISOString());
                console.log('✅ Analytics enviados exitosamente');
            }
        } catch (error) {
            console.error('❌ Error en analytics:', error);
        }
    }

    async sendToGoogleForm(data) {
        try {
            const formData = new FormData();

            // MAPEO COMPLETO DE CAMPOS - REEMPLAZA CON TUS IDs REALES
            const fieldMapping = {
                // Información Básica
                'timestamp': 'entry.792385144',
                'url': 'entry.856343624',
                'referrer': 'entry.1035361933',
                'sessionId': 'entry.1955250654',
                'visitCount': 'entry.1767798117',

                // Red e IP
                'ipPublica': 'entry.1603865237',
                'networkType': 'entry.385188013',
                'downlink': 'entry.1233216236',
                'rtt': 'entry.507285268',
                'saveData': 'entry.657687174',

                // Navegador
                'userAgent': 'entry.1151868981',
                'browser': 'entry.467795613',
                'browserVersion': 'entry.1167128224',
                'engine': 'entry.44864641',
                'language': 'entry.28740696',
                'languages': 'entry.1653388674',
                'cookiesEnabled': 'entry.422382255',
                'javaEnabled': 'entry.545635312',
                'pdfEnabled': 'entry.1207357722',
                'doNotTrack': 'entry.1526889826',

                // Sistema Operativo
                'platform': 'entry.1671643079',
                'os': 'entry.922466399',
                'osVersion': 'entry.661261845',
                'architecture': 'entry.29004956',
                'deviceType': 'entry.1685982662',
                'isMobile': 'entry.1600637995',
                'isTablet': 'entry.714099541',
                'isDesktop': 'entry.1515775001',

                // Hardware
                'deviceMemory': 'entry.447191228',
                'hardwareConcurrency': 'entry.1863298503',
                'gpu.vendor': 'entry.427328646',
                'gpu.renderer': 'entry.723804087',
                'maxTouchPoints': 'entry.1943102014',

                // Pantalla
                'screenWidth': 'entry.296446152',
                'screenHeight': 'entry.1792775877',
                'availableWidth': 'entry.547318876',
                'availableHeight': 'entry.1287855850',
                'viewportWidth': 'entry.498055180',
                'viewportHeight': 'entry.1572236850',
                'devicePixelRatio': 'entry.1583598905',
                'colorDepth': 'entry.1474034621',
                'pixelDepth': 'entry.1526741530',
                'orientation': 'entry.1502183128',
                'orientationAngle': 'entry.168825656',

                // Ubicación y Tiempo
                'timezone': 'entry.1423236423',
                'timezoneOffset': 'entry.1472084733',
                'region': 'entry.962959478',
                'currency': '1544074379',

                // Interacción
                'timeOnPage': 'entry.1542845838',
                'scrollDepth': 'entry.44407827',
                'inputDevice': 'entry.1542505926',
                'prefersReducedMotion': 'entry.211820894'
            };

            // Llenar el FormData
            Object.keys(fieldMapping).forEach(key => {
                if (data[key] !== null && data[key] !== undefined) {
                    let value = data[key];

                    // Convertir objetos y booleanos a string
                    if (typeof value === 'object') {
                        value = JSON.stringify(value);
                    } else if (typeof value === 'boolean') {
                        value = value ? 'Sí' : 'No';
                    }

                    formData.append(fieldMapping[key], value.toString());
                }
            });

            const response = await fetch(this.formUrl, {
                method: 'POST',
                mode: 'no-cors',
                body: formData
            });

            console.log('📨 Datos de analytics enviados a Google Forms');
            return true;

        } catch (error) {
            console.error('Error enviando a Google Forms:', error);
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
}

// Inicializar
document.addEventListener('DOMContentLoaded', function () {
    const analytics = new DeviceAnalytics();
});
