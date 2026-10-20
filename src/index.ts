import { env } from "cloudflare:workers";
import { getLatestPatchNotes } from "./notes";

const STEAM_API_URL = "https://api.steampowered.com/ISteamApps/UpToDateCheck/v1/?appid=440";

const headers = new Headers();
headers.append("Content-Type", "application/json");

const discordWebhookUrl = `${env.DISCORD_WEBHOOK_1}?with_components=true`;

export default {
	async fetch(_, _1, ctx): Promise<Response> {
		const hasupdate = await testForUpdate(ctx)

		return new Response(JSON.stringify({ update: hasupdate }), { headers })
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
		console.info("No discord webhook configured");
		return;
	}

	const notes = await getLatestPatchNotes();

	const formBody = {
		flags: 32768,
		components: [
			{
				type: 17,
				accent_color: 13595446,
				components: [
					{ type: 10, content: `**[${notes?.title}](${notes?.link})**` },
					{ type: 14, spacing: 1, divider: true },
					{ type: 10, content: (notes?.markdown ?? "New TF2 Update").length > 3997 ? `${notes?.markdown.substring(0, 3997)}...` : notes?.markdown }
				]
			}
		]
	};

	const res = await fetch(discordWebhookUrl, {
		body: JSON.stringify(formBody),
		method: "POST",
		headers,
	});

	if (!res.ok) {
		console.warn({ message: "failed to send webhook", details: await res.text() });
	}
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
			updateVersionInKv(response.required_version),
			sendWebhook()
		]));

		return true
	}

	return false
}
