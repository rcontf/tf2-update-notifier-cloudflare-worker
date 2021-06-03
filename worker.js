const STEAM_API_URL = "https://api.steampowered.com/ISteamApps/UpToDateCheck/v1/?appid=440&version=0"

const headers = {
  headers: {
    "Content-Type": "application/json",
  },
}

async function updateVersionInKv(newVersion) {
  await TF2_UPDATE.put("VERSION", newVersion)
}

async function testForUpdate() {
  const constKvVersion = await TF2_UPDATE.get("VERSION")
  const resFromTf2Api = await fetch(url, headers)
  const { response } = await resFromTf2Api.json()

  const isNewUpdate = response.required_version.toString() !== constKvVersion.toString()

  if (isNewUpdate) {
    await updateVersionInKv(response.required_version)

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