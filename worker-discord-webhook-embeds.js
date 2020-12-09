const url = "https://api.steampowered.com/ISteamApps/UpToDateCheck/v1/?appid=440&version=0"
const WEBHOOK_URL = "YOUR WEBHOOK LINK HERE"

async function handleRequest() {
  const init = {
    headers: {
      "Content-Type": "application/json",
    },
  }

  const constKvVersion = await TF2_UPDATE.get("VERSION")

  const resFromTf2Api = await fetch(url, init)
  const { response } = await resFromTf2Api.json()

  const resJson = {
    versionTested: constKvVersion
  }

  if (response.required_version.toString() === constKvVersion.toString()) {
    return new Response(JSON.stringify(resJson), init)
  } else {
    await updateVersionInKv(response.required_version)
    //send patch, post request to servers here...

    //send webhook with content only if there was an update
    await sendWebhookWithEmbed();
    return new Response(JSON.stringify({ ...resJson, updated: true }), init)
  }
}

async function updateVersionInKv(newVersion) {
  await TF2_UPDATE.put("VERSION", newVersion)
}

async function sendWebhookWithEmbed() {
  const formBody = {
    embeds: [{
      description: "A TF2 update has been released.",
      color: 15105570,
      timestamp: Date.now().toString(),
      footer: {
        text: "TF2 Update Worker"
      }
    }]
  }

  await fetch(WEBHOOK_URL, {
    body: JSON.stringify(formBody),
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  })
}

addEventListener("fetch", event => {
  return event.respondWith(handleRequest())
})