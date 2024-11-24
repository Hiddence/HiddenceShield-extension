chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'setProxy') {
    chrome.proxy.settings.set(
      { value: message.config, scope: 'regular' },
      () => {
        sendResponse({ status: 'success' });
      }
    );
  } else if (message.action === 'clearProxy') {
    chrome.proxy.settings.clear({ scope: 'regular' }, () => {
      sendResponse({ status: 'success' });
    });
  } else {
    sendResponse({ status: 'error', error: 'Unknown action' });
  }

  return true;
});