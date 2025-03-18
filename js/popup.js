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
        
        browser.runtime.sendMessage({ 
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
                serverPing.textContent = '--';
                serverPing.style.color = '#F44336';
                serverPing.classList.remove('ping-good', 'ping-medium');
                serverPing.classList.add('ping-bad');
                
                if (response && response.status === 'error') {
                    setConnectionErrorUI(response.error);
                    browser.storage.local.set({ vpnConnected: false });
                    updateWebRTCPolicy();
                }
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

        return true;
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
        browser.runtime.sendMessage({
            action: 'toggleWebRTC',
            disableLeak: disable
        }, (response) => {
            if (!response || response.status !== 'success') { }
        });
    }

    function updateWebRTCPolicy() {
        browser.storage.local.get(['vpnConnected', 'webrtcEnabled'], (result) => {
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

    browser.storage.local.get(['vpnConnected', 'webrtcEnabled'], (result) => {
        const isConnected = !!result.vpnConnected;
        
        updateUI(isConnected);
        
        if (isConnected) {
            browser.runtime.sendMessage({
                action: 'getServerInfo',
                server: null,
                measurePing: true
            }, (response) => {
                if (response && response.status === 'success' && response.server) {
                    updateUI(true, response.server);
                } else {
                    updateUI(false);
                    browser.storage.local.set({ vpnConnected: false });
                }
            });
        }
        
        if (typeof result.webrtcEnabled === 'boolean') {
            webrtcSwitch.checked = result.webrtcEnabled;
        } else {
            webrtcSwitch.checked = true;
            browser.storage.local.set({ webrtcEnabled: true });
        }
    });

    toggleButton.addEventListener('click', () => {
        if (document.body.classList.contains('connected')) {
            browser.runtime.sendMessage({
                action: 'clearProxy'
            }, (response) => {
                if (response && response.status === 'success') {
                    browser.storage.local.set({ vpnConnected: false });
                    updateUI(false);
                    updateWebRTCPolicy();
                }
            });
        } else {
            setConnectingUI();

            browser.runtime.sendMessage({
                action: 'setProxy',
                server: null
            }, (response) => {
                if (response && response.status === 'success') {
                    browser.storage.local.set({ vpnConnected: true });
                    updateUI(true, response.server);
                    updateWebRTCPolicy();
                } else {
                    browser.storage.local.set({ vpnConnected: false });
                    setConnectionErrorUI(response?.error || 'Unknown error');
                    updateWebRTCPolicy();
                }
            });
        }
    });

    webrtcSwitch.addEventListener('change', () => {
        const isChecked = webrtcSwitch.checked;
        browser.storage.local.set({ webrtcEnabled: isChecked });
        updateWebRTCPolicy();
    });

    const languageSelect = document.getElementById('language-select');
    
    browser.storage.local.get(['language'], (data) => {
        if (data.language) {
            currentLanguage = data.language;
            languageSelect.value = currentLanguage;
        } else {
            currentLanguage = navigator.language.split('-')[0];
            
            if (!translations[currentLanguage]) {
                currentLanguage = 'en';
            }
            
            languageSelect.value = currentLanguage;
            browser.storage.local.set({ language: currentLanguage });
        }
        
        updateTranslations();
    });
    
    function updateTranslations() {
        document.getElementById('status-text').textContent = document.body.classList.contains('connected')
            ? translations[currentLanguage].status_connected
            : translations[currentLanguage].status_not_connected;
            
        document.getElementById('toggle-connection').textContent = document.body.classList.contains('connected')
            ? translations[currentLanguage].disconnect_button
            : translations[currentLanguage].connect_button;
            
        document.getElementById('advanced-heading').textContent = translations[currentLanguage].advanced_settings;
        document.getElementById('webrtc-label').textContent = translations[currentLanguage].webrtc_protection;
    }
    
    languageSelect.addEventListener('change', (e) => {
        currentLanguage = e.target.value;
        browser.storage.local.set({ language: currentLanguage });
        updateTranslations();
    });
});