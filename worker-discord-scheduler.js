const STEAM_API_URL = "https://api.steampowered.com/ISteamApps/UpToDateCheck/v1/?appid=440&version=0"

const headers = {
  headers: {
    "Content-Type": "application/json",
  },
}

async function updateVersionInKv(newVersion) {
  await TF2_UPDATE.put("VERSION", newVersion)
}

async function sendWebhook() {
  const formBody = {
    embeds: [{
      description: "A TF2 update has been released.",
      color: 15105570,
      timestamp: new Date(),
      footer: {
        text: "TF2 Update Worker"
      }
    }]
  }

  // Edit DISCORD_WEBHOOK_1 with whatever your ENV variable is
  await fetch(DISCORD_WEBHOOK_1, {
    body: JSON.stringify(formBody),
    method: "POST",
    headers
  })
}

async function testForUpdate() {
  const constKvVersion = await TF2_UPDATE.get("VERSION")
  const resFromTf2Api = await fetch(STEAM_API_URL, headers)
  const { response } = await resFromTf2Api.json()

  const isNewUpdate = response.required_version.toString() !== constKvVersion.toString()

  if (isNewUpdate) {
    await Promise.all([
      updateVersionInKv(response.required_version), sendWebhook()
    ])

    return true
  }

  return false
}

async function handleRequest() {
  const hasUpdate = await testForUpdate()

  if (!hasUpdate) return new Response(JSON.stringify({ update: false }), headers)

  return new Response(JSON.stringify({ update: true }), headers)
}

addEventListener("fetch", event => event.respondWith(handleRequest()))

addEventListener("scheduled", event => event.waitUntiltestForUpdate())