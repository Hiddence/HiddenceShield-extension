chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'setProxy') {
    chrome.proxy.settings.set(
      { value: message.config, scope: 'regular' },
      () => {
        sendResponse({ status: 'success' });
      }
    );
    return true; 
  } else if (message.action === 'clearProxy') {
    chrome.proxy.settings.clear({ scope: 'regular' }, () => {
      sendResponse({ status: 'success' });
    });
    return true;
  } else if (message.action === 'toggleWebRTC') {
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
  } else {
    sendResponse({ status: 'error', error: 'Unknown action' });
  }
});
