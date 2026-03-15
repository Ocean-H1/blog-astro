import { Icon } from "@iconify/react";
import React, { useState } from "react";
import type { ShareConfig, ShareLayout, ShareProject } from "@/types/share";
import ShareCard from "./ShareCard";
import ShareCategoryNav from "./ShareCategoryNav";
import ShareCategorySection from "./ShareCategorySection";
import "./share.css";

interface SharePageProps {
	data: ShareConfig;
	layout?: ShareLayout;
	showFeatured?: boolean;
}

export default function SharePage({
	data,
	layout,
	showFeatured = false,
}: SharePageProps) {
	const [activeCategory, setActiveCategory] = useState<string | null>(null);
	const effectiveLayout = layout || data.layout.default;
	const columns = data.layout.columns || 3;

	const featuredProjects = data.categories
		.flatMap((cat) => cat.projects.filter((p) => p.featured))
		.slice(0, 6);

	const handleCategoryChange = (categoryId: string | null) => {
		setActiveCategory(categoryId);
	};

	return (
		<div className="share-page-wrapper">
			{/* 导航栏 */}
			<ShareCategoryNav
				categories={data.categories}
				layout={
					effectiveLayout === "sidebar"
						? "sidebar"
						: effectiveLayout === "all-in-one"
							? "tabs"
							: "horizontal-scroll"
				}
				position={effectiveLayout === "sidebar" ? "left" : "top"}
				showCount={true}
				activeCategory={activeCategory}
				onCategoryChange={handleCategoryChange}
			/>

			{/* 精选项目 */}
			{showFeatured &&
				featuredProjects.length > 0 &&
				activeCategory === null && (
					<section className="share-featured-section">
						<div className="share-category-header">
							<div className="share-category-title-row">
								<h2 className="share-category-title">
									<Icon icon="fa6-solid:star" className="share-category-icon" />
									精选项目
								</h2>
							</div>
						</div>
						<div className={`share-grid share-grid-cols-${columns}`}>
							{featuredProjects.map((project) => (
								<ShareCard
									key={project.id}
									project={project}
									showTags={true}
									showMeta={true}
								/>
							))}
						</div>
					</section>
				)}

			{/* 各分类区块 */}
			{data.categories.map((category) => (
				<ShareCategorySection
					key={category.id}
					category={category}
					columns={columns}
					showHeader={effectiveLayout !== "sidebar"}
					showDescription={true}
					isVisible={activeCategory === null || activeCategory === category.id}
				/>
			))}
		</div>
	);
}
