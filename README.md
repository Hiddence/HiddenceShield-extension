# Hiddence Shield Chrome Extension

**Hiddence Shield** is an open-source Chrome extension that allows users to connect to a proxy server directly from their browser. It provides a simple and intuitive interface to toggle the VPN connection, enhancing privacy and accessibility while browsing the web.

## Features

- **One-Click Connection**: Easily connect or disconnect from the proxy server with a single button.
- **Status Indicator**: Visual feedback on your connection status with animated icons.
- **Lightweight**: Minimal impact on browser performance.
- **Open-Source**: Transparent codebase for community collaboration and improvement.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Security Considerations](#security-considerations)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)
- [Disclaimer](#disclaimer)

## Installation

### Clone or Download the Repository

```bash
git clone https://github.com/Hiddence/HiddenceVPN-extension.git
```

### Open Chrome Extension Management

1. Navigate to `chrome://extensions/` in your Chrome browser.
2. Enable Developer mode by toggling the switch in the upper-right corner.

### Load the Unpacked Extension

1. Click on **Load unpacked**.
2. Select the directory where you cloned or downloaded the repository.

### Verify Installation

- The extension should now appear in your list of installed extensions.
- You can pin it to your toolbar for easy access.

## Usage

1. **Open the Extension**: Click on the Hiddence Shield icon in your Chrome toolbar.
2. **Connect to the Proxy**: Click the Connect button to establish a connection to the proxy server. The status indicator will change to show that you are connected.
3. **Disconnect from the Proxy**: Click the Disconnect button to terminate the connection. The status indicator will revert to show that you are not connected.

## Configuration

Before using the extension, you need to configure it to work with your proxy server:

### Proxy Settings

Open the `js/popup.js` file located in the extension's directory and locate the proxy configuration section:

```javascript
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
```

Replace `'proxy.example.com'` and `443` with your proxy server's hostname and port.

### Manifest Settings

Open the `manifest.json` file located in the extension's directory and locate the proxy configuration section:

```json
"host_permissions": [
  "https://proxy.example.com/*"
]
```

Replace `'https://proxy.example.com/*'` with your proxy server's domain or IP-address.

**Important**: For security reasons, it is recommended not to hardcode your credentials directly in the code, especially if you plan to share or publish your version of the extension. See [Security Considerations](#security-considerations) for more details.

## Security Considerations

### Avoid Hardcoding Credentials

Hardcoding sensitive information like usernames and passwords directly into the code poses significant security risks:

- **Exposure of Credentials**: If the code is shared or published, your credentials can be accessed by anyone.
- **Unauthorized Access**: Malicious users could use your credentials to access the proxy server or other services.

#### Recommended Solutions:

- **Use Environment Variables**: Store your credentials in environment variables and access them securely within the extension.
  - Note: Chrome extensions have limited access to environment variables, so this may require additional configuration.

- **Prompt for Credentials**: Modify the extension to prompt you for your credentials when connecting. Store them securely using `chrome.storage.local` with appropriate encryption.

- **External Configuration File**: Store credentials in a separate, non-tracked configuration file. Ensure this file is listed in `.gitignore` to prevent it from being committed to version control.

### Secure Proxy Certificate

If your proxy server uses a self-signed SSL certificate, you may encounter certificate errors in Chrome. To resolve this:

- **Use a Trusted Certificate Authority (CA) Certificate**: Obtain an SSL certificate from a trusted CA for your proxy server domain. This ensures Chrome will trust the proxy's SSL certificate without additional configuration.

- **Manually Trust the Certificate**: Import the proxy's CA certificate into your system's trusted certificate store. 
  - Note: This approach may not be suitable for all users and can pose security risks if not handled properly.

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please follow these steps:

1. **Fork the Repository**: Click the Fork button at the top right of the repository page.
2. **Create a Feature Branch**:

    ```bash
    git checkout -b feature/your-feature-name
    ```

3. **Commit Your Changes**: Make your changes and commit them with clear and descriptive messages.
4. **Push to Your Fork**:

    ```bash
    git push origin feature/your-feature-name
    ```

5. **Submit a Pull Request**: Open a pull request to the main repository's `develop` branch.

## License

This project is licensed under the MIT License. You are free to use, modify, and distribute this software, but please provide attribution to the original author.

## Acknowledgments

- **Icons and Fonts**: Icons used in this project are sourced from Font Awesome under the Creative Commons Attribution 4.0 International license. Fonts are provided by Google Fonts.

## Inspiration

This project was inspired by the need for a simple and effective way to manage proxy connections directly within the Chrome browser.

## Disclaimer

Usage of this extension is at your own risk. The author is not responsible for any misuse or damage caused by this extension. Ensure you comply with all applicable laws and terms of service when using proxy servers and VPNs.
