interface CacheEntry<T> {
	data: T;
	timestamp: number;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000;

export const CacheManager = {
	get<T>(key: string): T | null {
		try {
			const cached = localStorage.getItem(`share-${key}`);
			if (!cached) return null;

			const entry: CacheEntry<T> = JSON.parse(cached);
			const now = Date.now();

			if (now - entry.timestamp > CACHE_DURATION) {
				localStorage.removeItem(`share-${key}`);
				return null;
			}

			return entry.data;
		} catch (error) {
			console.warn("Cache get error:", error);
			return null;
		}
	},

	set<T>(key: string, data: T): void {
		try {
			const entry: CacheEntry<T> = {
				data,
				timestamp: Date.now(),
			};
			localStorage.setItem(`share-${key}`, JSON.stringify(entry));
		} catch (error) {
			console.warn("Cache set error:", error);
		}
	},

	clear(key?: string): void {
		if (key) {
			localStorage.removeItem(`share-${key}`);
		} else {
			Object.keys(localStorage)
				.filter((k) => k.startsWith("share-"))
				.forEach((k) => localStorage.removeItem(k));
		}
	},
};
