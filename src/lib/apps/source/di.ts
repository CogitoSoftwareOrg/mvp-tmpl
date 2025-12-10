import type { SourceApp } from './core';
import { SourceAppImpl } from './app';
import { MeiliChunksIndexer, Crawl4aiCrawler, LlamaNormilizer, BraveSearcher } from './adapters';

export const getSourceApp = (): SourceApp => {
	const searcher = new BraveSearcher();
	const normalizer = new LlamaNormilizer();
	const chunksIndexer = new MeiliChunksIndexer();
	const crawler = new Crawl4aiCrawler();

	chunksIndexer.migrate().then(() => {
		console.log('Chunks indexers migrated');
	});

	return new SourceAppImpl(searcher, normalizer, chunksIndexer, crawler);
};
