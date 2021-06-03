# tf2-update-notifier-cloudflare-worker

Sends a request to Steam's API to be notified if there was a TF2 update.

# Usage

- Create a Cloudflare Worker application.
- Create a KV container.
- Inside the KV container, you will need to add a `VERSION` key.
- Set `VERSION` key to latest update, or let the script run once.
- Link the KV to the worker and name the KV `TF2_UPDATE`
- Done! `VERSION` will be automatically updated if there was an update.

# Expandability

You can use this worker to call your API to trigger a build of an image or to automatically update a TF2 server through a backend. This only parses the latest update and notifies you of such update. Any API calls outbound should be placed in ENV variables for satefy.
