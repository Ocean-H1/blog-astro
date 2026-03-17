import type { GitHubRepoData } from "@/types/share";
import { CacheManager } from "./cache-manager";

export async function fetchGitHubRepo(
	owner: string,
	repo: string,
	token?: string,
): Promise<GitHubRepoData | null> {
	const cacheKey = `github-${owner}-${repo}`;

	const cached = CacheManager.get<GitHubRepoData>(cacheKey);
	if (cached) {
		console.log(`[SHARE] Cache hit for ${cacheKey}`);
		return cached;
	}

	try {
		const headers: HeadersInit = {
			Accept: "application/vnd.github.v3+json",
		};

		if (token) {
			headers["Authorization"] = `Bearer ${token}`;
		}

		const response = await fetch(
			`https://api.github.com/repos/${owner}/${repo}`,
			{
				headers,
				referrerPolicy: "no-referrer",
			},
		);

		if (!response.ok) {
			console.warn(`[SHARE] GitHub API error: ${response.status}`);
			return null;
		}

		const data: GitHubRepoData = await response.json();

		CacheManager.set(cacheKey, data);

		console.log(`[SHARE] Loaded GitHub data for ${owner}/${repo}`);
		return data;
	} catch (error) {
		console.error(`[SHARE] Fetch error for ${owner}/${repo}:`, error);
		return null;
	}
}

export function isGitHubURL(url: string): {
	isGitHub: boolean;
	owner?: string;
	repo?: string;
} {
	const match = url.match(/github\.com\/([^/]+)\/([^/]+)/);
	if (match) {
		return { isGitHub: true, owner: match[1], repo: match[2] };
	}
	return { isGitHub: false };
}

export function formatNumber(num: number): string {
	return Intl.NumberFormat("en-us", {
		notation: "compact",
		maximumFractionDigits: 1,
	})
		.format(num)
		.replaceAll("\u202f", "");
}

export function cleanDescription(desc: string): string {
	return desc?.replace(/:[a-zA-Z0-9_]+:/g, "") || "";
}
