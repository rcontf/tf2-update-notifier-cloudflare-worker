import { env } from "cloudflare:workers";

const STEAM_API_URL = "https://api.steampowered.com/ISteamApps/UpToDateCheck/v1/?appid=440";

const headers = new Headers();
headers.append("Content-Type", "application/json");

const discordWebhookUrl = env.DISCORD_WEBHOOK_1;

export default {
	async fetch(_, _1, ctx): Promise<Response> {
		const hasupdate = await testForUpdate(ctx)

		if (!hasupdate) return new Response(JSON.stringify({ update: false }), { headers })

		return new Response(JSON.stringify({ update: true }), { headers })
	},
	async scheduled(_, _1, ctx) {
		await testForUpdate(ctx);
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

	await fetch(discordWebhookUrl, {
		body: JSON.stringify(formBody),
		method: "POST",
		headers,
	});
}

async function testForUpdate(ctx: ExecutionContext) {
	const constKvVersion = await env.TF2_UPDATE.get("VERSION") ?? '0';

	const resFromTf2Api = await fetch(`${STEAM_API_URL}&version=${constKvVersion}`, { headers })

	// If no response from steam, treat this as no new updates
	if (!resFromTf2Api.ok) {
		console.error({ message: "Failed to get response from Steam", statusCode: resFromTf2Api.status });
		return false;
	}

	const { response } = (await resFromTf2Api.json()) as any

	const isNewUpdate = response.up_to_date;

	if (!isNewUpdate) {
		ctx.waitUntil(Promise.all([
			updateVersionInKv(response.required_version), sendWebhook()
		]));

		return true
	}

	return false
}
