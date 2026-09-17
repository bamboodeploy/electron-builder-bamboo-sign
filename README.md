# electron-builder-bamboo-sign

Sign your Electron app's Windows installer with [Bamboo Deploy](https://www.bamboodeploy.com) as part of `electron-builder`. No certificate purchase, no USB token, no Windows VM. Removes the SmartScreen "Windows protected your PC" warning your users see on an unsigned download.

```bash
npm install --save-dev github:bamboodeploy/electron-builder-bamboo-sign
```

`package.json` (or `electron-builder.yml`):

```json
{
  "build": {
    "afterAllArtifactBuild": "electron-builder-bamboo-sign",
    "win": { "target": ["nsis"] }
  }
}
```

Set `BAMBOO_API_KEY` in your environment (locally or as a CI secret), then:

```bash
npx electron-builder --win
```

Every `.exe` and `.msi` artifact in `dist/` is uploaded, scanned, signed, and written back in place. The `latest.yml` auto-update manifest is generated before this hook runs, so if you use electron-updater, regenerate the hash: run the hook via the `win.sign` mode below instead.

## Signing the app exe too (electron-updater friendly)

```json
{
  "build": {
    "win": { "sign": "electron-builder-bamboo-sign/sign" }
  }
}
```

In this mode electron-builder calls the hook for `MyApp.exe` and then for the NSIS installer, so both are signed and the `latest.yml` hashes match. Use one mode or the other, not both.

## Environment

| Variable | Meaning |
|---|---|
| `BAMBOO_API_KEY` | `bd_live_...` key from the dashboard, API Keys page. Or put `BAMBOO_API_KEY=...` in a `.bamboorc` file in the project or home folder |
| `BAMBOO_TIMEOUT` | Seconds to wait for signing (default 900) |
| `BAMBOO_SKIP` | Set to `1` to build without signing (local dev) |

After your first reviewed build, ask Bamboo to enable **Auto-sign** on your account so builds with a clean scan sign in a couple of minutes instead of waiting for manual review. Signing needs a Premium subscription ($45 per quarter); scanning is free.

## Why this instead of a cert

An OV cert costs $200 to $400 a year and still needs weeks of downloads to earn SmartScreen reputation. An EV cert costs more, ships on hardware, and has to live on a machine you build from. Bamboo signs with a certificate that already has reputation and runs a multi-engine malware scan on every build first. Read more: [Electron apps and Windows Defender](https://www.bamboodeploy.com/blog/electron-apps-windows-defender/).

## License

MIT
