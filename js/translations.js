const translations = {
    en: {
        status_connected: "Connected",
        status_not_connected: "Not Connected",
        connect_button: "Connect",
        disconnect_button: "Disconnect",
        advanced_settings: "Advanced Settings",
        webrtc_protection: "WebRTC Leak Protection",
        connection_error: "Connection Problem",
        error_message_title: "Connection Problem:",
        error_check_internet: "1. Check your internet connection",
        error_proxy_unavailable: "2. Proxy server seems to be unavailable",
        error_check_firewall: "3. Check if your firewall allows SOCKS5 connections",
        connecting: "Connecting..."
    },
    ru: {
        status_connected: "Подключено",
        status_not_connected: "Не подключено",
        connect_button: "Подключиться",
        disconnect_button: "Отключиться",
        advanced_settings: "Расширенные настройки",
        webrtc_protection: "Защита от утечек WebRTC",
        connection_error: "Ошибка соединения",
        error_message_title: "Проблема с подключением:",
        error_check_internet: "1. Проверьте ваше интернет-соединение",
        error_proxy_unavailable: "2. Прокси-сервер недоступен",
        error_check_firewall: "3. Проверьте, разрешает ли ваш брандмауэр соединения SOCKS5",
        connecting: "Подключение..."
    },
    es: {
        status_connected: "Conectado",
        status_not_connected: "No Conectado",
        connect_button: "Conectar",
        disconnect_button: "Desconectar",
        advanced_settings: "Configuración Avanzada",
        webrtc_protection: "Protección contra fugas WebRTC",
        connection_error: "Problema de Conexión",
        error_message_title: "Problema de conexión con el proxy:",
        error_check_internet: "1. Comprueba tu conexión a internet",
        error_proxy_unavailable: "2. El servidor proxy parece estar inaccesible",
        error_check_firewall: "3. Comprueba si tu firewall permite conexiones SOCKS5",
        connecting: "Conectando..."
    },
    de: {
        status_connected: "Verbunden",
        status_not_connected: "Nicht Verbunden",
        connect_button: "Verbinden",
        disconnect_button: "Trennen",
        advanced_settings: "Erweiterte Einstellungen",
        webrtc_protection: "WebRTC-Leak-Schutz",
        connection_error: "Verbindungsproblem",
        error_message_title: "Problem mit der Proxy-Verbindung:",
        error_check_internet: "1. Überprüfen Sie Ihre Internetverbindung",
        error_proxy_unavailable: "2. Der Proxy-Server scheint nicht erreichbar zu sein",
        error_check_firewall: "3. Prüfen Sie, ob Ihre Firewall SOCKS5-Verbindungen zulässt",
        connecting: "Verbinde..."
    },
    uk: {
        status_connected: "Підключено",
        status_not_connected: "Не підключено",
        connect_button: "Підключитися",
        disconnect_button: "Відключитися",
        advanced_settings: "Розширені налаштування",
        webrtc_protection: "Захист від витоків WebRTC",
        connection_error: "Проблема з підключенням",
        error_message_title: "Проблема з підключенням:",
        error_check_internet: "1. Перевірте ваше інтернет-з'єднання",
        error_proxy_unavailable: "2. Проксі-сервер недоступний",
        error_check_firewall: "3. Перевірте, чи дозволяє ваш брандмауер з'єднання SOCKS5",
        connecting: "Підключення..."
    },
    pt: {
        status_connected: "Conectado",
        status_not_connected: "Não Conectado",
        connect_button: "Conectar",
        disconnect_button: "Desconectar",
        advanced_settings: "Configurações Avançadas",
        webrtc_protection: "Proteção contra Vazamento WebRTC",
        connection_error: "Problema de Conexão",
        error_message_title: "Problema de Conexão:",
        error_check_internet: "1. Verifique sua conexão com a internet",
        error_proxy_unavailable: "2. O servidor proxy parece estar indisponível",
        error_check_firewall: "3. Verifique se seu firewall permite conexões SOCKS5",
        connecting: "Conectando..."
    },
    it: {
        status_connected: "Connesso",
        status_not_connected: "Non Connesso",
        connect_button: "Connetti",
        disconnect_button: "Disconnetti",
        advanced_settings: "Impostazioni Avanzate",
        webrtc_protection: "Protezione dalle Perdite WebRTC",
        connection_error: "Problema di Connessione",
        error_message_title: "Problema di Connessione:",
        error_check_internet: "1. Controlla la tua connessione internet",
        error_proxy_unavailable: "2. Il server proxy sembra non essere disponibile",
        error_check_firewall: "3. Verifica se il firewall consente connessioni SOCKS5",
        connecting: "Connessione in corso..."
    },
    fr: {
        status_connected: "Connecté",
        status_not_connected: "Non Connecté",
        connect_button: "Connecter",
        disconnect_button: "Déconnecter",
        advanced_settings: "Paramètres Avancés",
        webrtc_protection: "Protection contre les Fuites WebRTC",
        connection_error: "Problème de Connexion",
        error_message_title: "Problème de Connexion:",
        error_check_internet: "1. Vérifiez votre connexion internet",
        error_proxy_unavailable: "2. Le serveur proxy semble être indisponible",
        error_check_firewall: "3. Vérifiez si votre pare-feu autorise les connexions SOCKS5",
        connecting: "Connexion en cours..."
    },
    nl: {
        status_connected: "Verbonden",
        status_not_connected: "Niet Verbonden",
        connect_button: "Verbinden",
        disconnect_button: "Verbreken",
        advanced_settings: "Geavanceerde Instellingen",
        webrtc_protection: "WebRTC Lekbescherming",
        connection_error: "Verbindingsprobleem",
        error_message_title: "Verbindingsprobleem:",
        error_check_internet: "1. Controleer uw internetverbinding",
        error_proxy_unavailable: "2. Proxyserver lijkt niet beschikbaar te zijn",
        error_check_firewall: "3. Controleer of uw firewall SOCKS5-verbindingen toestaat",
        connecting: "Verbinden..."
    },
    sv: {
        status_connected: "Ansluten",
        status_not_connected: "Inte Ansluten",
        connect_button: "Anslut",
        disconnect_button: "Koppla från",
        advanced_settings: "Avancerade Inställningar",
        webrtc_protection: "WebRTC Läckageskydd",
        connection_error: "Anslutningsproblem",
        error_message_title: "Anslutningsproblem:",
        error_check_internet: "1. Kontrollera din internetanslutning",
        error_proxy_unavailable: "2. Proxyservern verkar vara otillgänglig",
        error_check_firewall: "3. Kontrollera om din brandvägg tillåter SOCKS5-anslutningar",
        connecting: "Ansluter..."
    },
    ar: {
        status_connected: "متصل",
        status_not_connected: "غير متصل",
        connect_button: "اتصال",
        disconnect_button: "قطع الاتصال",
        advanced_settings: "إعدادات متقدمة",
        webrtc_protection: "حماية من تسرب WebRTC",
        connection_error: "مشكلة في الاتصال",
        error_message_title: "مشكلة في الاتصال:",
        error_check_internet: "1. تحقق من اتصالك بالإنترنت",
        error_proxy_unavailable: "2. يبدو أن خادم الوكيل غير متاح",
        error_check_firewall: "3. تحقق مما إذا كان جدار الحماية الخاص بك يسمح باتصالات SOCKS5",
        connecting: "جاري الاتصال..."
    },
    ja: {
        status_connected: "接続済み",
        status_not_connected: "未接続",
        connect_button: "接続",
        disconnect_button: "切断",
        advanced_settings: "詳細設定",
        webrtc_protection: "WebRTC漏洩保護",
        connection_error: "接続問題",
        error_message_title: "接続問題:",
        error_check_internet: "1. インターネット接続を確認してください",
        error_proxy_unavailable: "2. プロキシサーバーが利用できないようです",
        error_check_firewall: "3. ファイアウォールがSOCKS5接続を許可しているか確認してください",
        connecting: "接続中..."
    },
    zh: {
        status_connected: "已连接",
        status_not_connected: "未连接",
        connect_button: "连接",
        disconnect_button: "断开",
        advanced_settings: "高级设置",
        webrtc_protection: "WebRTC泄漏保护",
        connection_error: "连接问题",
        error_message_title: "连接问题:",
        error_check_internet: "1. 检查您的互联网连接",
        error_proxy_unavailable: "2. 代理服务器似乎不可用",
        error_check_firewall: "3. 检查您的防火墙是否允许SOCKS5连接",
        connecting: "连接中..."
    }
};

