# Home-screen installation

BenchScout provides a web app manifest, 192/512px PNG icons, a maskable icon and an Apple touch icon. Installed launches start at `/home` in standalone mode. The existing mobile viewport scale and user pinch zoom remain available.

For permanent installation, deploy to a stable public HTTPS URL. The local HTTP Wi-Fi address is temporary: it depends on the Mac running and the same network, and Android may offer only a browser shortcut.

- iPhone Safari: open Home, use Share → Add to Home Screen, enable Open as Web App, then Add.
- Android Chrome: open Home, use the menu → Install and create shortcut → Install. Older versions may call the menu item Add to Home screen.

The installed app still needs network access. No offline data caching or web push subscription is added by installation metadata. Users may need to sign in when first opening the installed app.

Icons are generated from `app/icon.svg` using `node scripts/generate-app-icons.cjs`.

Validated locally: manifest response and HTML manifest/Apple/theme tags, icon appearance, ESLint and TypeScript. Physical installed iPhone/Android launch is still to be checked on the production HTTPS origin.
