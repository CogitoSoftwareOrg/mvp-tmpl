import type { SourceApp } from './core';
import { SourceAppImpl } from './app';
import { UnstrcturedNormilizer, MeiliChunksIndexer, Crawl4aiCrawler } from './adapters';

export const getSourceApp = (): SourceApp => {
	const normalizer = new UnstrcturedNormilizer();
	const chunksIndexer = new MeiliChunksIndexer();
	const crawler = new Crawl4aiCrawler();

	chunksIndexer.migrate().then(() => {
		console.log('Chunks indexers migrated');
	});

	return new SourceAppImpl(normalizer, chunksIndexer, crawler);
};
