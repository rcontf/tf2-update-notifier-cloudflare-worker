const url = "https://api.steampowered.com/ISteamApps/UpToDateCheck/v1/?appid=440&version=0"

async function handleRequest() {
  const init = {
    headers: {
      "Content-Type": "application/json",
    },
  }

  const constKvVersion= await TF2_UPDATE.get("VERSION")

  const resFromTf2Api = await fetch(url, init)
  const { response } = await resFromTf2Api.json()

  const resJson = {
    versionTested: constKvVersion
  }

  if (response.required_version === tf2KvVersion) {
    return new Response(JSON.stringify(resJson), init)
  } else {
    await updateVersionInKv(response.required_version)
    //send patch, post request to servers here...

    return new Response(JSON.stringify({ ...resJson, updated: true }), init)
  }
}

async function updateVersionInKv(newVersion) {
  await TF2_UPDATE.put("VERSION", newVersion)
}

addEventListener("fetch", event => {
  return event.respondWith(handleRequest())
})