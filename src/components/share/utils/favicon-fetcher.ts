export async function fetchFaviconWithTimeout(
	url: string,
	timeout = 3000,
): Promise<string | null> {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeout);

	try {
		const favicon = await fetchFavicon(url, controller.signal);
		clearTimeout(timeoutId);
		return favicon;
	} catch (error) {
		clearTimeout(timeoutId);
		return null;
	}
}

async function fetchFavicon(
	url: string,
	signal?: AbortSignal,
): Promise<string | null> {
	try {
		const domain = new URL(url).hostname;

		const candidates = [
			`https://www.google.com/s2/favicons?domain=${domain}`,
			`https://favicons.githubusercontent.com/${domain}`,
			`${new URL(url).origin}/favicon.ico`,
		];

		for (const candidate of candidates) {
			try {
				const response = await fetch(candidate, {
					method: "HEAD",
					signal,
				});

				const contentType = response.headers.get("content-type");
				if (response.ok && contentType && contentType.includes("image")) {
					return candidate;
				}
			} catch (error) {}
		}

		return null;
	} catch (error) {
		console.error("Favicon fetch error:", error);
		return null;
	}
}
