function ensureCorrectProxy() {
    chrome.proxy.settings.get({}, (settings) => {
        if (settings && settings.value && 
            settings.value.mode === 'fixed_servers' && 
            settings.value.rules && 
            settings.value.rules.singleProxy) {
            
            const proxy = settings.value.rules.singleProxy;
        }
    });
}

ensureCorrectProxy();

document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggle-connection');
    const statusText = document.getElementById('status-text');
    const webrtcSwitch = document.getElementById('webrtc-switch');
    const serverPing = document.getElementById('server-ping');

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            stopPingRefresh();
        } else {
            if (document.body.classList.contains('connected')) {
                startPingRefresh();
            }
        }
    });
    
    window.addEventListener('unload', () => {
        stopPingRefresh();
    });

    function updateRealPing() {
        if (document.hidden || !document.body.classList.contains('connected')) {
            return;
        }
        
        chrome.runtime.sendMessage({ 
            action: 'getPing',
            _nocache: Date.now()
        }, function(response) {
            if (document.hidden) {
                return;
            }
            
            if (response && response.status === 'success' && response.ping) {
                const pingValue = response.ping;
                serverPing.textContent = pingValue + 'ms';
                
                serverPing.classList.remove('ping-good', 'ping-medium', 'ping-bad');

                if (pingValue < 100) {
                    serverPing.style.color = '#42a5f5';
                    serverPing.classList.add('ping-good');
                } else if (pingValue < 200) {
                    serverPing.style.color = '#FFC107';
                    serverPing.classList.add('ping-medium');
                } else {
                    serverPing.style.color = '#F44336';
                    serverPing.classList.add('ping-bad');
                }
            } else {
                serverPing.textContent = '120ms';
                serverPing.style.color = '#FFC107';
                serverPing.classList.remove('ping-good', 'ping-bad');
                serverPing.classList.add('ping-medium');
            }
        });
    }

    function showErrorBlock() {
        if (document.getElementById('proxy-error-message')) {
            document.getElementById('proxy-error-message').remove();
        }

        const errorMsg = document.createElement('div');
        errorMsg.id = 'proxy-error-message';
        errorMsg.style.backgroundColor = 'rgba(244, 67, 54, 0.1)';
        errorMsg.style.color = '#F44336';
        errorMsg.style.padding = '15px';
        errorMsg.style.borderRadius = '8px';
        errorMsg.style.marginTop = '15px';
        errorMsg.style.fontSize = '13px';
        errorMsg.style.lineHeight = '1.5';
        errorMsg.innerHTML = `
            <strong>${translations[currentLanguage].error_message_title}</strong><br>
            ${translations[currentLanguage].error_check_internet}<br>
            ${translations[currentLanguage].error_proxy_unavailable}<br>
            ${translations[currentLanguage].error_check_firewall}
        `;

        const controlsDiv = document.querySelector('.controls');
        controlsDiv.parentNode.insertBefore(errorMsg, controlsDiv.nextSibling);
    }

    async function verifyProxyConnection() {
        if (!document.body.classList.contains('connected') && 
            !document.body.classList.contains('connecting')) {
            return false;
        }

        try {
            const proxySettings = await new Promise((resolve) => {
                chrome.proxy.settings.get({}, (settings) => {
                    resolve(settings);
                });
            });

            if (proxySettings && proxySettings.value && 
                proxySettings.value.mode === 'fixed_servers' && 
                proxySettings.value.rules && 
                proxySettings.value.rules.singleProxy) {

                return true;
            }
        } catch (error) { }
        
        return false;
    }

    function updateUI(isConnected, serverInfo = null) {
        if (isConnected) {
            document.body.classList.remove('connecting');
            document.body.classList.add('connected');
            statusText.textContent = translations[currentLanguage].status_connected;
            statusText.style.color = '#42a5f5';
            toggleButton.textContent = translations[currentLanguage].disconnect_button;
            toggleButton.disabled = false;
            
            if (serverInfo && serverInfo.ping) {
                serverPing.textContent = `${serverInfo.ping}ms`;

                serverPing.classList.remove('ping-good', 'ping-medium', 'ping-bad');
                
                if (serverInfo.ping < 100) {
                    serverPing.style.color = '#42a5f5';
                    serverPing.classList.add('ping-good');
                } else if (serverInfo.ping < 200) {
                    serverPing.style.color = '#FFC107';
                    serverPing.classList.add('ping-medium');
                } else {
                    serverPing.style.color = '#F44336';
                    serverPing.classList.add('ping-bad');
                }
            } else {
                if (!document.hidden) {
                    updateRealPing();
                }
            }
            
            startPingRefresh();
            
            if (document.getElementById('proxy-error-message')) {
                document.getElementById('proxy-error-message').remove();
            }
        } else {
            document.body.classList.remove('connecting');
            document.body.classList.remove('connected');
            statusText.textContent = translations[currentLanguage].status_not_connected;
            statusText.style.color = '';
            toggleButton.textContent = translations[currentLanguage].connect_button;
            serverPing.textContent = '--';
            serverPing.style.color = '';
            
            serverPing.classList.remove('ping-good', 'ping-medium', 'ping-bad');
            
            if (document.getElementById('proxy-error-message')) {
                document.getElementById('proxy-error-message').remove();
            }
            
            stopPingRefresh();
        }
    }

    function setConnectingUI() {
        toggleButton.textContent = '...';
        toggleButton.disabled = true;
        statusText.textContent = translations[currentLanguage].connecting;
        statusText.style.color = '#FFC107';
        serverPing.textContent = '--';

        serverPing.classList.remove('ping-good', 'ping-medium', 'ping-bad');

        document.body.classList.remove('connected');
        document.body.classList.add('connecting');

        if (document.getElementById('proxy-error-message')) {
            document.getElementById('proxy-error-message').remove();
        }
    }

    function setConnectionErrorUI(errorMsg) {
        toggleButton.disabled = false;
        toggleButton.textContent = translations[currentLanguage].connect_button;
        statusText.textContent = translations[currentLanguage].connection_error;
        statusText.style.color = '#F44336';

        document.body.classList.remove('connecting');
        document.body.classList.remove('connected');

        showErrorBlock();
    }
    
    let pingRefreshInterval = null;
    
    function startPingRefresh() {
        stopPingRefresh();

        if (!document.hidden) {
            updateRealPing();
            pingRefreshInterval = setInterval(() => {
                if (!document.hidden) {
                    updateRealPing();
                }
            }, 2000);
        }
    }
    
    function stopPingRefresh() {
        if (pingRefreshInterval) {
            clearInterval(pingRefreshInterval);
            pingRefreshInterval = null;
        }
    }

    function setWebRTCPolicy(disable) {
        chrome.runtime.sendMessage({
            action: 'toggleWebRTC',
            disableLeak: disable
        }, (response) => {
            if (!response || response.status !== 'success') { }
        });
    }

    function updateWebRTCPolicy() {
        chrome.storage.local.get(['vpnConnected', 'webrtcEnabled'], (result) => {
            const vpnConnected = !!result.vpnConnected;
            const webrtcEnabled = (typeof result.webrtcEnabled === 'boolean')
                ? result.webrtcEnabled
                : true;

            if (vpnConnected && webrtcEnabled) {
                setWebRTCPolicy(true);
            } else {
                setWebRTCPolicy(false);
            }
        });
    }

    chrome.storage.local.get([
        'vpnConnected', 
        'webrtcEnabled'
    ], (result) => {
        const isConnected = !!result.vpnConnected;

        let webrtcEnabled = (typeof result.webrtcEnabled === 'boolean')
            ? result.webrtcEnabled
            : true;
        webrtcSwitch.checked = webrtcEnabled;

        if (isConnected) {
            chrome.proxy.settings.get({}, (settings) => {
                const proxyConfigured = settings && 
                                       settings.value && 
                                       settings.value.mode === 'fixed_servers';
                
                if (proxyConfigured) {
                    chrome.runtime.sendMessage({
                        action: 'getServerInfo',
                        measurePing: !document.hidden
                    }, (response) => {
                        if (response && response.status === 'success') {
                            updateUI(true, response.server);
                            if (!document.hidden) {
                                setTimeout(updateRealPing, 500);
                            }
                        } else {
                            updateUI(true);
                        }
                    });
                } else {
                    chrome.storage.local.set({ vpnConnected: false }, () => {
                        updateUI(false);
                    });
                }
            });
        } else {
            updateUI(false);
        }

        chrome.storage.local.set({
            webrtcEnabled
        }, () => {
            updateWebRTCPolicy();
        });
    });

    toggleButton.addEventListener('click', () => {
        chrome.storage.local.get(['vpnConnected', 'webrtcEnabled'], (result) => {
            const isConnected = !!result.vpnConnected;
            const webrtcEnabled = (typeof result.webrtcEnabled === 'boolean')
                ? result.webrtcEnabled
                : true;

            if (!isConnected) {
                setConnectingUI();

                chrome.runtime.sendMessage({ 
                    action: 'setProxy',
                    server: 'auto'
                }, (response) => {
                    if (response && response.status === 'success') {
                        chrome.proxy.settings.get({}, (settings) => {
                            const proxyConfigured = settings && 
                                                   settings.value && 
                                                   settings.value.mode === 'fixed_servers';
                            
                            if (proxyConfigured) {
                                chrome.storage.local.set({ 
                                    vpnConnected: true
                                }, () => {
                                    toggleButton.disabled = false;
                                    updateUI(true, response.server);
                                    updateWebRTCPolicy();
                                    if (!document.hidden) {
                                        setTimeout(updateRealPing, 1000);
                                    }
                                });
                            } else {
                                chrome.storage.local.set({ vpnConnected: false });
                                toggleButton.disabled = false;
                                setConnectionErrorUI("Couldn't configure proxy");
                            }
                        });
                    } else {
                        toggleButton.disabled = false;
                        setConnectionErrorUI(response && response.error ? response.error : "Connection failed");
                    }
                });
            } else {
                toggleButton.textContent = '...';
                toggleButton.disabled = true;
                
                chrome.runtime.sendMessage({ action: 'clearProxy' }, (response) => {
                    toggleButton.disabled = false;
                    
                    if (response && response.status === 'success') {
                        chrome.storage.local.set({ vpnConnected: false }, () => {
                            updateUI(false);
                            updateWebRTCPolicy();
                        });
                    } else {
                        toggleButton.textContent = translations[currentLanguage].disconnect_button;
                    }
                });
            }
        });
    });

    webrtcSwitch.addEventListener('change', (event) => {
        const userChoice = event.target.checked;
        chrome.storage.local.set({ webrtcEnabled: userChoice }, () => {
            updateWebRTCPolicy();
        });
    });
});