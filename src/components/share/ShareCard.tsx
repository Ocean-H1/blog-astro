import { Icon } from "@iconify/react";
import type React from "react";
import { useEffect, useState } from "react";
import type { ShareProject } from "@/types/share";
import {
	cleanDescription,
	fetchGitHubRepo,
	formatNumber,
	isGitHubURL,
} from "./utils/github-api";
import { resolveIcon } from "./utils/icon-resolver";
import "./share.css";

interface ShareCardProps {
	project: ShareProject;
	size?: "small" | "medium" | "large";
	showTags?: boolean;
	showMeta?: boolean;
	categoryIcon?: string;
}

export default function ShareCard({
	project,
	size = "medium",
	showTags = true,
	showMeta = true,
	categoryIcon,
}: ShareCardProps) {
	const [githubData, setGithubData] = useState<any>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(false);
	const [iconResult, setIconResult] = useState<{
		type: string;
		value: string;
	} | null>(null);
	const [useCategoryIcon, setUseCategoryIcon] = useState(false);

	useEffect(() => {
		const githubMatch = isGitHubURL(project.url);
		const hasIcon = project.icon !== undefined;

		if (githubMatch.isGitHub && githubMatch.owner && githubMatch.repo) {
			setLoading(true);
			fetchGitHubRepo(githubMatch.owner, githubMatch.repo)
				.then((data) => {
					if (data) {
						setGithubData(data);
						setError(false);
					} else {
						setError(true);
					}
				})
				.catch(() => setError(true))
				.finally(() => setLoading(false));
		}

		if (hasIcon) {
			setUseCategoryIcon(false);
			resolveIcon(project).then(setIconResult);
		} else if (githubMatch.isGitHub) {
			setUseCategoryIcon(false);
			resolveIcon(project).then(setIconResult);
		} else {
			setUseCategoryIcon(true);
			setIconResult(null);
		}
	}, [project]);

	const displayTitle = project.title;
	const displayDesc = githubData
		? cleanDescription(githubData.description)
		: project.desc;
	const displayStars =
		project.stars ||
		(githubData?.stargazers_count
			? formatNumber(githubData.stargazers_count)
			: undefined);
	const displayForks =
		project.forks ||
		(githubData?.forks_count
			? formatNumber(githubData.forks_count)
			: undefined);
	const displayLicense =
		project.license || githubData?.license?.spdx_id || undefined;
	const displayLanguage = project.language || githubData?.language || undefined;

	const isGitHub = isGitHubURL(project.url).isGitHub;

	return (
		<a
			href={project.url}
			target="_blank"
			rel="noopener noreferrer"
			className={`share-card ${loading ? "fetch-waiting" : ""} ${error ? "fetch-error" : ""}`}
			style={
				{
					"--card-size":
						size === "small"
							? "0.875rem"
							: size === "large"
								? "1.125rem"
								: "1rem",
				} as React.CSSProperties
			}
		>
			<div className="share-titlebar">
				<div className="share-titlebar-left">
					<div className="share-icon">
						{useCategoryIcon && categoryIcon ? (
							<Icon icon={categoryIcon} />
						) : iconResult?.type === "iconify" ? (
							<Icon icon={iconResult.value} />
						) : iconResult?.type === "url" ? (
							<img
								src={iconResult.value}
								alt={project.title}
								className="share-icon-img"
							/>
						) : categoryIcon ? (
							<Icon icon={categoryIcon} />
						) : (
							<Icon icon="material-symbols:public" />
						)}
					</div>

					<div className="share-title">{displayTitle}</div>
				</div>

				{isGitHub && (
					<div className="share-github-logo">
						<Icon icon="fa6-brands:github" />
					</div>
				)}
			</div>

			<div className="share-description">
				{loading ? "Loading..." : displayDesc}
			</div>

			{showMeta && (
				<div className="share-infobar">
					{displayStars && (
						<div className="share-meta-item share-stars">
							<Icon icon="fa6-solid:star" />
							<span>{displayStars}</span>
						</div>
					)}

					{displayForks && (
						<div className="share-meta-item share-forks">
							<Icon icon="fa6-solid:code-fork" />
							<span>{displayForks}</span>
						</div>
					)}

					{displayLicense && (
						<div className="share-meta-item share-license">
							<Icon icon="fa6-solid:balance-scale" />
							<span>{displayLicense}</span>
						</div>
					)}

					{displayLanguage && (
						<div className="share-meta-item share-language">
							<Icon icon="fa6-solid:code" />
							<span>{displayLanguage}</span>
						</div>
					)}
				</div>
			)}

			{showTags && project.tags && project.tags.length > 0 && (
				<div className="share-tags">
					{project.tags.map((tag) => (
						<span key={tag} className="share-tag">
							{tag}
						</span>
					))}
				</div>
			)}
		</a>
	);
}
