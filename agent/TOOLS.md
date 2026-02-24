# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

## ngrok

### OpenClaw Gateway Tunnel

**正確指令：**
```bash
ngrok http 18789
```

**用途：** 為 LINE Bot Webhook 提供公開 HTTPS URL
**Port 18789** 是 OpenClaw Gateway 的預設端口

**注意：** 啟動後會顯示類似 `https://xxxx.ngrok.io` 的網址，在 LINE Developers Console 設定 Webhook URL 為：
```
https://xxxx.ngrok.io/line/webhook
```
