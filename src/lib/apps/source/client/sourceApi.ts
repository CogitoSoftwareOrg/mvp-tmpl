import { Collections, pb, type Create } from '$lib';

import { sourcesStore } from './sources.svelte';

export class SourceApi {
	async addSource(dto: Create<Collections.Sources>) {
		sourcesStore.addOptimistic(dto);
		const source = await pb.collection(Collections.Sources).create(dto);
		return source;
	}
}

export const sourceApi = new SourceApi();
