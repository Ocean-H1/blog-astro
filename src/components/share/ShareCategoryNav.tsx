import { Icon } from "@iconify/react";
import React, { useState } from "react";
import type { ShareCategory, ShareLayout } from "@/types/share";
import "./share.css";

interface ShareCategoryNavProps {
	categories: ShareCategory[];
	layout?: "tabs" | "sidebar" | "horizontal-scroll" | "sticky";
	position?: "top" | "left" | "bottom";
	showCount?: boolean;
	activeCategory?: string | null;
	onCategoryChange?: (categoryId: string | null) => void;
}

export default function ShareCategoryNav({
	categories,
	layout = "horizontal-scroll",
	position = "top",
	showCount = true,
	activeCategory,
	onCategoryChange,
}: ShareCategoryNavProps) {
	const [localActiveCategory, setLocalActiveCategory] = useState<string | null>(
		activeCategory || null,
	);

	const handleClick = (categoryId: string | null) => {
		setLocalActiveCategory(categoryId);
		if (onCategoryChange) {
			onCategoryChange(categoryId);
		}
	};

	return (
		<nav
			className={`share-category-nav share-nav-layout-${layout} share-nav-position-${position}`}
		>
			<button
				className={`share-nav-item ${localActiveCategory === null ? "active" : ""}`}
				onClick={() => handleClick(null)}
			>
				<Icon icon="fa6-solid:layer-group" />
				<span>全部</span>
				{showCount && (
					<span className="share-nav-count">
						{categories.reduce((sum, cat) => sum + cat.projects.length, 0)}
					</span>
				)}
			</button>
			{categories.map((category) => (
				<button
					key={category.id}
					className={`share-nav-item ${
						localActiveCategory === category.id ? "active" : ""
					}`}
					onClick={() => handleClick(category.id)}
				>
					{category.icon && <Icon icon={category.icon} />}
					<span>{category.name}</span>
					{showCount && (
						<span className="share-nav-count">{category.projects.length}</span>
					)}
				</button>
			))}
		</nav>
	);
}
