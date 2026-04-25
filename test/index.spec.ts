import {
	env,
	createExecutionContext,
	waitOnExecutionContext,
} from "cloudflare:test";
import { describe, it, expect, vi, afterEach } from "vitest";
import worker from "../src/index";

const IncomingRequest = Request<unknown, IncomingRequestCfProperties>;

afterEach(() => {
	vi.unstubAllGlobals()
})

describe("tf2 update worker", () => {
	it("responds true if no kvp was present", async () => {
		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ response: { required_version: 1 } })
		})

		vi.stubGlobal('fetch', fetchMock);

		const request = new IncomingRequest("https://example.com");

		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);

		await waitOnExecutionContext(ctx);

		const data = await response.json();

		expect(data).toMatchInlineSnapshot({ update: true }, `
			{
			  "update": true,
			}
		`);

		expect(fetchMock).toHaveBeenCalledOnce()
	});

	it("responds false when no new version is available", async () => {
		await env.TF2_UPDATE.put("VERSION", "1");

		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ response: { required_version: 1 } })
		})

		vi.stubGlobal('fetch', fetchMock);

		const request = new IncomingRequest("https://example.com");

		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);

		await waitOnExecutionContext(ctx);

		const data = await response.json();

		expect(data).toMatchInlineSnapshot({ update: false }, `
			{
			  "update": false,
			}
		`);

		expect(fetchMock).toHaveBeenCalledOnce()
	});

	it("responds true when new version is available", async () => {
		await env.TF2_UPDATE.put("VERSION", "1");

		const fetchMock = vi.fn().mockResolvedValue({
			ok: true,
			json: () => Promise.resolve({ response: { required_version: 2 } })
		})

		vi.stubGlobal('fetch', fetchMock);

		const request = new IncomingRequest("https://example.com");

		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);

		await waitOnExecutionContext(ctx);

		const data = await response.json();

		expect(data).toMatchInlineSnapshot({ update: true }, `
			{
			  "update": true,
			}
		`);

		expect(fetchMock).toHaveBeenCalledOnce()
	});
});
