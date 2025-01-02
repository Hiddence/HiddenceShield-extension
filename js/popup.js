document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggle-connection');
    const statusText = document.getElementById('status-text');
    const webrtcSwitch = document.getElementById('webrtc-switch');

    function updateUI(isConnected) {
        if (isConnected) {
            document.body.classList.add('connected');
            statusText.textContent = 'Connected';
            toggleButton.textContent = 'Disconnect';
        } else {
            document.body.classList.remove('connected');
            statusText.textContent = 'Not Connected';
            toggleButton.textContent = 'Connect';
        }
    }

    function setWebRTCPolicy(disable) {
        chrome.runtime.sendMessage({
            action: 'toggleWebRTC',
            disableLeak: disable
        }, (response) => {
            if (!response || response.status !== 'success') {
                console.error('Failed to set WebRTC policy:', response ? response.error : 'Unknown error');
            } else {
                console.log('WebRTC policy set to:', response.policy);
            }
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

    chrome.storage.local.get(['vpnConnected', 'webrtcEnabled'], (result) => {
        const isConnected = !!result.vpnConnected;
        updateUI(isConnected);

        let webrtcEnabled = (typeof result.webrtcEnabled === 'boolean')
            ? result.webrtcEnabled
            : true;

        webrtcSwitch.checked = webrtcEnabled;

        chrome.storage.local.set({ webrtcEnabled }, () => {
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
                const config = {
                    mode: 'fixed_servers',
                    rules: {
                        singleProxy: {
                            scheme: 'socks5',
                            host: 'proxy.example.net',
                            port: 1080
                        },
                        bypassList: ['localhost']
                    }
                };

                chrome.runtime.sendMessage({ action: 'setProxy', config }, (response) => {
                    if (response && response.status === 'success') {
                        chrome.storage.local.set({ vpnConnected: true }, () => {
                            updateUI(true);
                            updateWebRTCPolicy();
                        });
                    } else {
                        console.error('Failed to connect:', response ? response.error : 'No response');
                    }
                });
            } else {
                chrome.runtime.sendMessage({ action: 'clearProxy' }, (response) => {
                    if (response && response.status === 'success') {
                        chrome.storage.local.set({ vpnConnected: false }, () => {
                            updateUI(false);
                            updateWebRTCPolicy();
                        });
                    } else {
                        console.error('Failed to disconnect:', response ? response.error : 'No response');
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
