# PS5 WebKit Server Add-on

Serve PS5 WebKit Autoloader exploit files locally from your Home Assistant instance.

## Setup

1. Add this repository to Home Assistant add-ons
2. Install the PS5 WebKit Server add-on
3. Configure AdGuard (or your DNS server) to redirect `manuals.playstation.net` to your Home Assistant IP (192.168.1.3)
4. On your PS5, set DNS to your Home Assistant IP
5. Open the User's Guide on PS5 to run the installer

## Configuration

No configuration required. The add-on serves files on port 80.

## Usage

Once installed and running:
- Point PS5 DNS to Home Assistant IP
- Open User's Guide on PS5
- Exploit will be served from your local Home Assistant instance

## How it works

- Listens on HTTP port 80
- Serves exploit files from `/frontend/autoloader/`
- Works with AdGuard DNS rewrites to intercept `manuals.playstation.net`
