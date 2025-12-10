import type { Searcher, SearchResult } from '../../core';

const BRAVE_API_URL = 'https://api.search.brave.com/res/v1/web/search';

export class BraveSearcher implements Searcher {
	constructor() {}

	async search(query: string, limit = 10, offset = 0): Promise<SearchResult[]> {
		const queryParams = new URLSearchParams({
			q: query,
			count: limit.toString(),
			offset: this.clipOffset(offset).toString()
		});

		const response = await fetch(`${BRAVE_API_URL}?${queryParams.toString()}`);
		const data = await response.json();
		return data.web.results;
	}

	private clipOffset(offset: number): number {
		return Math.min(9, offset);
	}
}
