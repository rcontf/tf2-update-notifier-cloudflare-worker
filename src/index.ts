import { env } from "cloudflare:workers";

const STEAM_API_URL = "https://api.steampowered.com/ISteamApps/UpToDateCheck/v1/?appid=440&version=0"

const headers = new Headers();
headers.append("Content-Type", "application/json");

const discordWebhookUrl = process.env.DISCORD_WEBHOOK_1;

export default {
	async fetch(_, _1, _2): Promise<Response> {
		const hasupdate = await testForUpdate()

		if (!hasupdate) return new Response(JSON.stringify({ update: false }), { headers })

		return new Response(JSON.stringify({ update: true }), { headers })
	},
	async scheduled(_, _1, _2) {
		await testForUpdate();
	}
} satisfies ExportedHandler<Env>;

async function updateVersionInKv(newVersion: string) {
	await env.TF2_UPDATE.put("VERSION", newVersion)
}

async function sendWebhook() {
	if (discordWebhookUrl == null) {
		return;
	}

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
	await fetch(discordWebhookUrl, {
		body: JSON.stringify(formBody),
		method: "POST",
		headers,
	})
}

async function testForUpdate() {
	const constKvVersion = await env.TF2_UPDATE.get("VERSION")
	const resFromTf2Api = await fetch(STEAM_API_URL, { headers })

	// If no response from steam, treat this as no new updates
	if (!resFromTf2Api.ok) {
		return false;
	}

	const { response } = (await resFromTf2Api.json()) as any

	const isNewUpdate = response.required_version.toString() !== constKvVersion?.toString()

	if (isNewUpdate) {
		await Promise.all([
			updateVersionInKv(response.required_version), sendWebhook()
		])

		return true
	}

	return false
}
