# tf2-update-notifier-cloudflare-worker

Sends a request to Steam's API to be notified if there was a TF2 update.

# Usage

- Create a cloudflare worker application
- Create a KV container
- Inside the KV, you need 1 item:

```
VERSION
```

- Link them to the worker and name them TF2_UPDATE
- Done! `VERSION` will be automatically updated if there was an update.

# Expandability

You can use this worker to call your API to trigger a build of an image or to automatically update a TF2 server through a backend. This only parses the latest update and notifies you of such update. Any API calls outbound should be placed in ENV variables.
