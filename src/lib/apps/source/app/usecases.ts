import { Collections, pb, SourcesStatusOptions, type ChunksResponse } from '$lib/shared';

import type {
	Normalizer,
	AddSourceCmd,
	SourceApp,
	RemoveSourceCmd,
	SearchChunksCmd,
	ChunksIndexer,
	Crawler
} from '../core';

export class SourceAppImpl implements SourceApp {
	constructor(
		private readonly normalizer: Normalizer,
		private readonly chunksIndexer: ChunksIndexer,
		private readonly crawler: Crawler
	) {}

	async addSource(cmd: AddSourceCmd): Promise<void> {
		let file = cmd.file;

		if (cmd.mode === 'url') {
			if (!cmd.url) throw new Error('URL is required');
			const results = await this.crawler.crawl([cmd.url]);
			const md = results[0].markdown;
			file = new File([md], 'source.md', { type: 'text/markdown' });
		}

		const source = await pb.collection(Collections.Sources).create({
			userId: cmd.userId,
			file,
			title: cmd.title,
			url: cmd.url,
			status: SourcesStatusOptions.loaded
		});

		if (!file) throw new Error('File is required');
		const chunks = await this.normalizer.normalize(source, file);
		await this.chunksIndexer.add(chunks, cmd.userId);
	}

	async removeSource(cmd: RemoveSourceCmd): Promise<void> {
		await pb.collection(Collections.Sources).delete(cmd.sourceId);
	}

	async searchChunks(cmd: SearchChunksCmd): Promise<ChunksResponse[]> {
		return this.chunksIndexer.search(cmd.query, cmd.limitTokens, cmd.sourceIds, cmd.userId);
	}
}
