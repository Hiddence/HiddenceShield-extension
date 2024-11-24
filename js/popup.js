document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('toggle-connection');
    const statusText = document.getElementById('status-text');

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

    chrome.storage.local.get(['vpnConnected'], (result) => {
        const isConnected = result.vpnConnected || false;
        updateUI(isConnected);
    });

    toggleButton.addEventListener('click', () => {
        chrome.storage.local.get(['vpnConnected'], (result) => {
            const isConnected = result.vpnConnected || false;

            if (!isConnected) {
                const config = {
                    mode: 'fixed_servers',
                    rules: {
                        singleProxy: {
                            scheme: 'https',
                            host: 'proxy.example.com',
                            port: 443
                        },
                        bypassList: ['localhost']
                    }
                };

                chrome.runtime.sendMessage({ action: 'setProxy', config: config }, (response) => {
                    if (response && response.status === 'success') {
                        chrome.storage.local.set({ vpnConnected: true }, () => {
                            updateUI(true);
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
                        });
                    } else {
                        console.error('Failed to disconnect:', response ? response.error : 'No response');
                    }
                });
            }
        });
    });
});