const url = "https://api.steampowered.com/ISteamApps/UpToDateCheck/v1/?appid=440&version=0"

const init = {
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
    headers: {
      "Content-Type": "application/json"
    }
  })
}

async function testForUpdate() {
  const constKvVersion = await TF2_UPDATE.get("VERSION")
  const resFromTf2Api = await fetch(url, init)
  const { response } = await resFromTf2Api.json()

  const newUpdate = response.required_version.toString() === constKvVersion.toString()

  if (!newUpdate) {
    await Promise.all([
      updateVersionInKv(response.required_version), sendWebhook()
    ])

    return true
  }

  return false
}

async function handleRequest() {
  const update = await testForUpdate()

  if (!update) return new Response(JSON.stringify({ updated: false }), init)

  return new Response(JSON.stringify({ updated: true }), init)
}

addEventListener("fetch", event => {
  return event.respondWith(handleRequest())
})

addEventListener("scheduled", event => {
  event.waitUntil(
    testForUpdate()
  )
})