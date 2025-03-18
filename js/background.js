const PROXY_HOST = 'proxy.hiddence.net';
const PROXY_PORT = 449;
const PROXY_SCHEME = 'socks';

const servers = {
    auto: { 
        host: PROXY_HOST, 
        port: PROXY_PORT,
        scheme: PROXY_SCHEME,
        ping: null
    }
};

let currentServer = 'auto';
let connectionMonitorInterval = null;
let lastSuccessfulPing = 0;
const CONNECTION_TIMEOUT = 30000;

async function measurePing() {
    try {
        const startTime = performance.now();
        
        const timestamp = Date.now();
        const urls = [
            `https://www.cloudflare.com/cdn-cgi/trace?nocache=${timestamp}`
        ];
        
        const randomUrl = urls[Math.floor(Math.random() * urls.length)];
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        try {
            const response = await fetch(randomUrl, {
                method: 'GET',
                cache: 'no-store',
                mode: 'cors',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const endTime = performance.now();
            const pingTime = Math.round(endTime - startTime);

            lastSuccessfulPing = Date.now();
            
            return {
                success: true,
                ping: pingTime
            };
        } catch (fetchError) {
            clearTimeout(timeoutId);
            throw fetchError;
        }
    } catch (error) {
        console.warn(`Failed to measure ping:`, error);
        return {
            success: false,
            error: error.message
        };
    }
}

function getServerConfig() {
    return {
        host: PROXY_HOST,
        port: PROXY_PORT,
        type: PROXY_SCHEME,
        proxyDNS: true
    };
}

let isProxyActive = false;

function handleProxyRequest(requestInfo) {
    if (!isProxyActive) {
        return { type: "direct" };
    }
    
    return getServerConfig();
}

function ensureProxyConnection() {
    if (!isProxyActive) return;
    
    if (lastSuccessfulPing > 0 && (Date.now() - lastSuccessfulPing) > CONNECTION_TIMEOUT) {
        console.log("Connection appears to be lost. Reconnecting...");
        
        try {
            browser.proxy.onRequest.removeListener(handleProxyRequest);
        } catch (e) {
            console.warn("Error removing proxy listener:", e);
        }

        try {
            browser.proxy.onRequest.addListener(handleProxyRequest, { urls: ["<all_urls>"] });
            isProxyActive = true;
        } catch (e) {
            console.error("Failed to reconnect proxy:", e);
            isProxyActive = false;
            
            browser.runtime.sendMessage({
                action: 'connectionStatus',
                status: 'error',
                error: 'Connection lost'
            }).catch(() => { });

            browser.storage.local.set({ vpnConnected: false });

            stopConnectionMonitor();
        }
    }

    measurePing().catch(error => {
        console.warn("Ping measurement failed during connection check:", error);
    });
}

function startConnectionMonitor() {
    stopConnectionMonitor();

    lastSuccessfulPing = Date.now();

    connectionMonitorInterval = setInterval(ensureProxyConnection, 10000);
}

function stopConnectionMonitor() {
    if (connectionMonitorInterval) {
        clearInterval(connectionMonitorInterval);
        connectionMonitorInterval = null;
    }
}

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'setProxy') {
        currentServer = message.server || 'auto';

        try {
            browser.proxy.onRequest.removeListener(handleProxyRequest);
        } catch (e) {
            console.warn("Error removing existing proxy listener:", e);
        }

        browser.proxy.onRequest.addListener(handleProxyRequest, { urls: ["<all_urls>"] });
        isProxyActive = true;

        startConnectionMonitor();
        
        setTimeout(async () => {
            try {
                const result = await measurePing();
                
                if (!result.success) {
                    sendResponse({
                        status: 'error',
                        error: result.error || 'Failed to connect to proxy'
                    });
                    browser.proxy.onRequest.removeListener(handleProxyRequest);
                    isProxyActive = false;
                    stopConnectionMonitor();
                } else {
                    servers[currentServer].ping = result.ping;
                    sendResponse({
                        status: 'success',
                        server: servers[currentServer]
                    });
                }
            } catch (e) {
                sendResponse({
                    status: 'error',
                    error: e.message || 'Connection failed'
                });
                browser.proxy.onRequest.removeListener(handleProxyRequest);
                isProxyActive = false;
                stopConnectionMonitor();
            }
        }, 500);
        
        return true;
    } 
    
    else if (message.action === 'clearProxy') {
        browser.proxy.onRequest.removeListener(handleProxyRequest);
        isProxyActive = false;
        stopConnectionMonitor();
        sendResponse({ status: 'success' });
        return true;
    } 
    
    else if (message.action === 'getPing') {
        measurePing().then(result => {
            if (result.success) {
                sendResponse({ 
                    status: 'success', 
                    ping: result.ping,
                    timestamp: Date.now()
                });
            } else {
                sendResponse({ 
                    status: 'error', 
                    error: result.error,
                    timestamp: Date.now()
                });
            }
        }).catch(error => {
            sendResponse({ 
                status: 'error', 
                error: error.message,
                timestamp: Date.now()
            });
        });
        
        return true;
    }

    else if (message.action === 'toggleWebRTC') {
        if (browser.privacy && browser.privacy.network && browser.privacy.network.webRTCIPHandlingPolicy) {
            if (message.disableLeak) {
                browser.privacy.network.webRTCIPHandlingPolicy.set(
                    { value: 'disable_non_proxied_udp' },
                    () => {
                        sendResponse({ status: 'success', policy: 'disable_non_proxied_udp' });
                    }
                );
            } else {
                browser.privacy.network.webRTCIPHandlingPolicy.clear({}, () => {
                    sendResponse({ status: 'success', policy: 'default' });
                });
            }
        } else {
            sendResponse({ status: 'error', error: 'No privacy API support' });
        }
        return true;
    }

    else if (message.action === 'getServerInfo') {
        const serverKey = message.server || currentServer;
        
        if (message.measurePing) {
            measurePing().then(result => {
                if (result.success) {
                    servers[serverKey].ping = result.ping;
                }
                
                sendResponse({ 
                    status: 'success', 
                    server: servers[serverKey] || servers.auto 
                });
            }).catch(() => {
                sendResponse({ 
                    status: 'success', 
                    server: servers[serverKey] || servers.auto 
                });
            });
        } else {
            sendResponse({ 
                status: 'success', 
                server: servers[serverKey] || servers.auto 
            });
        }
        
        return true;
    } 
    
    else {
        sendResponse({ status: 'error', error: 'Unknown action' });
    }
});

browser.storage.local.get(['vpnConnected', 'webrtcEnabled'], (result) => {
    if (result.vpnConnected) {
        try {
            browser.proxy.onRequest.removeListener(handleProxyRequest);
        } catch (e) {
            console.warn("Error removing existing proxy listener:", e);
        }
        
        browser.proxy.onRequest.addListener(handleProxyRequest, { urls: ["<all_urls>"] });
        isProxyActive = true;

        startConnectionMonitor();
        
        if (result.webrtcEnabled && browser.privacy?.network?.webRTCIPHandlingPolicy) {
            browser.privacy.network.webRTCIPHandlingPolicy.set({ value: 'disable_non_proxied_udp' });
        }
    }
});