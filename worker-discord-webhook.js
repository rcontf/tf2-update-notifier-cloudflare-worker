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

  if (response.required_version.toString() === tf2KvVersion.toString()) {
    return new Response(JSON.stringify(resJson), init)
  } else {
    await updateVersionInKv(response.required_version)
    //send patch, post request to servers here...

    //send webhook with content only if there was an update
    await sendWebhook({ content: "there was tf2 update" });
    return new Response(JSON.stringify({ ...resJson, updated: true }), init)
  }
}

async function updateVersionInKv(newVersion) {
  await TF2_UPDATE.put("VERSION", newVersion)
}

async function sendWebhook(data) {
  await fetch(WEBHOOK_URL, {
    body: JSON.stringify(data),
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    }
  })
}

addEventListener("fetch", event => {
  return event.respondWith(handleRequest())
})