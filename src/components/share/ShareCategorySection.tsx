import { Icon } from "@iconify/react";
import React from "react";
import type { ShareCategory } from "@/types/share";
import ShareGrid from "./ShareGrid";
import "./share.css";

interface ShareCategorySectionProps {
	category: ShareCategory;
	columns?: number;
	showHeader?: boolean;
	showDescription?: boolean;
	isVisible?: boolean;
}

export default function ShareCategorySection({
	category,
	columns = 3,
	showHeader = true,
	showDescription = true,
	isVisible = true,
}: ShareCategorySectionProps) {
	if (!isVisible) {
		return null;
	}

	return (
		<section id={`category-${category.id}`} className="share-category-section">
			{showHeader && (
				<div className="share-category-header">
					<h2 className="share-category-title">
						{category.icon && (
							<Icon icon={category.icon} className="share-category-icon" />
						)}
						{category.name}
					</h2>
					{showDescription && category.description && (
						<p className="share-category-description">{category.description}</p>
					)}
				</div>
			)}

			<ShareGrid
				projects={category.projects}
				columns={columns}
				categoryIcon={category.icon}
			/>
		</section>
	);
}
