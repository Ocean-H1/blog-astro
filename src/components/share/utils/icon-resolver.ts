import type { ShareProject } from "@/types/share";
import { CacheManager } from "./cache-manager";
import { fetchFaviconWithTimeout } from "./favicon-fetcher";
import { fetchGitHubRepo, isGitHubURL } from "./github-api";

export async function resolveIcon(
	project: ShareProject,
): Promise<{ type: "iconify" | "url"; value: string }> {
	if (typeof project.icon === "string") {
		if (project.icon.includes(":")) {
			return { type: "iconify", value: project.icon };
		}

		if (project.icon.startsWith("http")) {
			return { type: "url", value: project.icon };
		}

		if (project.icon.includes("/")) {
			const avatar = await fetchGitHubAvatar(project.icon);
			if (avatar) return { type: "url", value: avatar };
		}
	}

	if (typeof project.icon === "object") {
		switch (project.icon.type) {
			case "iconify":
				return { type: "iconify", value: project.icon.value };
			case "url":
				return { type: "url", value: project.icon.value };
			case "github": {
				const avatar = await fetchGitHubAvatar(project.icon.value);
				if (avatar) return { type: "url", value: avatar };
				break;
			}
			case "auto":
				break;
		}
	}

	const githubMatch = isGitHubURL(project.url);
	if (githubMatch.isGitHub && githubMatch.owner && githubMatch.repo) {
		const avatar = await fetchGitHubAvatar(
			`${githubMatch.owner}/${githubMatch.repo}`,
		);
		if (avatar) return { type: "url", value: avatar };
	}

	try {
		const favicon = await fetchFaviconWithTimeout(project.url, 3000);
		if (favicon) return { type: "url", value: favicon };
	} catch (error) {
		console.warn("Favicon fetch timeout/error:", error);
	}

	const defaultIcon = getDefaultIcon(project.url);
	if (defaultIcon) return { type: "iconify", value: defaultIcon };

	const fallback = project.fallbackIcon || "material-symbols:public";
	return { type: "iconify", value: fallback };
}

async function fetchGitHubAvatar(repo: string): Promise<string | null> {
	const [owner, repoName] = repo.split("/");
	const cacheKey = `github-avatar-${owner}-${repoName}`;

	const cached = CacheManager.get<string>(cacheKey);
	if (cached) return cached;

	try {
		const data = await fetchGitHubRepo(owner, repoName);
		if (data?.owner?.avatar_url) {
			CacheManager.set(cacheKey, data.owner.avatar_url);
			return data.owner.avatar_url;
		}
	} catch (error) {
		console.error("GitHub avatar fetch error:", error);
	}
	return null;
}

function getDefaultIcon(url: string): string | null {
	const domain = new URL(url).hostname.replace("www.", "");

	const iconMap: Record<string, string> = {
		"github.com": "fa6-brands:github",
		"stackoverflow.com": "fa6-brands:stack-overflow",
		"reddit.com": "fa6-brands:reddit",
		"twitter.com": "fa6-brands:x-twitter",
		"youtube.com": "fa6-brands:youtube",
		"medium.com": "fa6-brands:medium",
		"code.visualstudio.com": "fa6-brands:microsoft",
		"chat.openai.com": "fa6-brands:openai",
		"claude.ai": "fa6-brands:anthropic",
		"google.com": "fa6-brands:google",
		"npmjs.com": "fa6-brands:npm",
		"developer.mozilla.org": "fa6-brands:mozilla",
	};

	return iconMap[domain] || null;
}
