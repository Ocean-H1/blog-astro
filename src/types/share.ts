export interface ShareProject {
	id: string;
	title: string;
	url: string;
	desc: string;
	icon?: string | IconSource;
	fallbackIcon?: string;
	tags?: string[];
	category: string;
	featured?: boolean;
	stars?: number;
	forks?: number;
	language?: string;
	license?: string;
	githubAvatar?: string;
}

export interface IconSource {
	type: "iconify" | "url" | "github" | "auto";
	value: string;
}

export interface ShareCategory {
	id: string;
	name: string;
	icon?: string;
	description?: string;
	order?: number;
	projects: ShareProject[];
}

export type ShareLayout = "top-nav" | "sidebar" | "all-in-one";

export interface ShareConfig {
	categories: ShareCategory[];
	layout: {
		default: ShareLayout;
		columns?: number;
	};
}

export interface GitHubRepoData {
	description: string;
	stargazers_count: number;
	forks_count: number;
	language: string | null;
	license: { spdx_id: string } | null;
	owner: {
		avatar_url: string;
		login: string;
	};
}

export interface License {
	spdx_id: string;
}

export interface Owner {
	avatar_url: string;
	login: string;
}
