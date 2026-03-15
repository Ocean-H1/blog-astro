import React from "react";
import type { ShareProject } from "@/types/share";
import ShareCard from "./ShareCard";
import "./share.css";

interface ShareGridProps {
	projects: ShareProject[];
	columns?: number;
}

export default function ShareGrid({ projects, columns = 3 }: ShareGridProps) {
	const gridClass = `share-grid-cols-${columns}`;

	return (
		<div className={`share-grid ${gridClass}`}>
			{projects.map((project) => (
				<ShareCard key={project.id} project={project} />
			))}
		</div>
	);
}
