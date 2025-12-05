import type { ChunksResponse } from '$lib';

export type AddSourceCmd = {
	userId: string;
	mode: 'file' | 'url';
	file?: File;
	title?: string;
	url?: string;
};

export type RemoveSourceCmd = {
	userId: string;
	sourceId: string;
};

export type SearchChunksCmd = {
	userId: string;
	sourceIds: string[];
	query: string;
	limitTokens: number;
};

export interface SourceApp {
	addSource(cmd: AddSourceCmd): Promise<void>;
	removeSource(cmd: RemoveSourceCmd): Promise<void>;

	searchChunks(cmd: SearchChunksCmd): Promise<ChunksResponse[]>;
}
