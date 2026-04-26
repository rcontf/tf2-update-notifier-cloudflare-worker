<div align="center">
  <h1>TF2 Update Notifier</h1>
  <p><em>A notification service that alerts on Discord whether there was a TF2 update, powered by Cloudflare Workers</em></p>
</div>

Sends a Discord webhook when there is a new TF2 update. This stack can be adjusted to notify a build job, to create alerts for users, or to get the latest update news!

# Setup

1. Deploy to Cloudflare. The deploy flow will automatically provision required resources and prompt for additional information.

     [![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/rcontf/tf2-update-notifier-cloudflare-worker)

## Features

- Cron schedule to check every 5 minutes
- API access to check whether a new update is available
- Unit tests to verify the behavior

## Stack

- Cloudflare Workers, Workers KV

## Getting Started

```bash
npm install

npm run dev
```

### Deploy

```bash
npm run deploy
```