let currentLanguage = 'en';

function setLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        updateUITranslations();
        chrome.storage.local.set({ language: lang });
    }
}

function updateUITranslations() {
    const texts = translations[currentLanguage];

    document.getElementById('advanced-heading').textContent = texts.advanced_settings;
    document.getElementById('webrtc-label').textContent = texts.webrtc_protection;

    const statusText = document.getElementById('status-text');
    const isConnectedValue = Object.values(translations).map(t => t.status_connected).includes(statusText.textContent);
    if (isConnectedValue) {
        statusText.textContent = texts.status_connected;
    } else {
        statusText.textContent = texts.status_not_connected;
    }

    const toggleButton = document.getElementById('toggle-connection');
    const isConnectButton = Object.values(translations).map(t => t.connect_button).includes(toggleButton.textContent);
    if (isConnectButton) {
        toggleButton.textContent = texts.connect_button;
    } else if (toggleButton.textContent !== '...') {
        toggleButton.textContent = texts.disconnect_button;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['language'], (result) => {
        if (result.language && translations[result.language]) {
            currentLanguage = result.language;
        } else {
            const browserLang = navigator.language.split('-')[0];
            if (translations[browserLang]) {
                currentLanguage = browserLang;
            }
        }

        document.getElementById('language-select').value = currentLanguage;

        updateUITranslations();
    });

    document.getElementById('language-select').addEventListener('change', (e) => {
        setLanguage(e.target.value);
    });
}); 