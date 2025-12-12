import { Collections, pb, SourcesStatusOptions, type Create, type SourcesResponse } from '$lib';

const PAGE_SIZE = 50;

class SourcesStore {
	page = $state(1);
	totalPages = $state(0);
	totalItems = $state(0);
	loading = $state(true);

	private _sources: SourcesResponse[] = $state([]);
	private userId: string | null = null;

	sources = $derived(this._sources);

	set(sources: SourcesResponse[], page: number, totalPages: number, totalItems: number) {
		this.loading = false;

		this._sources = sources;
		this.page = page;
		this.totalPages = totalPages;
		this.totalItems = totalItems;
	}

	async load(userId: string) {
		const res = await pb.collection(Collections.Sources).getList(1, PAGE_SIZE, {
			filter: `user = "${userId}"`,
			sort: '-created'
		});
		this.userId = userId;
		return res;
	}

	async loadNextPage() {
		if (this.page >= this.totalPages) return;

		this.loading = true;
		const res = await pb.collection(Collections.Sources).getList(this.page + 1, PAGE_SIZE, {
			filter: `user = "${this.userId}"`,
			sort: '-created'
		});
		this._sources = [...this._sources, ...res.items];
		this.page = res.page;
		this.totalPages = res.totalPages;
		this.totalItems = res.totalItems;
		this.loading = false;
	}

	addOptimistic(dto: Create<Collections.Sources>) {
		const source = {
			id: `temp-${Date.now()}`,
			...dto,
			status: SourcesStatusOptions.optimistic
		} as unknown as SourcesResponse;
		this._sources = [source, ...this._sources];
	}

	async subscribe(userId: string) {
		return pb.collection(Collections.Sources).subscribe(
			'*',
			(e) => {
				switch (e.action) {
					case 'create':
						this._sources = this._sources.filter((item) => !item.id.startsWith('temp-'));
						this._sources.unshift(e.record);
						break;
					case 'update':
						this._sources = this._sources.map((item) =>
							item.id === e.record.id ? e.record : item
						);
						break;
					case 'delete':
						this._sources = this._sources.filter((item) => item.id !== e.record.id);
						break;
				}
			},
			{ filter: `user = "${userId}"` }
		);
	}

	unsubscribe() {
		pb.collection(Collections.Sources).unsubscribe();
	}
}

export const sourcesStore = new SourcesStore();
