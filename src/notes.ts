import { parseFeed } from "htmlparser2";
import { NodeHtmlMarkdown } from "node-html-markdown";

const TF2_UPDATE_RSS_URL = "https://www.teamfortress.com/rss.xml";

export async function getLatestPatchNotes() {
	const fetchResponse = await fetch(TF2_UPDATE_RSS_URL);
	const feed = await fetchResponse.text();

	const xml = parseFeed(feed, { xmlMode: true });

	const notes = xml?.items[0];

	const updateNotes = notes?.description;

	if (updateNotes == null) {
		return null;
	}

	const markdown = NodeHtmlMarkdown.translate(updateNotes);

	return { title: notes?.title, link: notes?.link, markdown };
}
