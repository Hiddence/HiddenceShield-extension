const PROXY_HOST = 'proxy.example.com';
const PROXY_PORT = 1080;
const PROXY_SCHEME = 'socks5';

const servers = {
    auto: { 
        host: PROXY_HOST, 
        port: PROXY_PORT,
        scheme: PROXY_SCHEME,
        ping: null
    }
};

let currentServer = 'auto';

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
            
            const endTime = performance.now();
            const pingTime = Math.round(endTime - startTime);
            
            return pingTime;
        } catch (fetchError) {
            clearTimeout(timeoutId);
            throw fetchError;
        }
    } catch (error) {
        console.warn(`Failed to measure ping:`, error);
        return 120;
    }
}

function getServerConfig() {
    return {
        mode: 'fixed_servers',
        rules: {
            singleProxy: {
                scheme: PROXY_SCHEME,
                host: PROXY_HOST,
                port: PROXY_PORT
            },
            bypassList: ['localhost', '127.0.0.1']
        }
    };
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'setProxy') {
        currentServer = message.server || 'auto';
        const proxyCfg = getServerConfig();
        
        chrome.proxy.settings.set({ value: proxyCfg, scope: 'regular' }, () => {
            if (chrome.runtime.lastError) {
                sendResponse({
                    status: 'error',
                    error: chrome.runtime.lastError.message
                });
            } else {
                sendResponse({
                    status: 'success',
                    server: servers[currentServer]
                });

                setTimeout(async () => {
                    try {
                        const pingTest = await measurePing();
                        if (pingTest) {
                            servers[currentServer].ping = pingTest;
                        }
                    } catch (e) { }
                }, 1000);
            }
        });
        
        return true;
    } 
    
    else if (message.action === 'clearProxy') {
        chrome.proxy.settings.clear({ scope: 'regular' }, () => {
            sendResponse({ status: 'success' });
        });
        return true;
    } 
    
    else if (message.action === 'getPing') {
        measurePing().then(pingTime => {
            sendResponse({ 
                status: 'success', 
                ping: pingTime || 120,
                timestamp: Date.now()
            });
        }).catch(error => {
            sendResponse({ 
                status: 'error', 
                ping: 120,
                error: error.message,
                timestamp: Date.now()
            });
        });
        
        return true;
    }

    else if (message.action === 'toggleWebRTC') {
        if (chrome.privacy && chrome.privacy.network && chrome.privacy.network.webRTCIPHandlingPolicy) {
            if (message.disableLeak) {
                chrome.privacy.network.webRTCIPHandlingPolicy.set(
                    { value: 'disable_non_proxied_udp' },
                    () => {
                        sendResponse({ status: 'success', policy: 'disable_non_proxied_udp' });
                    }
                );
            } else {
                chrome.privacy.network.webRTCIPHandlingPolicy.clear({}, () => {
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
            measurePing().then(pingTime => {
                if (pingTime) {
                    servers[serverKey].ping = pingTime;
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

chrome.storage.local.get(['vpnConnected', 'webrtcEnabled'], (result) => {
    if (result.vpnConnected) {
        const proxyCfg = getServerConfig();
        
        chrome.proxy.settings.set({ value: proxyCfg, scope: 'regular' }, () => {
            if (chrome.runtime.lastError) {
                chrome.storage.local.set({ vpnConnected: false });
            } else {
                if (result.webrtcEnabled && chrome.privacy?.network?.webRTCIPHandlingPolicy) {
                    chrome.privacy.network.webRTCIPHandlingPolicy.set({ value: 'disable_non_proxied_udp' });
                }
            }
        });
    }
});